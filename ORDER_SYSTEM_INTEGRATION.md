# Backend Order System Integration

This document describes the backend order system integration for AgriConnect.

## Overview

The frontend now uses backend APIs for order management. Orders are persisted in the database and linked to buyers, farmers, and products. Cart remains in localStorage, but orders are backend-backed.

## Backend API Requirements

### 1. Order Entity

The backend should have an Order entity with:
- `id` (Long/Integer) - Primary key, backend-generated
- `buyer` (User) - Reference to buyer user
- `orderDate` (Date/Timestamp) - When order was placed
- `orderStatus` (String/Enum) - PLACED, CANCELLED, COMPLETED
- `totalAmount` (Decimal) - Total order amount (computed by backend)

### 2. OrderItem Entity

The backend should have an OrderItem entity with:
- `id` (Long/Integer) - Primary key
- `order` (Order) - Reference to parent order
- `product` (Product) - Reference to product
- `quantity` (Integer) - Quantity ordered
- `priceAtPurchase` (Decimal) - Price at time of purchase (snapshot)
- `farmer` (User) - Reference to farmer who owns the product

### 3. Order Endpoints

#### POST `/api/orders`

**Request Body:**
```json
{
  "buyerId": 1,
  "items": [
    {
      "productId": 5,
      "quantity": 2,
      "priceAtPurchase": 150.00,
      "farmerId": 3
    },
    {
      "productId": 7,
      "quantity": 1,
      "priceAtPurchase": 200.00,
      "farmerId": 3
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "buyer": {
    "id": 1,
    "name": "John Buyer",
    "email": "buyer@example.com"
  },
  "orderDate": "2024-01-15T10:30:00Z",
  "orderStatus": "PLACED",
  "totalAmount": 500.00,
  "orderItems": [
    {
      "id": 1,
      "product": {
        "id": 5,
        "name": "Tomatoes"
      },
      "quantity": 2,
      "priceAtPurchase": 150.00,
      "farmer": {
        "id": 3,
        "name": "Farmer Joe"
      }
    },
    {
      "id": 2,
      "product": {
        "id": 7,
        "name": "Potatoes"
      },
      "quantity": 1,
      "priceAtPurchase": 200.00,
      "farmer": {
        "id": 3,
        "name": "Farmer Joe"
      }
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input
- `403 Forbidden` - User is not BUYER role
- `404 Not Found` - Product or farmer not found

#### GET `/api/orders/buyer/{buyerId}`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "buyer": {
      "id": 1,
      "name": "John Buyer",
      "email": "buyer@example.com"
    },
    "orderDate": "2024-01-15T10:30:00Z",
    "orderStatus": "PLACED",
    "totalAmount": 500.00,
    "orderItems": [...]
  }
]
```

**Authorization:**
- Only return orders where `buyer.id === buyerId`
- Return `403 Forbidden` if requesting user is not the buyer

#### GET `/api/orders/farmer/{farmerId}`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "orderItemId": 1,
    "order": {
      "id": 1,
      "buyer": {
        "id": 1,
        "name": "John Buyer"
      },
      "orderDate": "2024-01-15T10:30:00Z",
      "orderStatus": "PLACED"
    },
    "product": {
      "id": 5,
      "name": "Tomatoes"
    },
    "quantity": 2,
    "priceAtPurchase": 150.00,
    "farmer": {
      "id": 3,
      "name": "Farmer Joe"
    }
  }
]
```

**Authorization:**
- Only return order items where `farmer.id === farmerId`
- Return `403 Forbidden` if requesting user is not the farmer

## Frontend Changes

### 1. Order Service (`src/services/orderService.js`)

- `placeOrder(orderData)` - Creates order via backend API
- `getBuyerOrders(buyerId)` - Fetches buyer's orders
- `getFarmerOrders(farmerId)` - Fetches farmer's order items

### 2. BillingView Updates (`src/Components/checkout/BillingView.jsx`)

- `handlePayment()` - Now calls backend API instead of localStorage
- Sends cart items to backend with buyer ID
- Clears cart only after successful backend response
- No UI changes - same buttons and layout

### 3. FarmerDashboard Updates (`src/Components/dashboards/FarmerDashboard.jsx`)

- Fetches orders from backend API instead of localStorage
- Transforms backend order items to match UI format
- No UI changes - same order display

### 4. BuyerDashboard Updates (`src/Components/dashboards/BuyerDashboard.jsx`)

- Fetches purchases from backend API instead of localStorage
- Transforms backend orders to match UI format
- No UI changes - same purchase history display

## Data Flow

### Order Placement Flow

1. User adds items to cart (localStorage) - **unchanged**
2. User clicks "Proceed to Checkout" - **unchanged**
3. User reviews billing - **unchanged**
4. User clicks "Buy Now" → Frontend calls `orderService.placeOrder()`
5. Backend validates:
   - Buyer is BUYER role
   - Products exist
   - Farmers exist
   - Creates Order + OrderItems
   - Captures `priceAtPurchase` for each item
6. Frontend clears cart only after successful response
7. UI shows success - **unchanged**

### Order Viewing Flow

**Buyer:**
1. Buyer opens "My Purchases"
2. Frontend calls `orderService.getBuyerOrders(buyerId)`
3. Backend returns orders for that buyer
4. UI displays orders - **unchanged**

**Farmer:**
1. Farmer opens "View Orders"
2. Frontend calls `orderService.getFarmerOrders(farmerId)`
3. Backend returns order items for farmer's products
4. UI displays orders - **unchanged**

## Authorization Rules (Backend Must Enforce)

1. **Order Creation**
   - Only users with role "BUYER" can place orders
   - Return `403 Forbidden` if user is not BUYER

2. **Order Viewing**
   - Buyers can only see their own orders
   - Farmers can only see orders for their products
   - Return `403 Forbidden` if user doesn't have access

3. **Price Snapshot**
   - Backend must capture `priceAtPurchase` at order time
   - This ensures orders are not affected by future price changes

## Cart Behavior (Unchanged)

- Cart remains in localStorage
- Cart UI unchanged
- Cart logic unchanged
- Cart is cleared only after successful order placement

## Data Transformation

The frontend transforms backend order data to match existing UI expectations:

**Backend Order → UI Format:**
- `order.id` → `transactionId`
- `order.orderItems[].product.name` → `productName`
- `order.orderItems[].quantity` → `quantity`
- `order.orderItems[].priceAtPurchase * quantity` → `total`
- `order.orderStatus` → `status`

## Migration Notes

- Existing localStorage transactions are not migrated
- New orders go to backend
- Old transactions may still appear in localStorage (for backward compatibility)
- Backend should handle order status updates

## Testing Checklist

- [ ] Buyer can place order via checkout
- [ ] Backend validates buyer role
- [ ] Backend creates Order + OrderItems
- [ ] Backend captures priceAtPurchase
- [ ] Cart clears only after successful order
- [ ] Buyer can view their orders
- [ ] Farmer can view orders for their products
- [ ] Backend enforces authorization rules
- [ ] UI remains unchanged
- [ ] Error handling works correctly

