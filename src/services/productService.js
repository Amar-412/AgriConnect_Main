import { API_ENDPOINTS } from '../config/apiConfig';

/**
 * Product API service
 * Handles all product-related API calls
 */
export const productService = {
  /**
   * Fetch all products
   */
  async getAllProducts() {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCTS);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[ProductService] Error fetching all products:', error);
      throw error;
    }
  },

  /**
   * Fetch products by farmer ID
   */
  async getProductsByFarmer(farmerId) {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCTS_BY_FARMER(farmerId));
      if (!response.ok) {
        throw new Error(`Failed to fetch farmer products: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[ProductService] Error fetching farmer products:', error);
      throw error;
    }
  },

  /**
   * Fetch a single product by ID
   */
  async getProductById(id) {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT(id));
      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[ProductService] Error fetching product:', error);
      throw error;
    }
  },

  /**
   * Create a new product
   */
  async createProduct(productData, farmerInfo) {
    try {
      const payload = {
        name: productData.name || '',
        description: productData.description || '',
        price: Number(productData.price || 0),
        quantity: Number(productData.quantity || productData.inventory || 0),
        inventory: Number(productData.quantity || productData.inventory || 0),
        category: productData.category || 'General',
        location: productData.location || '',
        image: productData.image || productData.imageDataUrl || '',
        imageDataUrl: productData.image || productData.imageDataUrl || '',
        farmerId: farmerInfo?.userId || farmerInfo?.email || productData.farmerId || '',
        farmerEmail: farmerInfo?.email || productData.farmerEmail || '',
        farmerName: farmerInfo?.name || productData.farmerName || '',
        ownerId: farmerInfo?.userId || farmerInfo?.email || productData.farmerId || '',
      };

      const response = await fetch(API_ENDPOINTS.PRODUCTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Try to extract error message from backend response
        let errorMessage = `Failed to create product: ${response.statusText}`;
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
      console.error('[ProductService] Error creating product:', error);
      throw error;
    }
  },

  /**
   * Update a product
   */
  async updateProduct(id, updates) {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update product: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[ProductService] Error updating product:', error);
      throw error;
    }
  },

  /**
   * Delete a product
   */
  async deleteProduct(id) {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT(id), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete product: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('[ProductService] Error deleting product:', error);
      throw error;
    }
  },
};

