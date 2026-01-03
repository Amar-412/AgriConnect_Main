import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { orderService } from '../../services/orderService';
import { downloadInvoicePdf, formatCurrency, formatInvoiceDate } from '../utils/invoiceUtils';
import './Checkout.css';

const BillingView = ({ invoice, onPaymentSuccess, onBackToCart }) => {
  const { user, allUsers } = useAuth();
  const { clearCart, products } = useData();
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState('Review your billing details before completing payment.');
  const [error, setError] = useState('');

  const items = useMemo(() => invoice?.items || [], [invoice]);

  useEffect(() => {
    setError('');
    setStatus('Review your billing details before completing payment.');
    setProcessing(false);
  }, [invoice?.invoiceNo]);

  const handleDownload = () => {
    if (!invoice) return;
    downloadInvoicePdf(invoice);
  };

  const handlePayment = () => {
    if (!invoice || !user) return;
    
    // Validate all cart items have required fields
    const validationErrors = [];
    items.forEach((item, index) => {
      if (!item.productId) {
        validationErrors.push(`Item ${index + 1}: Missing productId`);
      }
      if (!item.name && !item.productName) {
        validationErrors.push(`Item ${index + 1}: Missing name`);
      }
      const price = Number(item.price);
      const quantity = Number(item.quantity);
      
      if (isNaN(price) || price <= 0) {
        validationErrors.push(`Item ${index + 1}: Invalid price`);
      }
      if (isNaN(quantity) || quantity <= 0) {
        validationErrors.push(`Item ${index + 1}: Invalid quantity`);
      }
      if (!item.farmerId || !item.farmerEmail) {
        // Try to get from product if missing
        const product = products.find(p => p.id === item.productId);
        if (!product || !product.farmerEmail) {
          validationErrors.push(`Item ${index + 1}: Missing farmer information`);
        }
      }
    });
    
    if (validationErrors.length > 0) {
      setError(`Validation failed: ${validationErrors.join(', ')}`);
      setProcessing(false);
      return;
    }
    
    setProcessing(true);
    setError('');
    setStatus('Processing payment...');

    // Process order via backend API
    const processOrder = async () => {
      try {
        // Convert all prices and quantities to Number
        const normalizedItems = items.map(item => {
          // Get farmer info from item first, then fallback to product
          let farmerId = item.farmerId || '';
          
          if (!farmerId && item.productId) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
              farmerId = product.farmerId || product.ownerId || '';
            }
          }
          
          return {
            productId: item.productId,
            quantity: Number(item.quantity || 0),
            price: Number(item.price || 0), // Price at purchase time
            farmerId: farmerId, // Backend will validate farmer exists
          };
        });

        // Get backend-verified buyer ID
        const buyerId = user.id || user.userId || user.email || '';
        if (!buyerId) {
          throw new Error('User identity not available');
        }

        // Place order via backend API
        // Backend will:
        // - Validate buyer is BUYER role
        // - Validate products exist
        // - Validate farmers exist
        // - Create Order and OrderItems
        // - Capture priceAtPurchase for each item
        // - Compute totalAmount
        const orderResult = await orderService.placeOrder({
          buyerId: buyerId,
          items: normalizedItems,
        });

        // Order successfully created in backend
        // Now clear cart (only after successful backend response)
        const userId = user.id || user.userId || user.email;
        clearCart(userId);
        
        const completedInvoice = {
          ...invoice,
          paidAt: new Date().toISOString(),
          orderId: orderResult.id || orderResult.orderId, // Backend-provided order ID
        };
        
        setStatus('Purchase Successful!');
        onPaymentSuccess?.(completedInvoice);
      } catch (err) {
        console.error('[Billing] Payment processing error:', err);
        setError(err.message || 'Payment failed. Please try again.');
        setProcessing(false);
        setStatus('We could not complete the payment.');
        // Do NOT clear cart on error
      }
    };

    // Add small delay for UI feedback (processing state)
    setTimeout(() => {
      processOrder();
    }, 500);
  };

  if (!invoice) {
    return (
      <div className="checkout-wrapper">
        <div className="checkout-panel">
          <div className="empty-state">
            The billing session expired. Please return to your cart and try again.
          </div>
          <div className="checkout-actions" style={{ justifyContent: 'center', marginTop: 24 }}>
            <button className="checkout-button primary" type="button" onClick={onBackToCart}>
              Return to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-wrapper">
      <div className="checkout-panel">
        <div className="checkout-header">
          <h2>Billing Summary</h2>
          <span>Invoice {invoice.invoiceNo} · {formatInvoiceDate(invoice.date)}</span>
        </div>

        <table className="checkout-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`${item.productId}-${item.name}`}>
                <td>{item.name}</td>
                <td>₹{formatCurrency(item.price)}</td>
                <td>{item.quantity}</td>
                <td>₹{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="checkout-footer" style={{ marginBottom: 12 }}>
          <div className="checkout-total">Total Amount: ₹{formatCurrency(invoice.totalAmount)}</div>
          <div className="checkout-actions">
            <button className="checkout-button secondary" type="button" onClick={handleDownload}>
              Download Invoice (Preview)
            </button>
            <button
              className="checkout-button primary"
              type="button"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? 'Processing…' : 'Buy Now'}
            </button>
          </div>
        </div>

        <div className="checkout-status">
          {error ? <span style={{ color: '#f87171' }}>{error}</span> : status}
        </div>
      </div>
    </div>
  );
};

export default BillingView;


