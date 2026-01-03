# Order Status Management Integration

This document describes the order status lifecycle management for AgriConnect.

## Overview

Orders now move through a controlled lifecycle with backend-enforced status transitions. Farmers can update order progress, and buyers can cancel orders (when allowed).

## Order Status Lifecycle

### Status Flow

```
PLACED (default) 
  ↓ (Farmer accepts)
ACCEPTED 
  ↓ (Farmer ships)
SHIPPED 
  ↓ (Farmer completes)
COMPLETED

PLACED 
  ↓ (Buyer cancels)
CANCELLED
```

### Status Definitions

- **PLACED**: Order created by buyer, awaiting farmer acceptance
- **ACCEPTED**: Farmer has accepted the order
- **SHIPPED**: Order has been dispatched by farmer
- **COMPLETED**: Order fulfilled and delivered
- **CANCELLED**: Order cancelled by buyer (only allowed when status is PLACED)

## Backend API Requirements

### 1. Order Entity Updates

The backend Order entity must:
- Have `orderStatus` as an enum (PLACED, ACCEPTED, SHIPPED, COMPLETED, CANCELLED)
- Default status = PLACED
- Enforce status transitions

### 2. Status Update Endpoints

#### PUT `/api/orders/{orderId}/status`

**Request Body:**
```json
{
  "status": "ACCEPTED"  // or "SHIPPED" or "COMPLETED"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "buyer": {...},
  "orderDate": "2024-01-15T10:30:00Z",
  "orderStatus": "ACCEPTED",
  "totalAmount": 500.00,
  "orderItems": [...]
}
```

**Authorization:**
- Only FARMER users can call this endpoint
- Farmer must own at least one product in the order
- Return `403 Forbidden` if unauthorized

**Validation:**
- Reject invalid status transitions (e.g., PLACED → SHIPPED, skipping ACCEPTED)
- Only allow: PLACED → ACCEPTED, ACCEPTED → SHIPPED, SHIPPED → COMPLETED
- Return `400 Bad Request` for invalid transitions

#### PUT `/api/orders/{orderId}/cancel`

**Request Body:** (empty)

**Response (200 OK):**
```json
{
  "id": 1,
  "buyer": {...},
  "orderDate": "2024-01-15T10:30:00Z",
  "orderStatus": "CANCELLED",
  "totalAmount": 500.00,
  "orderItems": [...]
}
```

**Authorization:**
- Only BUYER users can call this endpoint
- Buyer must be the owner of the order
- Return `403 Forbidden` if unauthorized

**Validation:**
- Only allow cancellation if orderStatus is PLACED
- Block cancellation if status is ACCEPTED, SHIPPED, or COMPLETED
- Return `400 Bad Request` if cancellation not allowed

## Frontend Changes

### 1. Order Service Updates (`src/services/orderService.js`)

- `updateOrderStatus(orderId, newStatus)` - Farmer updates order status
- `cancelOrder(orderId)` - Buyer cancels order

### 2. FarmerDashboard Updates (`src/Components/dashboards/FarmerDashboard.jsx`)

- Added "Status / Actions" column to orders table
- Displays current order status with color coding
- Shows action buttons based on current status:
  - **Accept** button (when status is PLACED)
  - **Ship** button (when status is ACCEPTED)
  - **Complete** button (when status is SHIPPED)
- Buttons match existing UI style
- Refreshes orders after status update

### 3. BuyerDashboard Updates (`src/Components/dashboards/BuyerDashboard.jsx`)

- Added "Status / Actions" column to purchases table
- Displays current order status with color coding
- Shows **Cancel** button (only when status is PLACED)
- Button matches existing UI style
- Refreshes purchases after cancellation

## Status Color Coding

- **PLACED**: Orange (#ffa500)
- **ACCEPTED**: Blue (#2196f3)
- **SHIPPED**: Purple (#9c27b0)
- **COMPLETED**: Green (#5eed3a)
- **CANCELLED**: Red (#f44336)

## Authorization Rules (Backend Must Enforce)

### Farmer Actions

1. **Accept Order** (PLACED → ACCEPTED)
   - Only FARMER role
   - Farmer must own at least one product in the order
   - Order status must be PLACED

2. **Ship Order** (ACCEPTED → SHIPPED)
   - Only FARMER role
   - Farmer must own at least one product in the order
   - Order status must be ACCEPTED

3. **Complete Order** (SHIPPED → COMPLETED)
   - Only FARMER role
   - Farmer must own at least one product in the order
   - Order status must be SHIPPED

### Buyer Actions

1. **Cancel Order** (PLACED → CANCELLED)
   - Only BUYER role
   - Buyer must be the order owner
   - Order status must be PLACED (cannot cancel if already ACCEPTED, SHIPPED, or COMPLETED)

## Validation & Safety

### Backend Validation

1. **Status Transition Validation**
   - Reject invalid transitions (e.g., skipping steps)
   - Only allow valid next states
   - Return clear error messages

2. **Role Validation**
   - Verify user role matches action
   - Verify user owns order/product
   - Return 403 Forbidden for unauthorized actions

3. **State Validation**
   - Verify current status allows the transition
   - Block actions on terminal states (COMPLETED, CANCELLED)

### Frontend Safety

- Buttons only appear when action is valid
- Confirmation dialog for cancellation
- Error handling with user-friendly messages
- Automatic refresh after status update

## Data Integrity

- Order status is always backend-authoritative
- Frontend displays status from backend response
- No localStorage fallback for order status
- Page refresh shows correct, persisted status
- Status changes are immediately reflected after API call

## UI Constraints (Maintained)

- No new screens or major layout changes
- Status column added to existing tables
- Action buttons match existing button style
- Same color scheme and typography
- Same responsive behavior

## Testing Checklist

- [ ] Farmer can accept PLACED order
- [ ] Farmer can ship ACCEPTED order
- [ ] Farmer can complete SHIPPED order
- [ ] Buyer can cancel PLACED order
- [ ] Buyer cannot cancel ACCEPTED/SHIPPED/COMPLETED order
- [ ] Invalid status transitions are rejected by backend
- [ ] Unauthorized users cannot update status
- [ ] Status displays correctly after refresh
- [ ] Action buttons only appear when valid
- [ ] Error messages are user-friendly

