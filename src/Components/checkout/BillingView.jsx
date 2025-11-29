import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
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

    setTimeout(() => {
      try {
        // Convert all prices and quantities to Number
        const normalizedItems = items.map(item => {
          // Get farmer info from item first, then fallback to product
          let farmerId = item.farmerId || '';
          let farmerEmail = item.farmerEmail || '';
          let farmerName = item.farmerName || '';
          
          if (!farmerEmail && item.productId) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
              farmerId = product.farmerId || product.ownerId || '';
              farmerEmail = product.farmerEmail || '';
              farmerName = product.farmerName || '';
            }
          }
          
          // Last resort: try to find from allUsers
          if (!farmerEmail && item.productId) {
            const product = products.find(p => p.id === item.productId);
            if (product && product.ownerId) {
              const farmerUser = allUsers.find(u => u.id === product.ownerId || u.email === product.ownerId);
              if (farmerUser) {
                farmerEmail = farmerUser.email || '';
                farmerName = farmerUser.name || '';
                farmerId = farmerUser.email || farmerUser.id || '';
              }
            }
          }
          
          return {
            productId: item.productId,
            name: item.name || item.productName || 'Unknown Product',
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 0),
            farmerId,
            farmerEmail,
            farmerName
          };
        });
        
        // Group items by farmer (handle multiple farmers per cart)
        const itemsByFarmer = {};
        normalizedItems.forEach(item => {
          const farmerKey = item.farmerEmail || item.farmerId || 'unknown';
          if (!itemsByFarmer[farmerKey]) {
            itemsByFarmer[farmerKey] = {
              farmerId: item.farmerId || '',
              farmerEmail: item.farmerEmail || '',
              farmerName: item.farmerName || 'Unknown Farmer',
              items: []
            };
          }
          itemsByFarmer[farmerKey].items.push(item);
        });
        
        // Create separate transaction for each farmer
        const timestamp = Date.now();
        const invoiceId = invoice?.invoiceNo || `INV_${timestamp}`;
        const buyerId = user.userId || user.email || user.id || '';
        const buyerEmail = user.email || buyerId;
        const buyerName = user.name || 'Unknown Buyer';
        
        const newTransactions = [];
        Object.values(itemsByFarmer).forEach((farmerData, index) => {
          const transactionId = `TXN_${timestamp}_${index}`;
          
          // Compute total for this farmer's items
          const farmerTotal = farmerData.items.reduce(
            (sum, i) => sum + Number(i.price) * Number(i.quantity),
            0
          );
          
          const newTransaction = {
            transactionId,
            invoiceId,
            buyerId,
            buyerEmail,
            buyerName,
            farmerId: farmerData.farmerId,
            farmerEmail: farmerData.farmerEmail,
            farmerName: farmerData.farmerName,
            items: farmerData.items,
            total: farmerTotal,
            status: "Completed",
            date: new Date().toISOString(),
            paymentMethod: 'Billing Dashboard'
          };
          
          newTransactions.push(newTransaction);
        });
        
        // Write all transactions to localStorage.transactions
        const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        existingTransactions.push(...newTransactions);
        localStorage.setItem('transactions', JSON.stringify(existingTransactions));
        
        // THEN clear cart
        const userId = user.id || user.userId || user.email;
        clearCart(userId);
        
        const completedInvoice = {
          ...invoice,
          paidAt: new Date().toISOString(),
        };
        
        setStatus('Purchase Successful!');
        onPaymentSuccess?.(completedInvoice);
      } catch (err) {
        console.error('[Billing] Payment processing error:', err);
        setError('Payment failed. Please try again.');
        setProcessing(false);
        setStatus('We could not complete the payment.');
        // Do NOT clear cart on error
      }
    }, 1000);
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


