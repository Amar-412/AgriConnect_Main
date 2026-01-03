import { API_ENDPOINTS } from '../config/apiConfig';

/**
 * Order API service
 * Handles all order-related API calls
 * Backend is the single source of truth for orders
 */
export const orderService = {
  /**
   * Place an order (create order with order items)
   * @param {Object} orderData - Order data with items
   * @param {string} orderData.buyerId - Backend-verified buyer ID
   * @param {Array} orderData.items - Array of order items
   * @returns {Promise<Object>} Created order with order items
   */
  async placeOrder(orderData) {
    try {
      const payload = {
        buyerId: orderData.buyerId,
        items: orderData.items.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity || 1),
          priceAtPurchase: Number(item.price || 0), // Capture price at purchase time
          farmerId: item.farmerId || '', // Backend will validate farmer exists
        })),
      };

      const response = await fetch(API_ENDPOINTS.ORDERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Try to extract error message from backend response
        let errorMessage = `Failed to place order: ${response.statusText}`;
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
      console.error('[OrderService] Error placing order:', error);
      throw error;
    }
  },

  /**
   * Get all orders for a buyer
   * @param {string} buyerId - Backend-verified buyer ID
   * @returns {Promise<Array>} Array of orders with order items
   */
  async getBuyerOrders(buyerId) {
    try {
      const response = await fetch(API_ENDPOINTS.ORDERS_BY_BUYER(buyerId));
      if (!response.ok) {
        throw new Error(`Failed to fetch buyer orders: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[OrderService] Error fetching buyer orders:', error);
      throw error;
    }
  },

  /**
   * Get all orders for a farmer (orders for products owned by farmer)
   * @param {string} farmerId - Backend-verified farmer ID
   * @returns {Promise<Array>} Array of order items for farmer's products
   */
  async getFarmerOrders(farmerId) {
    try {
      const response = await fetch(API_ENDPOINTS.ORDERS_BY_FARMER(farmerId));
      if (!response.ok) {
        throw new Error(`Failed to fetch farmer orders: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[OrderService] Error fetching farmer orders:', error);
      throw error;
    }
  },

  /**
   * Update order status (farmer actions: ACCEPT, SHIP, COMPLETE)
   * @param {string} orderId - Order ID
   * @param {string} newStatus - New status (ACCEPTED, SHIPPED, COMPLETED)
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(orderId, newStatus) {
    try {
      const response = await fetch(API_ENDPOINTS.ORDER_UPDATE_STATUS(orderId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        // Try to extract error message from backend response
        let errorMessage = `Failed to update order status: ${response.statusText}`;
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
      console.error('[OrderService] Error updating order status:', error);
      throw error;
    }
  },

  /**
   * Cancel an order (buyer action: PLACED → CANCELLED)
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Updated order
   */
  async cancelOrder(orderId) {
    try {
      const response = await fetch(API_ENDPOINTS.ORDER_CANCEL(orderId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Try to extract error message from backend response
        let errorMessage = `Failed to cancel order: ${response.statusText}`;
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
      console.error('[OrderService] Error cancelling order:', error);
      throw error;
    }
  },
};
