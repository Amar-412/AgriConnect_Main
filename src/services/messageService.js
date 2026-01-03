import { API_ENDPOINTS } from '../config/apiConfig';

/**
 * Message API service
 * Handles all message-related API calls
 */
export const messageService = {
  /**
   * Fetch all messages
   */
  async getAllMessages() {
    try {
      const response = await fetch(API_ENDPOINTS.MESSAGES);
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[MessageService] Error fetching all messages:', error);
      throw error;
    }
  },

  /**
   * Fetch messages by product ID
   */
  async getMessagesByProduct(productId) {
    try {
      const response = await fetch(API_ENDPOINTS.MESSAGES_BY_PRODUCT(productId));
      if (!response.ok) {
        throw new Error(`Failed to fetch product messages: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[MessageService] Error fetching product messages:', error);
      throw error;
    }
  },

  /**
   * Fetch messages by user ID
   */
  async getMessagesByUser(userId) {
    try {
      const response = await fetch(API_ENDPOINTS.MESSAGES_BY_USER(userId));
      if (!response.ok) {
        throw new Error(`Failed to fetch user messages: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[MessageService] Error fetching user messages:', error);
      throw error;
    }
  },

  /**
   * Create a new message
   * Backend is the single source of truth for sender/receiver identity
   */
  async createMessage(messageData) {
    try {
      // Primary fields: senderId and receiverId are required and explicit
      const senderId = messageData.senderId || messageData.fromUserId || '';
      const receiverId = messageData.receiverId || messageData.toUserId || '';
      const senderName = messageData.senderName || messageData.fromUserName || '';
      const receiverName = messageData.receiverName || messageData.toUserName || '';
      
      const payload = {
        // Core identity fields - backend uses these as source of truth
        senderId: senderId,
        receiverId: receiverId,
        senderName: senderName,
        receiverName: receiverName,
        senderRole: messageData.senderRole || 'buyer',
        
        // Message content
        content: messageData.content || messageData.body || '',
        productId: messageData.productId || '',
        productName: messageData.productName || '',
        
        // Timestamps
        timestamp: messageData.timestamp || Date.now(),
        createdAt: messageData.createdAt || Date.now(),
        
        // Backward compatibility fields (for existing backend that might use these)
        messageId: messageData.messageId || Date.now().toString(),
        buyerId: messageData.buyerId || (messageData.senderRole === 'buyer' ? senderId : ''),
        buyerName: messageData.buyerName || (messageData.senderRole === 'buyer' ? senderName : ''),
        farmerId: messageData.farmerId || (messageData.senderRole === 'farmer' ? senderId : ''),
        farmerName: messageData.farmerName || (messageData.senderRole === 'farmer' ? senderName : ''),
        fromUserId: senderId,
        fromUserName: senderName,
        toUserId: receiverId,
        toUserName: receiverName,
        body: messageData.content || messageData.body || '',
      };

      const response = await fetch(API_ENDPOINTS.MESSAGES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Try to extract error message from backend response
        let errorMessage = `Failed to create message: ${response.statusText}`;
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
      console.error('[MessageService] Error creating message:', error);
      throw error;
    }
  },
};

