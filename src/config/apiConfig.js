// Centralized API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH_SIGNUP: `${API_BASE_URL}/auth/signup`,
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  
  // Products
  PRODUCTS: `${API_BASE_URL}/products`,
  PRODUCTS_BY_FARMER: (farmerId) => `${API_BASE_URL}/products/farmer/${farmerId}`,
  PRODUCT: (id) => `${API_BASE_URL}/products/${id}`,
  
  // Orders
  ORDERS: `${API_BASE_URL}/orders`,
  ORDERS_BY_BUYER: (buyerId) => `${API_BASE_URL}/orders/buyer/${buyerId}`,
  ORDERS_BY_FARMER: (farmerId) => `${API_BASE_URL}/orders/farmer/${farmerId}`,
  ORDER_UPDATE_STATUS: (orderId) => `${API_BASE_URL}/orders/${orderId}/status`,
  ORDER_CANCEL: (orderId) => `${API_BASE_URL}/orders/${orderId}/cancel`,
  
  // Reviews
  REVIEWS: `${API_BASE_URL}/reviews`,
  REVIEWS_BY_PRODUCT: (productId) => `${API_BASE_URL}/reviews/product/${productId}`,
  
  // Messages
  MESSAGES: `${API_BASE_URL}/messages`,
  MESSAGES_BY_PRODUCT: (productId) => `${API_BASE_URL}/messages/product/${productId}`,
  MESSAGES_BY_USER: (userId) => `${API_BASE_URL}/messages/user/${userId}`,
};

export default API_BASE_URL;

