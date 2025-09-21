import React from 'react';

const cardStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform .15s ease, box-shadow .15s ease',
  minHeight: '280px',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  gap: 20,
};

const ProductGrid = ({ products, quantityById, setQuantityById, onAddToCart, onOrder, onMessage, onReview, isLoggedIn }) => {
  return (
    <div style={gridStyle}>
      {products.map((p) => (
        <div key={p.id} style={cardStyle} onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)')} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)')}>
          {p.imageDataUrl ? (
            <img alt={p.name} src={p.imageDataUrl} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />
          ) : (
            <div style={{ width: '100%', height: 140, background: '#f5f5f5', borderRadius: 10, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '14px' }}>
              No Image
            </div>
          )}
          
          {/* Product Name - More prominent and below image */}
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#333', 
            marginBottom: '6px',
            lineHeight: '1.3',
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center'
          }}>
            {p.name}
          </div>
          
          <div style={{ color: '#555', fontSize: 13, marginBottom: '8px' }}>Farmer: {p.ownerName || 'Unknown'}</div>
          <div style={{ marginBottom: '12px', fontWeight: 700, fontSize: '18px', color: '#2c3e50' }}>₹{Number(p.price || 0).toLocaleString('en-IN')}</div>
          
          {/* Quantity Input */}
          <div style={{ marginBottom: '12px' }}>
            <input
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                borderRadius: 8, 
                border: '1px solid #ddd',
                fontSize: '14px',
                textAlign: 'center'
              }}
              type="number"
              min={1}
              placeholder="Quantity"
              value={quantityById[p.id] ?? ''}
              onChange={(e) => setQuantityById((prev) => ({ ...prev, [p.id]: e.target.value }))}
            />
          </div>
          
          {/* Action Buttons - Optimized sizes */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '12px' }}>
            <button 
              onClick={() => onAddToCart(p)} 
              style={{ 
                flex: 1,
                padding: '10px 12px', 
                background: '#5eed3a',
                color: 'black',
                border: 'none',
                borderRadius: 8,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#4ddb2a';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#5eed3a';
              }}
            >
              Add to Cart
            </button>
            <button 
              onClick={() => onOrder(p)} 
              style={{ 
                flex: 1,
                padding: '10px 12px', 
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#ff5252';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#ff6b6b';
              }}
            >
              Buy Now
            </button>
          </div>
          
          {/* Action Buttons Row */}
          {isLoggedIn && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                style={{ 
                  flex: 1,
                  padding: '8px 12px', 
                  background: 'transparent',
                  color: '#5eed3a',
                  border: '1px solid #5eed3a',
                  borderRadius: 8,
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }} 
                onClick={() => onMessage(p)}
                onMouseEnter={(e) => {
                  e.target.style.background = '#5eed3a';
                  e.target.style.color = 'black';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#5eed3a';
                }}
              >
                Message
              </button>
              <button 
                style={{ 
                  flex: 1,
                  padding: '8px 12px', 
                  background: 'transparent',
                  color: '#ff6b6b',
                  border: '1px solid #ff6b6b',
                  borderRadius: 8,
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }} 
                onClick={() => onReview(p)}
                onMouseEnter={(e) => {
                  e.target.style.background = '#ff6b6b';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#ff6b6b';
                }}
              >
                Review
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;


