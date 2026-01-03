import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import { messageService } from '../../services/messageService';

const STORAGE_ORDERS_KEY = 'orders';
const STORAGE_CART_KEY = 'cart_by_user';

const DataContext = createContext(null);

export const useData = () => useContext(DataContext);

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const DataProvider = ({ children }) => {
  // Products, reviews, and messages are now fetched from backend
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Orders and cart remain in localStorage
  const [orders, setOrders] = useState(() => readJson(STORAGE_ORDERS_KEY, []));
  const [cartByUserId, setCartByUserId] = useState(() => readJson(STORAGE_CART_KEY, {}));

  // Loading states
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Fetch products from backend on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const fetchedProducts = await productService.getAllProducts();
        setProducts(fetchedProducts || []);
      } catch (error) {
        console.error('[DataContext] Error loading products:', error);
        // Fallback to empty array on error
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch reviews from backend on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const fetchedReviews = await reviewService.getAllReviews();
        setReviews(fetchedReviews || []);
      } catch (error) {
        console.error('[DataContext] Error loading reviews:', error);
        // Fallback to empty array on error
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, []);

  // Fetch messages from backend on mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const fetchedMessages = await messageService.getAllMessages();
        setMessages(fetchedMessages || []);
      } catch (error) {
        console.error('[DataContext] Error loading messages:', error);
        // Fallback to empty array on error
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, []);

  // Keep orders in localStorage
  useEffect(() => {
    writeJson(STORAGE_ORDERS_KEY, orders);
  }, [orders]);

  // Keep cart in localStorage
  useEffect(() => {
    writeJson(STORAGE_CART_KEY, cartByUserId);
  }, [cartByUserId]);

  const addProduct = async (product, farmerInfo) => {
    try {
      const newProduct = await productService.createProduct(product, farmerInfo);
      // Refresh products list from backend
      const fetchedProducts = await productService.getAllProducts();
      setProducts(fetchedProducts || []);
      return newProduct;
    } catch (error) {
      console.error('[DataContext] Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      await productService.updateProduct(id, updates);
      // Refresh products list from backend
      const fetchedProducts = await productService.getAllProducts();
      setProducts(fetchedProducts || []);
    } catch (error) {
      console.error('[DataContext] Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productService.deleteProduct(id);
      // Refresh products list from backend
      const fetchedProducts = await productService.getAllProducts();
      setProducts(fetchedProducts || []);
    } catch (error) {
      console.error('[DataContext] Error deleting product:', error);
      throw error;
    }
  };

  const placeOrder = async (order) => {
    // Add order to localStorage (orders remain in localStorage as specified)
    setOrders((prev) => [
      ...prev,
      {
        ...order,
        id: Date.now().toString(),
        status: 'placed',
        createdAt: Date.now(),
      },
    ]);
    // Product inventory is managed by backend - refresh products to get updated inventory
    try {
      const fetchedProducts = await productService.getAllProducts();
      setProducts(fetchedProducts || []);
    } catch (error) {
      console.error('[DataContext] Error refreshing products after order:', error);
      // Continue even if refresh fails - order is still placed
    }
  };

  const updateOrderStatus = (id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  // Reviews
  const addReview = async (review) => {
    try {
      const newReview = await reviewService.createReview(review);
      // Refresh reviews list from backend
      const fetchedReviews = await reviewService.getAllReviews();
      setReviews(fetchedReviews || []);
      return newReview;
    } catch (error) {
      console.error('[DataContext] Error adding review:', error);
      throw error;
    }
  };

  // Messages between buyer and farmer
  const sendMessage = async (message) => {
    try {
      const newMessage = await messageService.createMessage(message);
      // Refresh messages list from backend
      const fetchedMessages = await messageService.getAllMessages();
      setMessages(fetchedMessages || []);
      return newMessage;
    } catch (error) {
      console.error('[DataContext] Error sending message:', error);
      throw error;
    }
  };

  // Cart helpers - optimized to store only productId + quantity to avoid QuotaExceededError
  // All other data (name, price, image, farmer info) is looked up from products array
  const addToCart = (userId, item, productInfo = null) => {
    if (!userId || !item.productId) return;
    
    // Store only minimal data: productId and quantity
    // This prevents QuotaExceededError from storing large base64 images
    const cartItem = {
      productId: item.productId,
      quantity: Number(item.quantity || 1)
    };
    
    setCartByUserId((prev) => {
      const cart = prev[userId] || [];
      const existingIndex = cart.findIndex((c) => c.productId === item.productId);
      let nextCart;
      if (existingIndex >= 0) {
        // Update quantity for existing item
        nextCart = cart.map((c, i) => 
          i === existingIndex 
            ? { ...c, quantity: Number(c.quantity || 0) + Number(item.quantity || 1) } 
            : c
        );
      } else {
        // Add new item
        nextCart = [...cart, cartItem];
      }
      return { ...prev, [userId]: nextCart };
    });
  };
  
  // Helper to get full cart item with product details
  const getCartItemWithDetails = (cartItem) => {
    const product = products.find(p => p.id === cartItem.productId);
    if (!product) {
      return {
        ...cartItem,
        name: 'Unknown Product',
        price: 0,
        image: null,
        farmerId: '',
        farmerEmail: '',
        farmerName: ''
      };
    }
    
    return {
      productId: cartItem.productId,
      quantity: Number(cartItem.quantity || 1),
      name: product.name || '',
      price: Number(product.price || 0),
      image: product.image || product.imageDataUrl || '',
      farmerId: product.farmerId || product.ownerId || '',
      farmerEmail: product.farmerEmail || '',
      farmerName: product.farmerName || '',
      // Backward compatibility
      productName: product.name || '',
      productImage: product.image || product.imageDataUrl || '',
      imageDataUrl: product.image || product.imageDataUrl || ''
    };
  };

  const removeFromCart = (userId, productId) => {
    setCartByUserId((prev) => ({ ...prev, [userId]: (prev[userId] || []).filter((i) => i.productId !== productId) }));
  };

  const updateCartItemQuantity = (userId, productId, quantity) => {
    setCartByUserId((prev) => {
      const cart = prev[userId] || [];
      const next = cart
        .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(1, Number(quantity) || 1) } : item))
        .filter((item) => (Number(item.quantity) || 0) > 0);
      return { ...prev, [userId]: next };
    });
  };

  const clearCart = (userId) => {
    setCartByUserId((prev) => ({ ...prev, [userId]: [] }));
  };

  // Refresh functions for manual refresh
  const refreshProducts = async () => {
    try {
      const fetchedProducts = await productService.getAllProducts();
      setProducts(fetchedProducts || []);
    } catch (error) {
      console.error('[DataContext] Error refreshing products:', error);
    }
  };

  const refreshReviews = async () => {
    try {
      const fetchedReviews = await reviewService.getAllReviews();
      setReviews(fetchedReviews || []);
    } catch (error) {
      console.error('[DataContext] Error refreshing reviews:', error);
    }
  };

  const refreshMessages = async () => {
    try {
      const fetchedMessages = await messageService.getAllMessages();
      setMessages(fetchedMessages || []);
    } catch (error) {
      console.error('[DataContext] Error refreshing messages:', error);
    }
  };

  const value = useMemo(
    () => ({
      products,
      orders,
      reviews,
      messages,
      cartByUserId,
      loadingProducts,
      loadingReviews,
      loadingMessages,
      addProduct,
      updateProduct,
      deleteProduct,
      placeOrder,
      updateOrderStatus,
      addReview,
      sendMessage,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
      getCartItemWithDetails, // Helper to get full cart item details
      refreshProducts,
      refreshReviews,
      refreshMessages,
    }),
    [products, orders, reviews, messages, cartByUserId, loadingProducts, loadingReviews, loadingMessages]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;



