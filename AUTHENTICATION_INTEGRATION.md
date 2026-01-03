# Backend Authentication Integration

This document describes the backend authentication integration for AgriConnect.

## Overview

The frontend now uses backend APIs for authentication. The backend is the single source of truth for user identity, and all user operations (products, messages, reviews) use backend-verified user IDs.

## Backend API Requirements

### 1. User Entity

The backend should have a User entity with:
- `id` (Long/Integer) - Primary key, backend-generated
- `name` (String) - User's full name
- `email` (String) - Unique email address
- `password` (String) - Plain text password (for now)
- `role` (String/Enum) - Either "FARMER" or "BUYER"

### 2. Authentication Endpoints

#### POST `/api/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "FARMER"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "FARMER"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input or email already exists
- `409 Conflict` - Email already registered

#### POST `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "FARMER"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `404 Not Found` - User not found

## Frontend Changes

### 1. Authentication Service (`src/services/authService.js`)

- `signup(name, email, password, role)` - Calls backend signup API
- `login(email, password)` - Calls backend login API
- Returns user object with backend-provided `id`

### 2. AuthContext Updates (`src/Components/context/AuthContext.jsx`)

- `register()` - Now async, calls backend API
- `login()` - Now async, calls backend API
- User identity comes from backend response
- Backend-provided `id` is used as `userId`

### 3. Login/Register Components

- Updated to handle async authentication
- No UI changes - same forms and styling
- Error handling for backend responses

## Identity Propagation

### User ID Usage

After login, the frontend stores:
- `id` - Backend-provided user ID (primary identifier)
- `userId` - Same as `id` (for backward compatibility)
- `email` - User's email
- `name` - User's name
- `role` - User's role (FARMER/BUYER)

### Where Backend ID is Used

1. **Products**
   - `farmerId` = `user.id` (backend-provided)
   - Backend validates that only FARMER role can create products

2. **Messages**
   - `senderId` = `user.id` (backend-provided)
   - `receiverId` = Other party's backend ID
   - Backend validates that messages involve logged-in user

3. **Reviews**
   - `buyerId` = `user.id` (backend-provided)
   - Backend validates review ownership

## Authorization Rules (Backend)

The backend should enforce:

1. **Product Creation**
   - Only users with role "FARMER" can create products
   - `POST /api/products` should check user role
   - Return `403 Forbidden` if user is not FARMER

2. **Message Validation**
   - Messages must have `senderId` matching logged-in user
   - Or `receiverId` matching logged-in user
   - Return `403 Forbidden` if user is not involved

3. **Review Validation**
   - Reviews must have `buyerId` matching logged-in user
   - Return `403 Forbidden` if user doesn't match

## Session Management

- Frontend stores logged-in user in `localStorage` key `loggedInUser`
- This is only for session persistence (page refresh)
- Backend should validate user identity on each API call (future: JWT tokens)
- For now, backend can use session-based auth or validate user ID in request

## Migration Notes

- Existing localStorage users will need to register/login via backend
- Google OAuth users can continue using frontend flow (for now)
- Backend should handle role normalization (FARMER/BUYER vs Farmer/Buyer)

## Testing Checklist

- [ ] Signup creates user in backend database
- [ ] Login validates credentials against backend
- [ ] Backend returns user ID in login/signup response
- [ ] Frontend uses backend ID for all operations
- [ ] Only FARMER users can create products (backend check)
- [ ] Messages use backend-provided sender/receiver IDs
- [ ] Reviews use backend-provided buyer ID
- [ ] Session persists across page refresh
- [ ] Error handling works for invalid credentials

