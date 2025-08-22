// src/ProductGallery.js
import React from 'react';
import './ProductGallery.css'; // Import the CSS file for styling
import products from './productData'; // Import the product data

const ProductGallery = () => {
  return (
    <div className="gallery-container">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <img loading='lazy' src={product.imageUrl} alt={product.name} className="product-image" />
          <h3>{product.name}</h3>
          <a href={product.buyUrl} target="_blank" rel="noopener noreferrer" className="buy-button">
            Buy
          </a>
        </div>
      ))}
    </div>
  );
};

export default ProductGallery;
