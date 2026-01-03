# Review Validation Integration

This document describes the backend-driven review validation system for AgriConnect.

## Overview

Reviews are now validated by the backend to ensure they reflect verified purchases. Only buyers who have completed orders for a product can review it, and each buyer can review a product only once.

## Business Rules (Backend Must Enforce)

### 1. Review Ownership Rules

**Validation Checks:**
- Reviewer must have role = BUYER
- Reviewer must have at least one COMPLETED order containing the reviewed product
- Reject review attempts if no such order exists

**Error Messages:**
- `403 Forbidden`: "Only BUYER users can submit reviews"
- `400 Bad Request`: "You must have a completed order for this product to review it"

### 2. Duplicate Prevention

**Validation:**
- One review per (buyer, product) pair
- Reject duplicate review submissions

**Error Message:**
- `409 Conflict`: "You have already reviewed this product"

### 3. Review Persistence

**Required Fields:**
- `product` - Reference to Product entity
- `buyer` - Reference to User entity (BUYER role)
- `rating` - Integer (typically 1-5)
- `comment` - Text
- `timestamp` - Date/time when review was created

**Backend Authority:**
- Backend is the single source of truth for reviews
- All review data is persisted in database
- No localStorage fallback

### 4. Rating Aggregation

**Backend Calculation:**
- Average product rating calculated from persisted reviews
- Ratings update correctly after new reviews
- Product rating remains consistent across refresh

**Product Entity:**
- Should have `averageRating` field (computed)
- Should have `reviewCount` field (computed)

## Backend API Requirements

### POST `/api/reviews`

**Request Body:**
```json
{
  "productId": 5,
  "buyerId": 1,
  "rating": 5,
  "comment": "Great product!"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "product": {
    "id": 5,
    "name": "Tomatoes"
  },
  "buyer": {
    "id": 1,
    "name": "John Buyer",
    "email": "buyer@example.com"
  },
  "rating": 5,
  "comment": "Great product!",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

1. **403 Forbidden** - User is not BUYER role
```json
{
  "message": "Only BUYER users can submit reviews"
}
```

2. **400 Bad Request** - No completed order for product
```json
{
  "message": "You must have a completed order for this product to review it"
}
```

3. **409 Conflict** - Duplicate review
```json
{
  "message": "You have already reviewed this product"
}
```

4. **404 Not Found** - Product not found
```json
{
  "message": "Product not found"
}
```

### Validation Logic (Backend)

```java
// Pseudocode for backend validation
public Review createReview(ReviewRequest request, User currentUser) {
    // 1. Check user role
    if (currentUser.getRole() != BUYER) {
        throw new ForbiddenException("Only BUYER users can submit reviews");
    }
    
    // 2. Check product exists
    Product product = productRepository.findById(request.getProductId())
        .orElseThrow(() -> new NotFoundException("Product not found"));
    
    // 3. Check for completed order
    boolean hasCompletedOrder = orderRepository.existsByBuyerAndProductAndStatus(
        currentUser.getId(),
        product.getId(),
        OrderStatus.COMPLETED
    );
    
    if (!hasCompletedOrder) {
        throw new BadRequestException(
            "You must have a completed order for this product to review it"
        );
    }
    
    // 4. Check for duplicate review
    boolean alreadyReviewed = reviewRepository.existsByBuyerAndProduct(
        currentUser.getId(),
        product.getId()
    );
    
    if (alreadyReviewed) {
        throw new ConflictException("You have already reviewed this product");
    }
    
    // 5. Create review
    Review review = new Review();
    review.setProduct(product);
    review.setBuyer(currentUser);
    review.setRating(request.getRating());
    review.setComment(request.getComment());
    review.setTimestamp(LocalDateTime.now());
    
    Review savedReview = reviewRepository.save(review);
    
    // 6. Update product rating (if needed)
    updateProductRating(product);
    
    return savedReview;
}

private void updateProductRating(Product product) {
    List<Review> reviews = reviewRepository.findByProduct(product);
    double averageRating = reviews.stream()
        .mapToInt(Review::getRating)
        .average()
        .orElse(0.0);
    
    product.setAverageRating(averageRating);
    product.setReviewCount(reviews.size());
    productRepository.save(product);
}
```

## Frontend Changes

### 1. Review Service Updates (`src/services/reviewService.js`)

- Enhanced error handling to extract backend error messages
- Displays user-friendly error messages from backend
- No UI changes - same review submission flow

### 2. BuyerDashboard Updates (`src/Components/dashboards/BuyerDashboard.jsx`)

- Updated error handling to show backend validation messages
- Uses backend-verified buyer ID
- No UI changes - same review popup and submission

### 3. DataContext (`src/Components/context/DataContext.jsx`)

- No changes needed - already uses reviewService
- Error propagation works correctly

## User Experience

### Successful Review Flow

1. Buyer clicks "Review" button on product
2. Review popup opens (unchanged UI)
3. Buyer enters rating and comment
4. Buyer submits review
5. Backend validates:
   - User is BUYER ✓
   - Has completed order for product ✓
   - Hasn't reviewed before ✓
6. Review is saved
7. Product rating updates
8. Popup closes, review appears in product reviews

### Error Scenarios

**Scenario 1: Farmer tries to review**
- Backend returns: "Only BUYER users can submit reviews"
- Frontend shows alert with this message

**Scenario 2: Buyer without completed order**
- Backend returns: "You must have a completed order for this product to review it"
- Frontend shows alert with this message

**Scenario 3: Buyer tries to review twice**
- Backend returns: "You have already reviewed this product"
- Frontend shows alert with this message

## Authorization & Safety

### Backend Enforcement (Required)

1. **Role Check**
   - Verify user role is BUYER
   - Return 403 if not BUYER

2. **Order Check**
   - Verify buyer has COMPLETED order with product
   - Check OrderItem table for product match
   - Return 400 if no completed order

3. **Duplicate Check**
   - Verify no existing review for (buyer, product) pair
   - Return 409 if duplicate

4. **Product Check**
   - Verify product exists
   - Return 404 if not found

### Frontend Safety

- No frontend validation (backend is authority)
- Error messages displayed to user
- Review button remains available (backend will reject if invalid)
- No UI changes to prevent invalid submissions

## Data Integrity

- Reviews are always tied to:
  - A specific product (required)
  - A specific buyer (required)
  - A verified purchase (COMPLETED order)
- One review per (buyer, product) pair
- Rating aggregation is backend-calculated
- No localStorage fallback for reviews

## Testing Checklist

- [ ] BUYER can review product after completing order
- [ ] BUYER cannot review product without completed order
- [ ] BUYER cannot review same product twice
- [ ] FARMER cannot submit reviews (403 error)
- [ ] Error messages are user-friendly
- [ ] Product rating updates after new review
- [ ] Reviews persist across page refresh
- [ ] Rating aggregation is correct
- [ ] Review count is accurate

## Migration Notes

- Existing reviews in database may need validation
- Consider migration script to:
  - Remove reviews from users without completed orders
  - Remove duplicate reviews (keep first one)
  - Recalculate product ratings

