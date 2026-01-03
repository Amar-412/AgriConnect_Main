# Backend Integration Summary

This document summarizes the changes made to integrate AgriConnect with a Spring Boot backend.

## Overview

The application has been migrated from localStorage-based data storage to a backend API-based architecture. Products, reviews, and messages are now persisted in a MySQL database via Spring Boot REST APIs, while cart and orders remain in localStorage as specified.

## Changes Made

### 1. API Configuration (`src/config/apiConfig.js`)
- Centralized API base URL configuration
- Environment variable support: `REACT_APP_API_BASE_URL`
- Default: `http://localhost:8080/api`
- All API endpoints defined in one place

### 2. API Services
Created service modules for backend communication:
- **`src/services/productService.js`**: Product CRUD operations
- **`src/services/reviewService.js`**: Review creation and retrieval
- **`src/services/messageService.js`**: Message creation and retrieval

### 3. DataContext Updates (`src/Components/context/DataContext.jsx`)
- Products, reviews, and messages now fetched from backend on mount
- All create/update/delete operations call backend APIs
- Cart remains in localStorage (as specified)
- Orders remain in localStorage (as specified)
- Added loading states for async operations
- Added refresh functions for manual data refresh

### 4. Farmer Dashboard (`src/Components/dashboards/FarmerDashboard.jsx`)
- Fetches farmer-specific products from backend API
- Product creation, update, and deletion now persist to backend
- Removed expanded review section below product cards (as requested)
- Review button functionality preserved
- Messaging system updated to properly label messages

### 5. Buyer Dashboard (`src/Components/dashboards/BuyerDashboard.jsx`)
- Uses all products from backend (via DataContext)
- Review submission now persists to backend
- Messaging system updated to properly label messages

### 6. Product Popup (`src/Components/ui/ProductPopup.jsx`)
- Reviews and messages fetched from backend
- Messaging system fixed to properly show "You" for sent messages and sender names for received messages
- Works for both buyers and farmers

### 7. Messaging System Fixes
- Messages sent by logged-in user now labeled as "You"
- Messages received show actual sender name (farmer or buyer)
- Proper role-based message identification
- Works correctly in both Farmer and Buyer dashboards

## API Endpoints Expected

The backend should implement the following REST endpoints:

### Products
- `GET /api/products` - Get all products
- `GET /api/products/farmer/{farmerId}` - Get products by farmer
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/product/{productId}` - Get reviews by product
- `POST /api/reviews` - Create review

### Messages
- `GET /api/messages` - Get all messages
- `GET /api/messages/product/{productId}` - Get messages by product
- `GET /api/messages/user/{userId}` - Get messages by user
- `POST /api/messages` - Create message

## Data Models

### Product
```javascript
{
  id: string,
  name: string,
  description: string,
  price: number,
  quantity: number,
  inventory: number,
  category: string,
  location: string,
  image: string,
  imageDataUrl: string,
  farmerId: string,
  farmerEmail: string,
  farmerName: string,
  ownerId: string
}
```

### Review
```javascript
{
  id: string,
  productId: string,
  farmerId: string,
  buyerId: string,
  buyerName: string,
  rating: number,
  comment: string,
  createdAt: number
}
```

### Message
```javascript
{
  id: string,
  messageId: string,
  buyerId: string,
  buyerName: string,
  farmerId: string,
  farmerName: string,
  productId: string,
  productName: string,
  content: string,
  timestamp: number,
  createdAt: number,
  fromUserId: string,
  fromUserName: string,
  toUserId: string,
  body: string,
  senderRole: 'buyer' | 'farmer'
}
```

## Configuration

Set the backend API URL via environment variable:
```bash
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

Or modify `src/config/apiConfig.js` directly.

## UI/UX Preservation

- All UI components, styling, and layouts remain unchanged
- No visual changes to the user interface
- All existing functionality preserved
- Only data source changed from localStorage to backend APIs

## Notes

- Cart functionality remains in localStorage (as specified)
- Order management remains in localStorage (as specified)
- Authentication state remains in localStorage (as specified)
- ProductGallery on Home page shows static feedstocks (unchanged, separate feature)

