import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { createInvoiceFromItems, formatCurrency, formatInvoiceDate } from '../utils/invoiceUtils';
import './Checkout.css';

const CartView = ({ onProceedToBilling, onContinueShopping }) => {
  const { user } = useAuth();
  const { cartByUserId, products, getCartItemWithDetails } = useData();

  const cartItems = useMemo(() => {
    if (!user) return [];
    const userId = user.id || user.userId || user.email;
    const userCart = cartByUserId[userId] || cartByUserId[user.id] || [];
    
    // Use optimized cart lookup - cart only stores productId + quantity
    return userCart.map((cartItem) => {
      if (getCartItemWithDetails) {
        return getCartItemWithDetails(cartItem);
      }
      
      // Fallback: lookup from products array
      const product = products.find((p) => p.id === cartItem.productId);
      if (!product) {
        return {
          productId: cartItem.productId,
          quantity: Number(cartItem.quantity || 1),
          name: 'Unknown Product',
          price: 0,
          productName: 'Unknown Product',
          productImage: null,
          farmerId: '',
          farmerEmail: '',
          farmerName: ''
        };
      }
      
      return {
        productId: cartItem.productId,
        quantity: Number(cartItem.quantity || 1),
        name: product.name || '',
        price: Number(product.price || 0),
        productName: product.name || '',
        productImage: product.image || product.imageDataUrl || null,
        farmerId: product.farmerId || product.ownerId || '',
        farmerEmail: product.farmerEmail || '',
        farmerName: product.farmerName || ''
      };
    });
  }, [user, cartByUserId, products, getCartItemWithDetails]);

  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  }, [cartItems]);

  const handleProceed = () => {
    if (!cartItems.length) {
      window.alert('Your cart is empty.');
      return;
    }
    const invoice = createInvoiceFromItems(cartItems, {
      buyerId: user?.id || user?.userId || user?.email,
      buyerName: user?.name,
      createdAt: new Date().toISOString(),
    });
    onProceedToBilling?.(invoice);
  };

  if (!user) {
    return (
      <div className="checkout-wrapper">
        <div className="checkout-panel">
          <div className="empty-state">Please sign in to view your cart.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-wrapper">
      <div className="checkout-panel">
        <div className="checkout-header">
          <h2>My Cart</h2>
          <span>Review your selected items before completing the purchase.</span>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-state">
            Your cart is empty. Add products from the marketplace to get started.
          </div>
        ) : (
          <>
            <table className="checkout-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Details</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => {
                  const subtotal = Number(item.price || 0) * Number(item.quantity || 0);
                  return (
                    <tr key={item.productId}>
                      <td>
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} className="checkout-thumb" />
                        ) : (
                          <div className="checkout-thumb fallback">No Image</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.productName}</div>
                        <div style={{ fontSize: 13, opacity: 0.75 }}>
                          ₹{Number(item.price || 0).toLocaleString('en-IN')} · Added on {formatInvoiceDate(item.createdAt || item.addedAt || new Date())}
                        </div>
                      </td>
                      <td>{item.quantity}</td>
                      <td>₹{formatCurrency(subtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="checkout-footer">
              <div className="checkout-total">Total: ₹{formatCurrency(totalAmount)}</div>
              <div className="checkout-actions">
                <button className="checkout-button secondary" type="button" onClick={onContinueShopping}>
                  Continue Shopping
                </button>
                <button className="checkout-button primary" type="button" onClick={handleProceed}>
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartView;


