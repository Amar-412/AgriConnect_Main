# Security Requirements for AgriConnect Backend

This document outlines the security hardening requirements for the AgriConnect Spring Boot backend.

## Overview

The backend must implement essential security measures to protect user data and prevent identity spoofing, while maintaining backward compatibility with existing users.

## 1. Password Hashing

### Requirements

- **Algorithm**: Use BCrypt with appropriate strength (cost factor 10-12)
- **Storage**: Never store plain-text passwords
- **Comparison**: Use BCrypt password matcher for login
- **Logging**: Never log passwords (plain-text or hashed)

### Implementation

#### Signup Flow

```java
// Pseudocode for backend signup
public User signup(SignupRequest request) {
    // Validate input
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new ConflictException("Email already registered");
    }
    
    // Hash password BEFORE storing
    String hashedPassword = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt(12));
    
    User user = new User();
    user.setName(request.getName());
    user.setEmail(request.getEmail());
    user.setPassword(hashedPassword); // Store hashed, never plain text
    user.setRole(request.getRole());
    
    return userRepository.save(user);
}
```

#### Login Flow

```java
// Pseudocode for backend login
public User login(LoginRequest request) {
    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
    
    // Handle backward compatibility for plain-text passwords
    boolean passwordMatches = false;
    
    if (user.getPassword().startsWith("$2a$") || user.getPassword().startsWith("$2b$")) {
        // Password is hashed - use BCrypt
        passwordMatches = BCrypt.checkpw(request.getPassword(), user.getPassword());
        
        // If login successful, password is already hashed - no migration needed
    } else {
        // Legacy plain-text password - migrate on first successful login
        if (user.getPassword().equals(request.getPassword())) {
            passwordMatches = true;
            // Migrate to hashed password
            String hashedPassword = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt(12));
            user.setPassword(hashedPassword);
            userRepository.save(user);
        }
    }
    
    if (!passwordMatches) {
        throw new UnauthorizedException("Invalid credentials");
    }
    
    // Return user without password
    return user.toDTO(); // DTO should exclude password field
}
```

### Backward Compatibility

- Detect plain-text passwords (they won't start with BCrypt prefix `$2a$` or `$2b$`)
- On successful login with plain-text password, hash it and update database
- Gradually migrate all users to hashed passwords

## 2. Identity Trust Tightening

### Problem

Currently, backend may trust frontend-provided user IDs without validation. This allows identity spoofing.

### Solution

Backend must validate user identity on every request that involves user-specific data.

### Implementation Pattern

```java
// Pseudocode for identity validation
public void validateUserIdentity(Long userId, User authenticatedUser) {
    // 1. Verify user exists
    if (userId == null || !userRepository.existsById(userId)) {
        throw new NotFoundException("User not found");
    }
    
    // 2. Verify matches authenticated user
    if (!userId.equals(authenticatedUser.getId())) {
        throw new ForbiddenException("Access denied: User identity mismatch");
    }
    
    // 3. Verify user is active (if you have active/inactive status)
    // Optional: Check if user account is active
}
```

### Where to Apply

Apply identity validation to:

1. **Products**
   - `POST /api/products` - Verify `farmerId` matches authenticated user
   - `PUT /api/products/{id}` - Verify product owner matches authenticated user
   - `DELETE /api/products/{id}` - Verify product owner matches authenticated user

2. **Orders**
   - `POST /api/orders` - Verify `buyerId` matches authenticated user
   - `GET /api/orders/buyer/{buyerId}` - Verify `buyerId` matches authenticated user
   - `PUT /api/orders/{id}/status` - Verify order involves authenticated farmer
   - `PUT /api/orders/{id}/cancel` - Verify order buyer matches authenticated user

3. **Reviews**
   - `POST /api/reviews` - Verify `buyerId` matches authenticated user

4. **Messages**
   - `POST /api/messages` - Verify `senderId` matches authenticated user
   - `GET /api/messages/user/{userId}` - Verify `userId` matches authenticated user

## 3. Authorization Consistency

### Role-Based Access Control

Enforce role checks consistently across all modules:

### Products Module

```java
// Only FARMER can create products
@PostMapping("/api/products")
public Product createProduct(@RequestBody ProductRequest request, 
                            @AuthenticationPrincipal User authenticatedUser) {
    // Verify user is FARMER
    if (authenticatedUser.getRole() != Role.FARMER) {
        throw new ForbiddenException("Only FARMER users can create products");
    }
    
    // Verify farmerId matches authenticated user
    if (!request.getFarmerId().equals(authenticatedUser.getId())) {
        throw new ForbiddenException("Cannot create product for another farmer");
    }
    
    // Create product...
}
```

### Orders Module

```java
// Only BUYER can place orders
@PostMapping("/api/orders")
public Order placeOrder(@RequestBody OrderRequest request,
                        @AuthenticationPrincipal User authenticatedUser) {
    // Verify user is BUYER
    if (authenticatedUser.getRole() != Role.BUYER) {
        throw new ForbiddenException("Only BUYER users can place orders");
    }
    
    // Verify buyerId matches authenticated user
    if (!request.getBuyerId().equals(authenticatedUser.getId())) {
        throw new ForbiddenException("Cannot place order for another buyer");
    }
    
    // Create order...
}

// Only FARMER can update order status
@PutMapping("/api/orders/{id}/status")
public Order updateOrderStatus(@PathVariable Long id,
                               @RequestBody StatusUpdateRequest request,
                               @AuthenticationPrincipal User authenticatedUser) {
    // Verify user is FARMER
    if (authenticatedUser.getRole() != Role.FARMER) {
        throw new ForbiddenException("Only FARMER users can update order status");
    }
    
    Order order = orderRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("Order not found"));
    
    // Verify order involves authenticated farmer's products
    boolean ownsProduct = order.getOrderItems().stream()
        .anyMatch(item -> item.getFarmer().getId().equals(authenticatedUser.getId()));
    
    if (!ownsProduct) {
        throw new ForbiddenException("Cannot update order for products you don't own");
    }
    
    // Update status...
}

// Only BUYER can cancel orders
@PutMapping("/api/orders/{id}/cancel")
public Order cancelOrder(@PathVariable Long id,
                         @AuthenticationPrincipal User authenticatedUser) {
    // Verify user is BUYER
    if (authenticatedUser.getRole() != Role.BUYER) {
        throw new ForbiddenException("Only BUYER users can cancel orders");
    }
    
    Order order = orderRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("Order not found"));
    
    // Verify order belongs to authenticated buyer
    if (!order.getBuyer().getId().equals(authenticatedUser.getId())) {
        throw new ForbiddenException("Cannot cancel another buyer's order");
    }
    
    // Cancel order...
}
```

### Reviews Module

```java
// Only BUYER can submit reviews
@PostMapping("/api/reviews")
public Review createReview(@RequestBody ReviewRequest request,
                          @AuthenticationPrincipal User authenticatedUser) {
    // Verify user is BUYER
    if (authenticatedUser.getRole() != Role.BUYER) {
        throw new ForbiddenException("Only BUYER users can submit reviews");
    }
    
    // Verify buyerId matches authenticated user
    if (!request.getBuyerId().equals(authenticatedUser.getId())) {
        throw new ForbiddenException("Cannot submit review as another buyer");
    }
    
    // Verify completed order exists
    boolean hasCompletedOrder = orderRepository.existsByBuyerAndProductAndStatus(
        authenticatedUser.getId(),
        request.getProductId(),
        OrderStatus.COMPLETED
    );
    
    if (!hasCompletedOrder) {
        throw new BadRequestException(
            "You must have a completed order for this product to review it"
        );
    }
    
    // Verify no duplicate review
    if (reviewRepository.existsByBuyerAndProduct(
        authenticatedUser.getId(),
        request.getProductId()
    )) {
        throw new ConflictException("You have already reviewed this product");
    }
    
    // Create review...
}
```

### Messages Module

```java
// Sender must match authenticated user
@PostMapping("/api/messages")
public Message createMessage(@RequestBody MessageRequest request,
                            @AuthenticationPrincipal User authenticatedUser) {
    // Verify senderId matches authenticated user
    if (!request.getSenderId().equals(authenticatedUser.getId())) {
        throw new ForbiddenException("Cannot send message as another user");
    }
    
    // Create message...
}
```

## 4. Authentication Mechanism

### Current State

Frontend sends user credentials (email/password) and receives user object with ID. Frontend stores user ID in localStorage and sends it in subsequent requests.

### Recommended Approach (Without JWT)

Since we're not adding JWT yet, use **session-based authentication**:

1. **Login**: Backend creates a session and returns session ID
2. **Subsequent Requests**: Frontend sends session ID (in cookie or header)
3. **Backend**: Validates session and extracts authenticated user

### Alternative (Simpler for Now)

If session management is complex, use **request-based authentication**:

1. **Login**: Backend returns user object (as currently done)
2. **Subsequent Requests**: Frontend sends user ID + a signed token (simple HMAC)
3. **Backend**: Validates token signature and extracts user

### Implementation (Request-Based)

```java
// Generate token on login
public String generateAuthToken(User user) {
    String payload = user.getId() + ":" + user.getEmail() + ":" + System.currentTimeMillis();
    String signature = HMAC.sign(payload, SECRET_KEY);
    return Base64.encode(payload + ":" + signature);
}

// Validate token on each request
public User validateAuthToken(String token) {
    String[] parts = token.split(":");
    String payload = parts[0] + ":" + parts[1] + ":" + parts[2];
    String signature = parts[3];
    
    if (!HMAC.verify(payload, signature, SECRET_KEY)) {
        throw new UnauthorizedException("Invalid token");
    }
    
    // Extract user ID and fetch user
    Long userId = Long.parseLong(parts[0]);
    return userRepository.findById(userId)
        .orElseThrow(() -> new UnauthorizedException("User not found"));
}
```

## 5. Error Handling

### Security Error Responses

All security-related errors should return appropriate HTTP status codes:

- **401 Unauthorized**: Invalid credentials, expired session, invalid token
- **403 Forbidden**: Valid user but insufficient permissions
- **404 Not Found**: Resource not found (can be used to hide existence)
- **409 Conflict**: Duplicate resource (e.g., duplicate review)

### Error Message Guidelines

- **Login/Signup Errors**: Generic messages to prevent user enumeration
  - "Invalid credentials" (don't say "user not found" vs "wrong password")
- **Authorization Errors**: Clear messages for debugging
  - "Only FARMER users can create products"
  - "Cannot access another user's data"

## 6. Data Protection

### Sensitive Data

- **Passwords**: Never return in API responses
- **User IDs**: Can be returned (needed for frontend)
- **Email**: Can be returned (needed for display)

### Response DTOs

Create DTOs that exclude sensitive fields:

```java
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private Role role;
    // NO password field
}
```

## 7. Testing Checklist

- [ ] Passwords are hashed on signup
- [ ] Passwords are compared using BCrypt on login
- [ ] Plain-text passwords are migrated on first login
- [ ] User identity is validated on all user-specific requests
- [ ] Role checks are enforced on all protected endpoints
- [ ] Farmers cannot create products for other farmers
- [ ] Buyers cannot place orders for other buyers
- [ ] Buyers cannot cancel other buyers' orders
- [ ] Farmers cannot update orders for products they don't own
- [ ] Error messages don't leak sensitive information
- [ ] Passwords are never logged
- [ ] Passwords are never returned in API responses

## 8. Migration Strategy

### Existing Users

1. **Detect Plain-Text Passwords**: Check if password starts with BCrypt prefix
2. **Migrate on Login**: Hash password on first successful login after security update
3. **Gradual Migration**: All users will be migrated as they log in
4. **Admin Tool** (Optional): Batch migration script for testing

### Database Schema

No schema changes needed if using existing `password` field. Just ensure:
- New users: Always store hashed passwords
- Existing users: Migrate on first login

## Summary

The backend must:

1. ✅ Hash all passwords using BCrypt
2. ✅ Validate user identity on every request
3. ✅ Enforce role-based authorization consistently
4. ✅ Support backward compatibility for plain-text passwords
5. ✅ Never store or log plain-text passwords
6. ✅ Return appropriate error messages without leaking information

Frontend changes: **NONE** - All security is enforced server-side.

