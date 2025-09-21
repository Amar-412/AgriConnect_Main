import React, { useState } from 'react';

const ReviewPopup = ({ product, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit({
        productId: product.id,
        rating: rating,
        comment: comment.trim()
      });
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
          onMouseLeave={(e) => e.target.style.background = 'none'}
        >
          ×
        </button>

        <h3 style={{ 
          marginBottom: '20px', 
          color: '#333',
          fontSize: '20px',
          fontWeight: '600'
        }}>
          Review: {product.name}
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Rating Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333'
            }}>
              Rating (1-5 stars):
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: star <= rating ? '#ffd700' : '#ddd',
                    transition: 'color 0.2s ease',
                    padding: '4px'
                  }}
                  onMouseEnter={(e) => {
                    if (star <= rating) return;
                    e.target.style.color = '#ffd700';
                  }}
                  onMouseLeave={(e) => {
                    if (star <= rating) return;
                    e.target.style.color = '#ddd';
                  }}
                >
                  ★
                </button>
              ))}
              <span style={{ 
                marginLeft: '8px', 
                color: '#666',
                fontSize: '14px'
              }}>
                {rating} star{rating !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Comment Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#333'
            }}>
              Your Review:
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e1e5e9',
                fontSize: '14px',
                resize: 'vertical',
                minHeight: '80px',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = '#5eed3a'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
              required
            />
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f5f5f5';
                e.target.style.borderColor = '#ccc';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = '#ddd';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!comment.trim()}
              style={{
                padding: '10px 20px',
                background: comment.trim() ? '#5eed3a' : '#ccc',
                color: comment.trim() ? 'black' : '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: comment.trim() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (comment.trim()) {
                  e.target.style.background = '#4ddb2a';
                }
              }}
              onMouseLeave={(e) => {
                if (comment.trim()) {
                  e.target.style.background = '#5eed3a';
                }
              }}
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewPopup;
