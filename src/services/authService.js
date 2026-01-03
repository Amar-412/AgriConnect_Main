import { API_ENDPOINTS } from '../config/apiConfig';

/**
 * Authentication API service
 * Handles all authentication-related API calls
 * Backend is the single source of truth for user identity
 */
export const authService = {
  /**
   * Register a new user
   * @param {string} name - User's full name
   * @param {string} email - User's email (must be unique)
   * @param {string} password - User's password (will be hashed by backend)
   * @param {string} role - User's role ('FARMER' or 'BUYER')
   * @returns {Promise<Object>} User object with id, name, email, role
   * 
   * Note: Password is sent to backend in plain text over HTTPS.
   * Backend MUST hash the password using BCrypt before storing.
   * Plain-text passwords must never be stored or logged.
   */
  async signup(name, email, password, role) {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH_SIGNUP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: role.toUpperCase(), // Backend expects FARMER/BUYER
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Signup failed: ${response.statusText}`);
      }

      const userData = await response.json();
      // Backend returns: { id, name, email, role }
      return {
        id: userData.id,
        userId: userData.id, // For backward compatibility
        name: userData.name,
        email: userData.email,
        role: userData.role,
        loginType: 'manual',
      };
    } catch (error) {
      console.error('[AuthService] Error during signup:', error);
      throw error;
    }
  },

  /**
   * Login with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password (will be compared with hashed password by backend)
   * @returns {Promise<Object>} User object with id, name, email, role
   * 
   * Note: Password is sent to backend in plain text over HTTPS.
   * Backend MUST compare using BCrypt password matcher.
   * Backend MUST support backward compatibility for existing plain-text passwords (migrate on first login).
   */
  async login(email, password) {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${response.statusText}`);
      }

      const userData = await response.json();
      // Backend returns: { id, name, email, role }
      return {
        id: userData.id,
        userId: userData.id, // For backward compatibility
        name: userData.name,
        email: userData.email,
        role: userData.role,
        loginType: 'manual',
      };
    } catch (error) {
      console.error('[AuthService] Error during login:', error);
      throw error;
    }
  },
};

