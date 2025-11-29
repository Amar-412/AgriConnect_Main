import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_PRODUCTS_KEY = 'products';
const STORAGE_ORDERS_KEY = 'orders';
const STORAGE_REVIEWS_KEY = 'reviews';
const STORAGE_MESSAGES_KEY = 'messages';
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
  const [products, setProducts] = useState(() => readJson(STORAGE_PRODUCTS_KEY, []));
  const [orders, setOrders] = useState(() => readJson(STORAGE_ORDERS_KEY, []));
  const [reviews, setReviews] = useState(() => readJson(STORAGE_REVIEWS_KEY, []));
  const [messages, setMessages] = useState(() => readJson(STORAGE_MESSAGES_KEY, []));
  const [cartByUserId, setCartByUserId] = useState(() => readJson(STORAGE_CART_KEY, {}));

  useEffect(() => {
    writeJson(STORAGE_PRODUCTS_KEY, products);
  }, [products]);

  useEffect(() => {
    writeJson(STORAGE_ORDERS_KEY, orders);
  }, [orders]);

  useEffect(() => {
    writeJson(STORAGE_REVIEWS_KEY, reviews);
  }, [reviews]);

  useEffect(() => {
    writeJson(STORAGE_MESSAGES_KEY, messages);
  }, [messages]);

  useEffect(() => {
    writeJson(STORAGE_CART_KEY, cartByUserId);
  }, [cartByUserId]);

  const addProduct = (product, farmerInfo) => {
    // Ensure farmer info is included from logged-in user
    const farmerId = farmerInfo?.userId || farmerInfo?.email || product.farmerId || product.ownerId || '';
    const farmerEmail = farmerInfo?.email || product.farmerEmail || '';
    const farmerName = farmerInfo?.name || product.farmerName || '';
    
    setProducts((prev) => [
      ...prev,
      {
        ...product,
        id: Date.now().toString(),
        name: product.name || '',
        price: Number(product.price || 0),
        quantity: Number(product.quantity || product.inventory || 0),
        farmerId,
        farmerEmail,
        farmerName,
        image: product.image || product.imageDataUrl || '',
        category: product.category || 'General',
        location: product.location || '',
        // Keep for backward compatibility
        ownerId: farmerId,
        imageDataUrl: product.image || product.imageDataUrl || '',
        inventory: Number(product.quantity || product.inventory || 0)
      },
    ]);
  };

  const updateProduct = (id, updates) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const placeOrder = (order) => {
    setOrders((prev) => [
      ...prev,
      {
        ...order,
        id: Date.now().toString(),
        status: 'placed',
        createdAt: Date.now(),
      },
    ]);
    // decrement product inventory
    setProducts((prev) =>
      prev.map((p) => (p.id === order.productId ? { ...p, inventory: Math.max(0, (p.inventory || 0) - (order.quantity || 0)) } : p))
    );
  };

  const updateOrderStatus = (id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  // Reviews
  const addReview = (review) => {
    setReviews((prev) => [
      ...prev,
      {
        ...review,
        id: Date.now().toString(),
        createdAt: Date.now(),
      },
    ]);
  };

  // Messages between buyer and farmer
  const sendMessage = (message) => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        id: Date.now().toString(),
        createdAt: Date.now(),
      },
    ]);
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

  const value = useMemo(
    () => ({
      products,
      orders,
      reviews,
      messages,
      cartByUserId,
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
    }),
    [products, orders, reviews, messages, cartByUserId]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;



