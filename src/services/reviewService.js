import { API_ENDPOINTS } from '../config/apiConfig';

/**
 * Review API service
 * Handles all review-related API calls
 */
export const reviewService = {
  /**
   * Fetch all reviews
   */
  async getAllReviews() {
    try {
      const response = await fetch(API_ENDPOINTS.REVIEWS);
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[ReviewService] Error fetching all reviews:', error);
      throw error;
    }
  },

  /**
   * Fetch reviews by product ID
   */
  async getReviewsByProduct(productId) {
    try {
      const response = await fetch(API_ENDPOINTS.REVIEWS_BY_PRODUCT(productId));
      if (!response.ok) {
        throw new Error(`Failed to fetch product reviews: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[ReviewService] Error fetching product reviews:', error);
      throw error;
    }
  },

  /**
   * Create a new review
   * Backend will validate:
   * - Reviewer must be BUYER role
   * - Reviewer must have COMPLETED order with the product
   * - One review per (buyer, product) pair
   */
  async createReview(reviewData) {
    try {
      const payload = {
        productId: reviewData.productId,
        farmerId: reviewData.farmerId,
        buyerId: reviewData.buyerId, // Backend-verified buyer ID
        buyerName: reviewData.buyerName || 'Anonymous',
        rating: Number(reviewData.rating || 5),
        comment: reviewData.comment || '',
      };

      const response = await fetch(API_ENDPOINTS.REVIEWS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Try to extract error message from backend response
        let errorMessage = `Failed to create review: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('[ReviewService] Error creating review:', error);
      throw error;
    }
  },
};

