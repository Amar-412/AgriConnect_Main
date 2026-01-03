import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { orderService } from '../../services/orderService';
import BuyerSearchBar from '../ui/BuyerSearchBar';
import ProductGrid from '../ui/ProductGrid';
import FloatingMiniCart from '../ui/FloatingMiniCart';
import ReviewPopup from '../ui/ReviewPopup';
import ProductPopup from '../ui/ProductPopup';
import { createInvoiceFromItems } from '../utils/invoiceUtils';

const BuyerDashboard = ({ onBuyNowSingleItem, onOpenCart }) => {
  const { user, allUsers } = useAuth();
  const { products, reviews, messages, addReview, addToCart, sendMessage } = useData();
  const [quantityById, setQuantityById] = useState({});
  const [filters, setFilters] = useState({ category: '', min: '', max: '', location: '' });
  const [search, setSearch] = useState({ query: '', by: 'all' });
  const [reviewProduct, setReviewProduct] = useState(null);
  const [popupProduct, setPopupProduct] = useState(null);
  const [showPurchases, setShowPurchases] = useState(false);
  const [purchases, setPurchases] = useState([]);

  const handleOrder = (product) => {
    if (!user) return;
    const rawQuantity = Number(quantityById[product.id] || 1);
    const quantity = rawQuantity > 0 ? rawQuantity : 1;
    const invoice = createInvoiceFromItems(
      [
        {
          productId: product.id,
          productName: product.name,
          name: product.name,
          price: Number(product.price || 0),
          quantity,
          productImage: product.imageDataUrl || product.image || null,
          farmerId: product.farmerId || product.ownerId || '',
          farmerEmail: product.farmerEmail || '',
          farmerName: product.farmerName || product.ownerName || '',
        },
      ],
      {
        buyerId: user.id || user.userId || user.email,
        buyerName: user.name,
      }
    );
    setQuantityById((prev) => ({ ...prev, [product.id]: '' }));
    onBuyNowSingleItem?.(invoice);
  };

  const idToName = useMemo(() => Object.fromEntries((allUsers || []).map((u) => [u.id, u.name])), [allUsers]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const byText = String(search.query || '').toLowerCase();
      if (byText) {
        const matchesName = String(p.name || '').toLowerCase().includes(byText);
        const matchesCategory = String(p.category || '').toLowerCase().includes(byText);
        const farmerName = String(idToName[p.ownerId] || '').toLowerCase();
        const matchesFarmer = farmerName.includes(byText);
        const ok = search.by === 'name' ? matchesName : search.by === 'category' ? matchesCategory : search.by === 'farmer' ? matchesFarmer : (matchesName || matchesCategory || matchesFarmer);
        if (!ok) return false;
      }
      if (filters.category && String(p.category || '').toLowerCase().indexOf(filters.category.toLowerCase()) === -1) return false;
      if (filters.location && String(p.location || '').toLowerCase().indexOf(filters.location.toLowerCase()) === -1) return false;
      const price = Number(p.price || 0);
      if (filters.min && price < Number(filters.min)) return false;
      if (filters.max && price > Number(filters.max)) return false;
      return true;
    });
  }, [products, filters, search, idToName]);

  const handleAddToCart = (p) => {
    if (!user) return;
    const userId = user.id || user.userId || user.email;
    const quantity = Math.max(1, Number(quantityById[p.id] || 1));
    
    // Add with unified schema: productId, name, price, quantity, farmerId, farmerEmail, farmerName, image
    const cartItem = {
      productId: p.id,
      name: p.name,
      price: Number(p.price || 0),
      quantity,
      farmerId: p.farmerId || p.ownerId || '',
      farmerEmail: p.farmerEmail || '',
      farmerName: p.farmerName || p.ownerName || '',
      image: p.image || p.imageDataUrl || '',
      // Keep for backward compatibility
      productName: p.name,
      addedAt: new Date().toISOString()
    };
    
    addToCart(userId, cartItem, p);
  };

  const handleCheckout = () => {
    onOpenCart?.();
  };

  const handleReview = (product) => {
    setReviewProduct(product);
  };

  const handleSubmitReview = async (reviewData) => {
    if (!user) return;
    try {
      await addReview({
        productId: reviewData.productId,
        farmerId: reviewProduct.ownerId || reviewProduct.farmerId,
        buyerId: user.id || user.userId || user.email, // Backend-verified buyer ID
        buyerName: user.name,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      setReviewProduct(null);
    } catch (error) {
      console.error('[BuyerDashboard] Error submitting review:', error);
      // Display backend error message if available, otherwise generic message
      const errorMessage = error.message || 'Failed to submit review. Please try again.';
      alert(errorMessage);
    }
  };

  useEffect(() => {
    if (showPurchases && user) {
      const loadPurchases = async () => {
        try {
          const buyerId = user.id || user.userId || user.email || '';
          if (!buyerId) return;

          // Fetch orders from backend API
          const buyerOrders = await orderService.getBuyerOrders(buyerId);
          
          // Transform backend orders to match UI format
          // Backend returns orders with order items
          const transformedPurchases = (buyerOrders || []).map(order => {
            const orderItems = order.orderItems || order.items || [];
            const orderDate = order.orderDate || order.createdAt || new Date().toISOString();
            
            // If single item, use order total; otherwise show per-item
            if (orderItems.length === 1) {
              return {
                transactionId: order.id || order.orderId || '',
                invoiceId: order.id || order.orderId || '',
                buyerId: order.buyer?.id || order.buyerId || buyerId,
                buyerEmail: user.email || '',
                buyerName: user.name || '',
                farmerId: orderItems[0]?.farmer?.id || orderItems[0]?.farmerId || '',
                farmerEmail: orderItems[0]?.farmer?.email || orderItems[0]?.farmerEmail || '',
                farmerName: orderItems[0]?.farmer?.name || orderItems[0]?.farmerName || '',
                items: [{
                  productId: orderItems[0]?.product?.id || orderItems[0]?.productId || '',
                  name: orderItems[0]?.product?.name || 'Unknown Product',
                  price: Number(orderItems[0]?.priceAtPurchase || orderItems[0]?.price || 0),
                  quantity: Number(orderItems[0]?.quantity || 0),
                }],
                total: Number(order.totalAmount || order.total || 0),
                status: order.orderStatus || 'PLACED',
                date: orderDate,
              };
            } else {
              // Multiple items - return order with all items
              return {
                transactionId: order.id || order.orderId || '',
                invoiceId: order.id || order.orderId || '',
                buyerId: order.buyer?.id || order.buyerId || buyerId,
                buyerEmail: user.email || '',
                buyerName: user.name || '',
                items: orderItems.map(item => ({
                  productId: item?.product?.id || item?.productId || '',
                  name: item?.product?.name || 'Unknown Product',
                  price: Number(item?.priceAtPurchase || item?.price || 0),
                  quantity: Number(item?.quantity || 0),
                })),
                total: Number(order.totalAmount || order.total || 0),
                status: order.orderStatus || 'PLACED',
                date: orderDate,
              };
            }
          });
          
          setPurchases(transformedPurchases);
        } catch (error) {
          console.error('[BuyerDashboard] Error loading purchases:', error);
          // Fallback to empty array on error
          setPurchases([]);
        }
      };
      
      loadPurchases();
      
      // Refresh purchases periodically when popup is open
      const interval = setInterval(loadPurchases, 3000);
      return () => clearInterval(interval);
    }
  }, [showPurchases, user]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Marketplace</h2>
        {user && (
          <button
            onClick={() => setShowPurchases(true)}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(90deg, #1fa751, #2ba8ff)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(31, 167, 81, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🧾 My Purchases
          </button>
        )}
      </div>
      <BuyerSearchBar value={search} onChange={setSearch} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
        <input placeholder="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
        <input placeholder="Location" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
        <input placeholder="Min price" type="number" value={filters.min} onChange={(e) => setFilters({ ...filters, min: e.target.value })} />
        <input placeholder="Max price" type="number" value={filters.max} onChange={(e) => setFilters({ ...filters, max: e.target.value })} />
      </div>
      <ProductGrid
        products={filtered.map((p) => ({ 
          ...p, 
          ownerName: p.farmerName || idToName[p.farmerId] || idToName[p.ownerId] || idToName[p.farmerEmail] || 'Unknown',
          farmerName: p.farmerName || idToName[p.farmerId] || idToName[p.ownerId] || idToName[p.farmerEmail] || 'Unknown'
        }))}
        quantityById={quantityById}
        setQuantityById={setQuantityById}
        onAddToCart={handleAddToCart}
        onOrder={handleOrder}
        onImageClick={(p) => setPopupProduct(p)}
        onReview={handleReview}
        isLoggedIn={!!user}
      />
      <FloatingMiniCart onCheckout={handleCheckout} />
      
      {/* Review Popup */}
      {reviewProduct && (
        <ReviewPopup
          product={reviewProduct}
          onClose={() => setReviewProduct(null)}
          onSubmit={handleSubmitReview}
        />
      )}

      {/* Product Popup (Reviews & Messages) */}
      {popupProduct && (
        <ProductPopup
          product={popupProduct}
          user={user}
          reviews={reviews}
          messages={messages}
          onClose={() => setPopupProduct(null)}
          onSendMessage={async (messageData) => {
            try {
              await sendMessage(messageData);
            } catch (error) {
              console.error('[BuyerDashboard] Error sending message:', error);
              alert('Failed to send message. Please try again.');
            }
          }}
        />
      )}

      {/* My Purchases Popup */}
      {showPurchases && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowPurchases(false)}
        >
          <div
            style={{
              background: '#111',
              color: '#fff',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 0 10px rgba(255,255,255,0.1)',
              width: '80%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ 
              marginTop: 0, 
              marginBottom: '20px',
              background: 'linear-gradient(90deg, rgb(0, 110, 255) 0%, rgb(39, 250, 2) 25%, rgb(0, 217, 255) 50%, rgb(127, 255, 16) 75%, rgb(30, 255, 0) 100%)',
              backgroundSize: '200% auto',
              color: 'transparent',
              backgroundClip: 'text',
              animation: 'textAnimate 10s cubic-bezier(0.25, 0.1, 0.25, 1) infinite'
            }}>
              My Purchases
            </h2>
            {purchases.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', padding: '40px 0' }}>
                No purchases yet.
              </p>
            ) : (
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
                className="purchases-table"
              >
                <thead>
                  <tr style={{ background: 'rgba(94, 237, 58, 0.2)' }}>
                    <th style={{ 
                      color: '#5eed3a', 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      Product
                    </th>
                    <th style={{ 
                      color: '#5eed3a', 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      Qty
                    </th>
                    <th style={{ 
                      color: '#5eed3a', 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      Total
                    </th>
                    <th style={{ 
                      color: '#5eed3a', 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      Date
                    </th>
                    <th style={{ 
                      color: '#5eed3a', 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      Status / Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.flatMap((tx) => {
                    // Flatten transactions to show each item separately
                    const items = tx.items || [];
                    if (items.length === 0) {
                      const currentStatus = (tx.status || 'PLACED').toUpperCase();
                      const getStatusColor = (status) => {
                        const s = status.toUpperCase();
                        if (s === 'PLACED') return '#ffa500';
                        if (s === 'ACCEPTED') return '#2196f3';
                        if (s === 'SHIPPED') return '#9c27b0';
                        if (s === 'COMPLETED') return '#5eed3a';
                        if (s === 'CANCELLED') return '#f44336';
                        return 'rgba(255, 255, 255, 0.8)';
                      };
                      
                      return [(
                        <tr key={tx.transactionId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          <td style={{ padding: '12px', color: 'white' }}>N/A</td>
                          <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>N/A</td>
                          <td style={{ padding: '12px', color: '#5eed3a', fontWeight: '600' }}>
                            ₹{Number(tx.total || 0).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                            {tx.date ? new Date(tx.date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{
                              color: getStatusColor(currentStatus),
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {currentStatus}
                            </div>
                          </td>
                        </tr>
                      )];
                    }
                    
                    // If single item, show transaction total; otherwise show per-item subtotal
                    const useTransactionTotal = items.length === 1;
                    
                    return items.map((item, idx) => {
                      const orderId = tx.transactionId || tx.orderId || '';
                      const currentStatus = (tx.status || 'PLACED').toUpperCase();
                      const canCancel = currentStatus === 'PLACED'; // Can only cancel if not yet shipped/completed
                      
                      const handleCancel = async () => {
                        if (!orderId) return;
                        if (!window.confirm('Are you sure you want to cancel this order?')) return;
                        
                        try {
                          await orderService.cancelOrder(orderId);
                          // Refresh purchases after cancellation
                          const buyerId = user.id || user.userId || user.email;
                          if (buyerId) {
                            const buyerOrders = await orderService.getBuyerOrders(buyerId);
                            const transformed = (buyerOrders || []).map(order => {
                              const orderItems = order.orderItems || order.items || [];
                              const orderDate = order.orderDate || order.createdAt || new Date().toISOString();
                              
                              if (orderItems.length === 1) {
                                return {
                                  transactionId: order.id || order.orderId || '',
                                  invoiceId: order.id || order.orderId || '',
                                  buyerId: order.buyer?.id || order.buyerId || buyerId,
                                  buyerEmail: user.email || '',
                                  buyerName: user.name || '',
                                  farmerId: orderItems[0]?.farmer?.id || orderItems[0]?.farmerId || '',
                                  farmerEmail: orderItems[0]?.farmer?.email || orderItems[0]?.farmerEmail || '',
                                  farmerName: orderItems[0]?.farmer?.name || orderItems[0]?.farmerName || '',
                                  items: [{
                                    productId: orderItems[0]?.product?.id || orderItems[0]?.productId || '',
                                    name: orderItems[0]?.product?.name || 'Unknown Product',
                                    price: Number(orderItems[0]?.priceAtPurchase || orderItems[0]?.price || 0),
                                    quantity: Number(orderItems[0]?.quantity || 0),
                                  }],
                                  total: Number(order.totalAmount || order.total || 0),
                                  status: order.orderStatus || 'PLACED',
                                  date: orderDate,
                                };
                              } else {
                                return {
                                  transactionId: order.id || order.orderId || '',
                                  invoiceId: order.id || order.orderId || '',
                                  buyerId: order.buyer?.id || order.buyerId || buyerId,
                                  buyerEmail: user.email || '',
                                  buyerName: user.name || '',
                                  items: orderItems.map(item => ({
                                    productId: item?.product?.id || item?.productId || '',
                                    name: item?.product?.name || 'Unknown Product',
                                    price: Number(item?.priceAtPurchase || item?.price || 0),
                                    quantity: Number(item?.quantity || 0),
                                  })),
                                  total: Number(order.totalAmount || order.total || 0),
                                  status: order.orderStatus || 'PLACED',
                                  date: orderDate,
                                };
                              }
                            });
                            setPurchases(transformed);
                          }
                        } catch (error) {
                          console.error('[BuyerDashboard] Error cancelling order:', error);
                          alert(error.message || 'Failed to cancel order. Please try again.');
                        }
                      };
                      
                      const getStatusColor = (status) => {
                        const s = status.toUpperCase();
                        if (s === 'PLACED') return '#ffa500';
                        if (s === 'ACCEPTED') return '#2196f3';
                        if (s === 'SHIPPED') return '#9c27b0';
                        if (s === 'COMPLETED') return '#5eed3a';
                        if (s === 'CANCELLED') return '#f44336';
                        return 'rgba(255, 255, 255, 0.8)';
                      };
                      
                      return (
                        <tr
                          key={`${tx.transactionId}-${idx}`}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          <td style={{ padding: '12px', color: 'white' }}>
                            {item.name || 'Unknown Product'}
                          </td>
                          <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                            {Number(item.quantity || 0)}
                          </td>
                          <td style={{ padding: '12px', color: '#5eed3a', fontWeight: '600' }}>
                            ₹{useTransactionTotal 
                              ? Number(tx.total || 0).toLocaleString('en-IN')
                              : (Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString('en-IN')
                            }
                          </td>
                          <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                            {tx.date ? new Date(tx.date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                              <div style={{
                                color: getStatusColor(currentStatus),
                                fontSize: '12px',
                                fontWeight: '600',
                                marginBottom: '4px'
                              }}>
                                {currentStatus}
                              </div>
                              {canCancel && (
                                <button
                                  onClick={handleCancel}
                                  style={{
                                    padding: '4px 8px',
                                    background: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.target.style.background = '#d32f2f'}
                                  onMouseLeave={(e) => e.target.style.background = '#f44336'}
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            )}
            <button
              className="close-btn"
              onClick={() => setShowPurchases(false)}
              style={{
                marginTop: '20px',
                background: 'linear-gradient(90deg, #1fa751, #2ba8ff)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;


