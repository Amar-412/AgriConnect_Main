import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const FloatingMiniCart = ({ onCheckout }) => {
  const { user } = useAuth();
  const { cartByUserId, updateCartItemQuantity, removeFromCart, products, getCartItemWithDetails } = useData();
  const [open, setOpen] = useState(false);
  
  const userId = user ? (user.id || user.userId || user.email) : null;
  const userCart = userId ? (cartByUserId[userId] || cartByUserId[user.id] || []) : [];
  
  // Get full cart items with product details (optimized cart only stores productId + quantity)
  const cartWithProducts = useMemo(() => {
    if (!userCart.length) return [];
    
    if (getCartItemWithDetails) {
      return userCart.map(item => getCartItemWithDetails(item));
    }
    
    // Fallback: lookup from products
    return userCart.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return {
          ...item,
          productName: 'Unknown Product',
          productImage: null,
          price: 0
        };
      }
      return {
        ...item,
        productName: product.name || '',
        productImage: product.image || product.imageDataUrl || null,
        price: Number(product.price || 0)
      };
    });
  }, [userCart, products, getCartItemWithDetails]);
  
  const subtotal = useMemo(() => 
    cartWithProducts.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0), 0), 
    [cartWithProducts]
  );

  return (
    <>
      <button
        onClick={() => setOpen((s) => !s)}
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          width: 56,
          height: 56,
          borderRadius: '50%',
          boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
          background: '#16a34a',
          color: '#fff',
          border: 'none',
          fontWeight: 700,
          cursor: 'pointer',
          zIndex: 1000,
        }}
        aria-label="Open cart"
      >
        🛒{userCart.length}
      </button>
      {open && (
        <div
          style={{
            position: 'fixed',
            right: 16,
            bottom: 84,
            width: 320,
            maxHeight: 420,
            overflow: 'auto',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
            padding: 12,
            zIndex: 1000,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>My Cart</div>
          {userCart.length === 0 ? (
            <div style={{ color: '#666', textAlign: 'center', padding: '20px 0' }}>Your cart is empty</div>
          ) : (
            <>
              {cartWithProducts.map((item) => (
                <div key={item.productId} style={{ 
                  display: 'flex', 
                  gap: 12, 
                  alignItems: 'center', 
                  padding: '12px 0', 
                  borderBottom: '1px solid #f1f1f1' 
                }}>
                  {/* Product Image */}
                  <div style={{ flexShrink: 0 }}>
                    {item.productImage ? (
                      <img 
                        src={item.productImage} 
                        alt={item.productName}
                        style={{ 
                          width: 60, 
                          height: 60, 
                          objectFit: 'cover', 
                          borderRadius: 8,
                          border: '1px solid #e1e1e1'
                        }} 
                      />
                    ) : (
                      <div style={{ 
                        width: 60, 
                        height: 60, 
                        background: '#f5f5f5', 
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666',
                        fontSize: '12px',
                        border: '1px solid #e1e1e1'
                      }}>
                        No Image
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: '14px',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.productName}
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: '8px' }}>
                      ₹{Number(item.price || 0).toLocaleString('en-IN')} each
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: '4px' }}>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => user && updateCartItemQuantity(userId, item.productId, e.target.value)}
                        style={{ 
                          width: 50, 
                          padding: '4px 6px', 
                          borderRadius: 6, 
                          border: '1px solid #ddd',
                          fontSize: '12px',
                          textAlign: 'center'
                        }}
                      />
                      <button 
                        onClick={() => user && removeFromCart(userId, item.productId)} 
                        style={{ 
                          padding: '4px 8px', 
                          fontSize: '11px',
                          background: '#ff6b6b',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  {/* Total Price */}
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: '14px',
                    color: '#2c3e50',
                    textAlign: 'right',
                    minWidth: '60px'
                  }}>
                    ₹{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontWeight: 700 }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <button onClick={onCheckout} style={{ marginTop: 10, width: '100%', padding: '10px 12px', background: '#16a34a', color: '#fff', borderRadius: 8, border: 'none' }} disabled={!user || userCart.length === 0}>
                Go to Cart
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingMiniCart;


