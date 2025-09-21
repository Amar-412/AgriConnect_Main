import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { products, orders, messages, reviews, sendMessage, addProduct, updateProduct, deleteProduct } = useData();
  const [draft, setDraft] = useState({ name: '', description: '', price: '', inventory: '', imageDataUrl: '', category: 'General', location: '' });
  const [showMessages, setShowMessages] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const myOrders = useMemo(() => orders.filter((o) => products.find((p) => p.id === o.productId && p.ownerId === user?.id)), [orders, products, user]);

  const myProducts = products.filter((p) => p.ownerId === user?.id);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!user) return;
    addProduct({ ...draft, ownerId: user.id, price: Number(draft.price || 0), inventory: Number(draft.inventory || 0) });
    setDraft({ name: '', description: '', price: '', inventory: '', imageDataUrl: '', category: 'General', location: '' });
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
                    onClick={() => updateProduct(p.id, { inventory: p.inventory + 1 })}
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
                    onClick={() => deleteProduct(p.id)}
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



      {/* Product Reviews Section */}
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
          Product Reviews
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
            No products to show reviews for.
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {myProducts.map((product) => {
              const productReviews = reviews.filter((r) => r.productId === product.id);
              const averageRating = productReviews.length > 0 
                ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
                : 0;
              
              return (
                <div key={product.id} style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '24px',
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
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '20px',
                    gap: '16px'
                  }}>
                    {product.imageDataUrl ? (
                      <img 
                        alt={product.name} 
                        src={product.imageDataUrl} 
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          objectFit: 'cover', 
                          borderRadius: '12px',
                          border: '2px solid #e1e5e9',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                    ) : (
                      <div style={{
                        width: '80px',
                        height: '80px',
                        background: '#f5f5f5',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666',
                        fontSize: '14px',
                        border: '2px solid #e1e5e9'
                      }}>
                        No Image
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        margin: '0 0 8px 0', 
                        color: 'white',
                        fontSize: '20px',
                        fontWeight: '600'
                      }}>
                        {product.name}
                      </h4>
                      <div style={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span>
                          {productReviews.length} review{productReviews.length !== 1 ? 's' : ''}
                        </span>
                        {averageRating > 0 && (
                          <>
                            <span style={{ color: '#ffd700', fontSize: '18px' }}>
                              {'★'.repeat(Math.floor(averageRating))}
                            </span>
                            <span style={{ fontWeight: '600', color: 'white' }}>
                              {averageRating}/5
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {productReviews.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '20px',
                      color: 'white',
                      fontStyle: 'italic',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      No reviews yet for this product.
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      {productReviews.map((review) => (
                        <div key={review.id} style={{ 
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '12px',
                          padding: '20px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '12px'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: '#5eed3a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'black',
                                fontWeight: 'bold',
                                fontSize: '14px'
                              }}>
                                {review.buyerName ? review.buyerName.charAt(0).toUpperCase() : 'A'}
                              </div>
                              <span style={{ 
                                fontWeight: '600', 
                                color: 'white',
                                fontSize: '16px'
                              }}>
                                {review.buyerName || 'Anonymous'}
                              </span>
                            </div>
                            <span style={{ 
                              color: '#ffd700', 
                              fontSize: '18px',
                              fontWeight: '600'
                            }}>
                              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </span>
                          </div>
                          <p style={{ 
                            margin: 0, 
                            color: 'white', 
                            fontSize: '15px',
                            lineHeight: '1.6',
                            paddingLeft: '48px'
                          }}>
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
              {messages.filter((m) => m.toUserId === user?.id).length === 0 ? (
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
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {messages
                    .filter((m) => m.toUserId === user?.id)
                    .map((m) => (
                      <div key={m.id} style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '20px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        position: 'relative'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: '#5eed3a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'black',
                              fontWeight: 'bold',
                              fontSize: '16px'
                            }}>
                              {m.fromUserName ? m.fromUserName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div style={{
                                fontWeight: '600',
                                fontSize: '16px',
                                color: 'white',
                                marginBottom: '4px'
                              }}>
                                {m.fromUserName || 'Anonymous'}
                              </div>
                              <div style={{
                                fontSize: '12px',
                                color: 'rgba(255, 255, 255, 0.8)'
                              }}>
                                {new Date(m.createdAt).toLocaleDateString()} at {new Date(m.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: '8px'
                          }}>
                            <button style={{
                              padding: '6px 12px',
                              background: 'transparent',
                              color: '#5eed3a',
                              border: '1px solid #5eed3a',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#5eed3a';
                              e.target.style.color = 'black';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent';
                              e.target.style.color = '#5eed3a';
                            }}>
                              Reply
                            </button>
                            <button style={{
                              padding: '6px 12px',
                              background: 'transparent',
                              color: 'rgba(255, 255, 255, 0.8)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                              e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent';
                              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                            }}>
                              Mark Read
                            </button>
                          </div>
                        </div>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          padding: '16px',
                          fontSize: '14px',
                          color: 'white',
                          lineHeight: '1.5'
                        }}>
                          {m.body}
                        </div>
                      </div>
                    ))}
                </div>
              )}
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
                    gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr',
                    gap: '16px',
                    padding: '16px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: 'white'
                  }}>
                    <div>Order ID</div>
                    <div>Product Name</div>
                    <div>Buyer</div>
                    <div>Quantity</div>
                    <div>Status</div>
                  </div>
                  {myOrders.map((o) => (
                    <div key={o.id} style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr',
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
                        fontWeight: '600', 
                        color: '#5eed3a',
                        fontSize: '14px'
                      }}>
                        #{o.id.slice(-6)}
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
                        {o.buyerName || 'Anonymous'}
                      </div>
                      <div style={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '14px',
                        textAlign: 'center'
                      }}>
                        {o.quantity}
                      </div>
                      <div style={{ 
                        color: o.status === 'placed' ? '#5eed3a' : o.status === 'shipped' ? '#2196F3' : '#ff6b6b',
                        fontSize: '14px',
                        fontWeight: '600',
                        textAlign: 'center',
                        textTransform: 'capitalize'
                      }}>
                        {o.status}
                      </div>
                    </div>
                  ))}
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


