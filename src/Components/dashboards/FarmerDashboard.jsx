import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { products, orders, messages, reviews, sendMessage, addProduct, updateProduct, deleteProduct, refreshProducts } = useData();
  const [draft, setDraft] = useState({ name: '', description: '', price: '', inventory: '', imageDataUrl: '', category: 'General', location: '' });
  const [showMessages, setShowMessages] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [myProducts, setMyProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch farmer-specific products from backend
  useEffect(() => {
    const fetchMyProducts = async () => {
      if (!user) {
        setMyProducts([]);
        setLoadingProducts(false);
        return;
      }

      try {
        setLoadingProducts(true);
        const farmerId = user.id || user.userId || user.email; // Backend id is primary
        const fetchedProducts = await productService.getProductsByFarmer(farmerId);
        setMyProducts(fetchedProducts || []);
      } catch (error) {
        console.error('[FarmerDashboard] Error fetching farmer products:', error);
        // Fallback to filtering from all products if API fails
        const filtered = products.filter((p) => 
          p.ownerId === user?.id || 
          p.ownerId === user?.userId || 
          p.ownerId === user?.email ||
          p.farmerId === user?.userId ||
          p.farmerId === user?.email ||
          p.farmerEmail === user?.email
        );
        setMyProducts(filtered);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchMyProducts();
  }, [user, products]);

  useEffect(() => {
    if (user) {
      const loadOrders = async () => {
        try {
          const farmerId = user.id || user.userId || user.email || '';
          if (!farmerId) return;

          // Fetch orders from backend API
          const farmerOrderItems = await orderService.getFarmerOrders(farmerId);
          
          // Transform backend order items to match UI format
          // Backend returns order items with order, product, buyer, farmer info
          const transformedOrders = (farmerOrderItems || []).map(orderItem => ({
            id: orderItem.id || orderItem.orderItemId || '',
            orderId: orderItem.order?.id || orderItem.orderId || '',
            productId: orderItem.product?.id || orderItem.productId || '',
            productName: orderItem.product?.name || 'Unknown Product',
            buyerName: orderItem.order?.buyer?.name || orderItem.buyerName || 'Unknown Buyer',
            buyerId: orderItem.order?.buyer?.id || orderItem.buyerId || '',
            quantity: Number(orderItem.quantity || 0),
            total: Number(orderItem.priceAtPurchase || orderItem.price || 0) * Number(orderItem.quantity || 0),
            status: (orderItem.order?.orderStatus || orderItem.status || 'PLACED').toLowerCase(),
            createdAt: new Date(orderItem.order?.orderDate || orderItem.createdAt || Date.now()).getTime(),
            date: orderItem.order?.orderDate || orderItem.createdAt || new Date().toISOString(),
            priceAtPurchase: Number(orderItem.priceAtPurchase || orderItem.price || 0),
          }));
          
          setMyOrders(transformedOrders);
        } catch (error) {
          console.error('[FarmerDashboard] Error loading orders:', error);
          // Fallback to empty array on error
          setMyOrders([]);
        }
      };
      
      loadOrders();
      
      // Refresh orders periodically when popup is open
      if (showOrders) {
        const interval = setInterval(loadOrders, 3000);
        return () => clearInterval(interval);
      }
    }
  }, [user, showOrders]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    const productData = {
      ...draft,
      ownerId: user.id || user.userId || user.email,
      price: Number(draft.price || 0),
      inventory: Number(draft.inventory || 0),
      quantity: Number(draft.inventory || 0)
    };
    
    // Pass farmer info - use backend-provided id as source of truth
    const farmerInfo = {
      userId: user.id || user.userId || user.email, // Backend id is primary
      email: user.email,
      name: user.name
    };
    
    try {
      await addProduct(productData, farmerInfo);
      setDraft({ name: '', description: '', price: '', inventory: '', imageDataUrl: '', category: 'General', location: '' });
      // Refresh products list
      if (refreshProducts) {
        await refreshProducts();
      }
      // Also refresh my products
      const farmerId = user.id || user.userId || user.email; // Backend id is primary
      const fetchedProducts = await productService.getProductsByFarmer(farmerId);
      setMyProducts(fetchedProducts || []);
    } catch (error) {
      console.error('[FarmerDashboard] Error adding product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((prev) => ({ ...prev, imageDataUrl: String(reader.result) }));
    };
    reader.readAsDataURL(file);
    
  };

  return (
    <div style={{ padding: 24, maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '32px', 
        fontSize: '3rem',
        fontWeight: 'bold',
        background: 'linear-gradient(90deg, rgb(0, 110, 255) 0%, rgb(39, 250, 2) 25%, rgb(0, 217, 255) 50%, rgb(127, 255, 16) 75%, rgb(30, 255, 0) 100%)',
        backgroundSize: '200% auto',
        color: 'transparent',
        backgroundClip: 'text',
        animation: 'textAnimate 10s cubic-bezier(0.25, 0.1, 0.25, 1) infinite'
      }}>Farmer Dashboard</h2>
      
      {/* Product Add Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ 
          textAlign: 'center', 
          marginBottom: '24px', 
          fontSize: '2rem',
          fontWeight: 'bold',
          background: 'linear-gradient(90deg, rgb(0, 110, 255) 0%, rgb(39, 250, 2) 25%, rgb(0, 217, 255) 50%, rgb(127, 255, 16) 75%, rgb(30, 255, 0) 100%)',
          backgroundSize: '200% auto',
          color: 'transparent',
          backgroundClip: 'text',
          animation: 'textAnimate 10s cubic-bezier(0.25, 0.1, 0.25, 1) infinite'
        }}>Add New Product</h3>
        <form onSubmit={handleAdd} style={{ 
          display: 'grid', 
          gap: '16px', 
          maxWidth: '600px', 
          margin: '0 auto',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
        }}>
          <input 
            placeholder="Product name" 
            value={draft.name} 
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e1e5e9',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#5eed3a'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          />
          <input 
            placeholder="Description" 
            value={draft.description} 
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e1e5e9',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#5eed3a'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          />
          <input 
            placeholder="Category" 
            value={draft.category} 
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e1e5e9',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#5eed3a'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          />
          <input 
            placeholder="Location" 
            value={draft.location} 
            onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e1e5e9',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#5eed3a'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          />
          <input 
            placeholder="Price" 
            type="number" 
            value={draft.price} 
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e1e5e9',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#5eed3a'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          />
          <input 
            placeholder="Inventory" 
            type="number" 
            value={draft.inventory} 
            onChange={(e) => setDraft({ ...draft, inventory: e.target.value })}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e1e5e9',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#5eed3a'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          />
          <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #e1e5e9',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                width: '100%',
                maxWidth: '400px'
              }}
              onFocus={(e) => e.target.style.borderColor = '#5eed3a'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
            />
          </div>
          {draft.imageDataUrl && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              <img 
                alt="preview" 
                src={draft.imageDataUrl} 
                style={{ 
                  width: '200px', 
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  border: '2px solid #e1e5e9',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }} 
              />
            </div>
          )}
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              type="submit"
              style={{
                padding: '14px 32px',
                background: '#5eed3a',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#4ddb2a';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#5eed3a';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Add Product
            </button>
            <button 
              type="button"
              onClick={() => setShowMessages(true)}
              style={{
                padding: '14px 32px',
                background: 'transparent',
                color: '#5eed3a',
                border: '2px solid #5eed3a',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#5eed3a';
                e.target.style.color = 'black';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#5eed3a';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              View Messages
            </button>
            <button 
              type="button"
              onClick={() => setShowOrders(true)}
              style={{
                padding: '14px 32px',
                background: 'transparent',
                color: '#5eed3a',
                border: '2px solid #5eed3a',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#5eed3a';
                e.target.style.color = 'black';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#5eed3a';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              View Orders
            </button>
          </div>
      </form>
      </div>

      {/* My Products Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '20px',
          textAlign: 'center',
          background: 'linear-gradient(90deg, rgb(0, 110, 255) 0%, rgb(39, 250, 2) 25%, rgb(0, 217, 255) 50%, rgb(127, 255, 16) 75%, rgb(30, 255, 0) 100%)',
          backgroundSize: '200% auto',
          color: 'transparent',
          backgroundClip: 'text',
          animation: 'textAnimate 10s cubic-bezier(0.25, 0.1, 0.25, 1) infinite'
        }}>
          My Products
        </h3>
        {myProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'white',
            fontStyle: 'italic',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            No products added yet. Add your first product above!
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
        {myProducts.map((p) => (
              <div key={p.id} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  {p.imageDataUrl ? (
                    <img 
                      alt={p.name} 
                      src={p.imageDataUrl} 
                      style={{ 
                        width: '120px', 
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid #e1e5e9',
                        marginBottom: '12px'
                      }} 
                    />
                  ) : (
                    <div style={{
                      width: '120px',
                      height: '120px',
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#666',
                      fontSize: '14px',
                      margin: '0 auto 12px auto',
                      border: '2px solid #e1e5e9'
                    }}>
                      No Image
                    </div>
                  )}
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '18px', 
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    {p.name}
                  </h4>
                  <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginBottom: '8px' }}>
                    {p.category} {p.location && `• ${p.location}`}
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>
                      ₹{Number(p.price || 0).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                      Stock: {p.inventory}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={async () => {
                      try {
                        await updateProduct(p.id, { inventory: p.inventory + 1 });
                        // Refresh products
                        if (refreshProducts) {
                          await refreshProducts();
                        }
                        const farmerId = user?.userId || user?.email || user?.id;
                        if (farmerId) {
                          const fetchedProducts = await productService.getProductsByFarmer(farmerId);
                          setMyProducts(fetchedProducts || []);
                        }
                      } catch (error) {
                        console.error('[FarmerDashboard] Error updating product:', error);
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: '#5eed3a',
                      color: 'black',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#4ddb2a';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#5eed3a';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    +1 Stock
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        await deleteProduct(p.id);
                        // Refresh products
                        if (refreshProducts) {
                          await refreshProducts();
                        }
                        const farmerId = user?.userId || user?.email || user?.id;
                        if (farmerId) {
                          const fetchedProducts = await productService.getProductsByFarmer(farmerId);
                          setMyProducts(fetchedProducts || []);
                        }
                      } catch (error) {
                        console.error('[FarmerDashboard] Error deleting product:', error);
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#ff5252';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#ff6b6b';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>




      {/* Floating Messages Dashboard */}
      {showMessages && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowMessages(false);
        }}>
          <div style={{
            background: 'rgba(8, 1, 1, 0.95)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '32px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{ 
                fontSize: '2rem',
                fontWeight: 'bold',
                margin: 0,
                background: 'linear-gradient(90deg, rgb(0, 110, 255) 0%, rgb(39, 250, 2) 25%, rgb(0, 217, 255) 50%, rgb(127, 255, 16) 75%, rgb(30, 255, 0) 100%)',
                backgroundSize: '200% auto',
                color: 'transparent',
                backgroundClip: 'text',
                animation: 'textAnimate 10s cubic-bezier(0.25, 0.1, 0.25, 1) infinite'
              }}>
                Messages
              </h3>
              <button 
                onClick={() => setShowMessages(false)}
                style={{
                  background: 'transparent',
                  border: '2px solid #ff6b6b',
                  color: '#ff6b6b',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#ff6b6b';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#ff6b6b';
                }}
              >
                ×
              </button>
            </div>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: '8px'
            }}>
              {(() => {
                const farmerId = user?.id || user?.userId || user?.email; // Backend id is primary
                // Filter messages where farmer is either sender or receiver (backend provides senderId/receiverId)
                const farmerMessages = messages.filter((m) => {
                  const senderId = m.senderId || m.fromUserId || '';
                  const receiverId = m.receiverId || m.toUserId || '';
                  return senderId === farmerId || receiverId === farmerId;
                });

                if (farmerMessages.length === 0) {
                  return (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: 'white',
                      fontStyle: 'italic',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      No messages yet. Customer inquiries will appear here!
                    </div>
                  );
                }

                // Group messages by productId and the other party (buyer)
                // Backend provides senderId/receiverId - use these to identify conversations
                const conversations = {};
                farmerMessages.forEach((m) => {
                  const productId = m.productId || 'unknown';
                  const senderId = m.senderId || m.fromUserId || '';
                  const receiverId = m.receiverId || m.toUserId || '';
                  
                  // Determine the buyer (other party) - it's whoever is not the farmer
                  const buyerId = senderId === farmerId ? receiverId : senderId;
                  const buyerName = senderId === farmerId 
                    ? (m.receiverName || m.toUserName || 'Unknown Buyer')
                    : (m.senderName || m.fromUserName || m.buyerName || 'Unknown Buyer');
                  
                  const key = `${productId}_${buyerId}`;
                  
                  if (!conversations[key]) {
                    conversations[key] = {
                      productId,
                      buyerId,
                      buyerName: buyerName,
                      productName: m.productName || products.find(p => p.id === productId)?.name || 'Unknown Product',
                      messages: []
                    };
                  }
                  conversations[key].messages.push(m);
                });

                // Sort messages within each conversation by timestamp
                Object.values(conversations).forEach(conv => {
                  conv.messages.sort((a, b) => (a.timestamp || a.createdAt || 0) - (b.timestamp || b.createdAt || 0));
                });

                const conversationList = Object.values(conversations);

                if (selectedConversation) {
                  const conv = conversationList.find(c => 
                    c.productId === selectedConversation.productId && 
                    c.buyerId === selectedConversation.buyerId
                  );
                  
                  if (!conv) {
                    setSelectedConversation(null);
                    return null;
                  }

                  const handleReply = async (e) => {
                    e.preventDefault();
                    const replyKey = `${conv.productId}_${conv.buyerId}`;
                    const text = replyText[replyKey] || '';
                    if (!text.trim()) return;

                    try {
                      await sendMessage({
                        // Explicit sender/receiver identity - backend uses these as source of truth
                        senderId: farmerId,
                        senderName: user?.name || 'Farmer',
                        receiverId: conv.buyerId,
                        receiverName: conv.buyerName,
                        senderRole: 'farmer',
                        
                        // Message content
                        productId: conv.productId,
                        productName: conv.productName,
                        content: text.trim(),
                        timestamp: Date.now(),
                        
                        // Backward compatibility fields
                        messageId: Date.now().toString(),
                        buyerId: conv.buyerId,
                        buyerName: conv.buyerName,
                        farmerId: farmerId,
                        farmerName: user?.name || 'Farmer',
                        fromUserId: farmerId,
                        fromUserName: user?.name || 'Farmer',
                        toUserId: conv.buyerId,
                        toUserName: conv.buyerName,
                        body: text.trim(),
                      });
                    } catch (error) {
                      console.error('[FarmerDashboard] Error sending message:', error);
                      alert('Failed to send message. Please try again.');
                    }

                    setReplyText({ ...replyText, [replyKey]: '' });
                  };

                  return (
                    <div>
                      <button
                        onClick={() => setSelectedConversation(null)}
                        style={{
                          marginBottom: '16px',
                          padding: '8px 16px',
                          background: 'transparent',
                          color: '#5eed3a',
                          border: '1px solid #5eed3a',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#5eed3a';
                          e.target.style.color = 'black';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#5eed3a';
                        }}
                      >
                        ← Back to Conversations
                      </button>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '16px'
                      }}>
                        <div style={{ color: 'white', fontWeight: '600', marginBottom: '8px' }}>
                          Product: {conv.productName}
                        </div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                          Buyer: {conv.buyerName}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        marginBottom: '16px',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px'
                      }}>
                        {conv.messages.map((msg) => {
                          // Backend provides senderId - use it as single source of truth
                          const senderId = msg.senderId || msg.fromUserId || '';
                          const isSentByCurrentUser = senderId === farmerId;
                          
                          // Get sender name from backend data
                          const senderName = isSentByCurrentUser 
                            ? 'You' 
                            : (msg.senderName || msg.fromUserName || msg.buyerName || conv.buyerName || 'Buyer');
                          
                          return (
                            <div
                              key={msg.id}
                              style={{
                                display: 'flex',
                                justifyContent: isSentByCurrentUser ? 'flex-end' : 'flex-start'
                              }}
                            >
                              <div style={{
                                maxWidth: '70%',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                background: isSentByCurrentUser ? '#5eed3a' : 'rgba(255, 255, 255, 0.1)',
                                color: isSentByCurrentUser ? 'black' : 'white',
                                fontSize: '14px',
                                lineHeight: '1.5'
                              }}>
                                <div style={{
                                  fontWeight: '600',
                                  marginBottom: '4px',
                                  fontSize: '12px',
                                  opacity: 0.8
                                }}>
                                  {isSentByCurrentUser ? 'You' : senderName}
                                </div>
                                <div>{msg.content || msg.body}</div>
                                <div style={{
                                  fontSize: '11px',
                                  marginTop: '4px',
                                  opacity: 0.7
                                }}>
                                  {new Date(msg.timestamp || msg.createdAt || Date.now()).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <form onSubmit={handleReply} style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={replyText[`${conv.productId}_${conv.buyerId}`] || ''}
                          onChange={(e) => setReplyText({
                            ...replyText,
                            [`${conv.productId}_${conv.buyerId}`]: e.target.value
                          })}
                          placeholder="Type your reply..."
                          style={{
                            flex: 1,
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '2px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.3s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#5eed3a'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                        />
                        <button
                          type="submit"
                          disabled={!replyText[`${conv.productId}_${conv.buyerId}`]?.trim()}
                          style={{
                            padding: '10px 20px',
                            background: replyText[`${conv.productId}_${conv.buyerId}`]?.trim() ? '#5eed3a' : 'rgba(255, 255, 255, 0.1)',
                            color: replyText[`${conv.productId}_${conv.buyerId}`]?.trim() ? 'black' : 'rgba(255, 255, 255, 0.5)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: replyText[`${conv.productId}_${conv.buyerId}`]?.trim() ? 'pointer' : 'not-allowed',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (replyText[`${conv.productId}_${conv.buyerId}`]?.trim()) {
                              e.target.style.background = '#4ddb2a';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (replyText[`${conv.productId}_${conv.buyerId}`]?.trim()) {
                              e.target.style.background = '#5eed3a';
                            }
                          }}
                        >
                          Reply
                        </button>
                      </form>
                    </div>
                  );
                }

                return (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {conversationList.map((conv) => {
                      const lastMessage = conv.messages[conv.messages.length - 1];
                      return (
                        <div
                          key={`${conv.productId}_${conv.buyerId}`}
                          onClick={() => setSelectedConversation(conv)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '8px'
                          }}>
                            <div>
                              <div style={{
                                fontWeight: '600',
                                fontSize: '16px',
                                color: 'white',
                                marginBottom: '4px'
                              }}>
                                {conv.buyerName}
                              </div>
                              <div style={{
                                fontSize: '14px',
                                color: '#5eed3a',
                                marginBottom: '4px'
                              }}>
                                {conv.productName}
                              </div>
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: 'rgba(255, 255, 255, 0.6)'
                            }}>
                              {lastMessage && new Date(lastMessage.timestamp || lastMessage.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.8)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {lastMessage?.content || lastMessage?.body || 'No message content'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Floating Orders Dashboard */}
      {showOrders && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowOrders(false);
        }}>
          <div style={{
            background: 'rgba(12, 1, 1, 0.95)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '32px',
            maxWidth: '1000px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{ 
                fontSize: '2rem',
                fontWeight: 'bold',
                margin: 0,
                background: 'linear-gradient(90deg, rgb(0, 110, 255) 0%, rgb(39, 250, 2) 25%, rgb(0, 217, 255) 50%, rgb(127, 255, 16) 75%, rgb(30, 255, 0) 100%)',
                backgroundSize: '200% auto',
                color: 'transparent',
                backgroundClip: 'text',
                animation: 'textAnimate 10s cubic-bezier(0.25, 0.1, 0.25, 1) infinite'
              }}>
                Orders for My Products
              </h3>
              <button 
                onClick={() => setShowOrders(false)}
                style={{
                  background: 'transparent',
                  border: '2px solid #ff6b6b',
                  color: '#ff6b6b',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#ff6b6b';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#ff6b6b';
                }}
              >
                ×
              </button>
            </div>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: '8px'
            }}>
              {myOrders.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: 'white',
                  fontStyle: 'italic',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  No orders yet. Your products will appear here when customers place orders!
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1.5fr',
                    gap: '16px',
                    padding: '16px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: 'white'
                  }}>
                    <div>Buyer</div>
                    <div>Product</div>
                    <div>Qty</div>
                    <div>Total</div>
                    <div>Date</div>
                    <div>Status / Actions</div>
                  </div>
                  {myOrders.map((o) => {
                    const currentStatus = (o.status || 'PLACED').toUpperCase();
                    const orderId = o.orderId || o.id;
                    
                    // Determine available actions based on current status
                    const canAccept = currentStatus === 'PLACED';
                    const canShip = currentStatus === 'ACCEPTED';
                    const canComplete = currentStatus === 'SHIPPED';
                    
                    const handleStatusUpdate = async (newStatus) => {
                      if (!orderId) return;
                      try {
                        await orderService.updateOrderStatus(orderId, newStatus);
                        // Refresh orders after status update
                        const farmerId = user?.id || user?.userId || user?.email;
                        if (farmerId) {
                          const fetchedOrders = await orderService.getFarmerOrders(farmerId);
                          const transformed = (fetchedOrders || []).map(orderItem => ({
                            id: orderItem.id || orderItem.orderItemId || '',
                            orderId: orderItem.order?.id || orderItem.orderId || '',
                            productId: orderItem.product?.id || orderItem.productId || '',
                            productName: orderItem.product?.name || 'Unknown Product',
                            buyerName: orderItem.order?.buyer?.name || orderItem.buyerName || 'Unknown Buyer',
                            buyerId: orderItem.order?.buyer?.id || orderItem.buyerId || '',
                            quantity: Number(orderItem.quantity || 0),
                            total: Number(orderItem.priceAtPurchase || orderItem.price || 0) * Number(orderItem.quantity || 0),
                            status: (orderItem.order?.orderStatus || orderItem.status || 'PLACED').toLowerCase(),
                            createdAt: new Date(orderItem.order?.orderDate || orderItem.createdAt || Date.now()).getTime(),
                            date: orderItem.order?.orderDate || orderItem.createdAt || new Date().toISOString(),
                            priceAtPurchase: Number(orderItem.priceAtPurchase || orderItem.price || 0),
                          }));
                          setMyOrders(transformed);
                        }
                      } catch (error) {
                        console.error('[FarmerDashboard] Error updating order status:', error);
                        alert(error.message || 'Failed to update order status. Please try again.');
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
                      <div key={o.id} style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1.5fr',
                        gap: '16px',
                        padding: '16px 20px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        alignItems: 'center',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}>
                        <div style={{ 
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '14px',
                          textAlign: 'center'
                        }}>
                          {o.buyerName || 'Anonymous'}
                        </div>
                        <div style={{ 
                          color: 'white',
                          fontSize: '14px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {o.productName}
                        </div>
                        <div style={{ 
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '14px',
                          textAlign: 'center'
                        }}>
                          {o.quantity}
                        </div>
                        <div style={{ 
                          color: '#5eed3a',
                          fontSize: '14px',
                          fontWeight: '600',
                          textAlign: 'center'
                        }}>
                          ₹{Number(o.total || 0).toFixed(2)}
                        </div>
                        <div style={{ 
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '14px',
                          textAlign: 'center'
                        }}>
                          {o.date ? new Date(o.date).toLocaleDateString() : 'N/A'}
                        </div>
                        <div style={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          alignItems: 'center'
                        }}>
                          <div style={{
                            color: getStatusColor(currentStatus),
                            fontSize: '12px',
                            fontWeight: '600',
                            textAlign: 'center',
                            marginBottom: '4px'
                          }}>
                            {currentStatus}
                          </div>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {canAccept && (
                              <button
                                onClick={() => handleStatusUpdate('ACCEPTED')}
                                style={{
                                  padding: '4px 8px',
                                  background: '#2196f3',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#1976d2'}
                                onMouseLeave={(e) => e.target.style.background = '#2196f3'}
                              >
                                Accept
                              </button>
                            )}
                            {canShip && (
                              <button
                                onClick={() => handleStatusUpdate('SHIPPED')}
                                style={{
                                  padding: '4px 8px',
                                  background: '#9c27b0',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#7b1fa2'}
                                onMouseLeave={(e) => e.target.style.background = '#9c27b0'}
                              >
                                Ship
                              </button>
                            )}
                            {canComplete && (
                              <button
                                onClick={() => handleStatusUpdate('COMPLETED')}
                                style={{
                                  padding: '4px 8px',
                                  background: '#5eed3a',
                                  color: 'black',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#4ddb2a'}
                                onMouseLeave={(e) => e.target.style.background = '#5eed3a'}
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;


