/**
 * Data Migration Utility
 * Repairs and normalizes old localStorage data to match the unified schema
 * Runs silently on app startup - never throws errors
 */

export const migrateData = () => {
  try {
    let hasChanges = false;

    // Migrate user from auth_user to loggedInUser with unified schema
    const oldUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    
    if (oldUser && !loggedInUser) {
      const unifiedUser = {
        userId: oldUser.email || oldUser.id || '',
        id: oldUser.email || oldUser.id || '', // For backward compatibility
        name: oldUser.name || '',
        email: oldUser.email || '',
        role: oldUser.role || 'Buyer',
        picture: oldUser.picture || '',
        loginType: oldUser.loginType || 'manual'
      };
      localStorage.setItem('loggedInUser', JSON.stringify(unifiedUser));
      hasChanges = true;
    }
    
    // Ensure all users in users array follow unified schema
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (Array.isArray(users)) {
      const migratedUsers = users.map(u => {
        const migrated = { ...u };
        
        // Ensure userId exists
        if (!migrated.userId) {
          migrated.userId = migrated.email || migrated.id || '';
          hasChanges = true;
        }
        
        // Ensure id exists for backward compatibility
        if (!migrated.id) {
          migrated.id = migrated.userId || migrated.email || '';
          hasChanges = true;
        }
        
        // Ensure loginType exists
        if (!migrated.loginType) {
          migrated.loginType = 'manual';
          hasChanges = true;
        }
        
        // Normalize role
        if (migrated.role) {
          const normalizedRole = migrated.role.charAt(0).toUpperCase() + migrated.role.slice(1).toLowerCase();
          if (migrated.role !== normalizedRole) {
            migrated.role = normalizedRole;
            hasChanges = true;
          }
        }
        
        return migrated;
      });
      
      if (hasChanges) {
        localStorage.setItem('users', JSON.stringify(migratedUsers));
      }
    }

    // Products are now managed by backend API - no localStorage migration needed
    // Product data should be fetched from backend APIs only

    // Migrate cart items to optimized schema (only productId + quantity to avoid QuotaExceededError)
    const cartByUser = JSON.parse(localStorage.getItem('cart_by_user') || '{}');
    if (Object.keys(cartByUser).length > 0) {
      let cartChanged = false;
      const migratedCart = {};
      
      Object.entries(cartByUser).forEach(([userId, items]) => {
        if (Array.isArray(items)) {
          const migratedItems = items.map(item => {
            // Optimize: Store only productId + quantity to prevent QuotaExceededError
            // Remove large base64 images and other unnecessary data
            const optimized = {
              productId: item.productId || '',
              quantity: Number(item.quantity || 1)
            };
            
            // Only mark as changed if we're actually removing data or fixing quantity
            if (item.image || item.imageDataUrl || item.productImage || item.name || item.price || item.farmerId) {
              cartChanged = true;
            }
            if (typeof item.quantity === 'string') {
              optimized.quantity = Number(item.quantity) || 1;
              cartChanged = true;
            }
            
            return optimized;
          });
          migratedCart[userId] = migratedItems;
        } else {
          migratedCart[userId] = items;
        }
      });
      
      if (cartChanged) {
        localStorage.setItem('cart_by_user', JSON.stringify(migratedCart));
        hasChanges = true;
      }
    }

    // Migrate transactions to unified schema
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    if (Array.isArray(transactions)) {
      const migratedTransactions = transactions.map((tx) => {
        const migrated = { ...tx };
        
        // Ensure total is a number
        if (typeof migrated.total === 'string') {
          migrated.total = Number(migrated.total) || 0;
          hasChanges = true;
        }
        
        // Recompute total from items if missing
        if (!migrated.total && migrated.items && Array.isArray(migrated.items)) {
          migrated.total = migrated.items.reduce((sum, item) => {
            const price = Number(item.price || 0);
            const qty = Number(item.quantity || 0);
            return sum + (price * qty);
          }, 0);
          hasChanges = true;
        }
        
        // Ensure items have proper types
        if (migrated.items && Array.isArray(migrated.items)) {
          migrated.items = migrated.items.map(item => ({
            ...item,
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 0)
          }));
        }
        
        // Farmer info should come from transaction items or be set separately
        // Products are now backend-only, so we can't look them up from localStorage
        
        // Ensure buyer info exists
        if (!migrated.buyerEmail && migrated.buyerId) {
          try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const buyer = users.find(u => u.id === migrated.buyerId || u.email === migrated.buyerId);
            if (buyer) {
              migrated.buyerEmail = buyer.email || '';
              migrated.buyerName = buyer.name || '';
              hasChanges = true;
            }
          } catch (e) {
            // Silent fail
          }
        }
        
        return migrated;
      });
      
      if (hasChanges) {
        localStorage.setItem('transactions', JSON.stringify(migratedTransactions));
      }
    }

  } catch (error) {
    // Never throw - migration failures should not break the app
    console.warn('[Migration] Error during data migration:', error);
  }
};

