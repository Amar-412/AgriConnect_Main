import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../../services/authService';

const STORAGE_USER_KEY = 'loggedInUser'; // Store only logged-in user session (backend-verified)
const STORAGE_USERS_KEY = 'users'; // Keep for admin dashboard (local cache only)
const STORAGE_ROLES_KEY = 'roles'; // Maps email -> role for Google users

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

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

/**
 * Normalizes user object to unified schema
 * Backend-provided id is the source of truth for user identity
 * { userId: string, email: string, name: string, role: string, picture?: string, loginType: "google"|"manual" }
 * Also includes id for backward compatibility
 */
const normalizeUser = (userData, loginType = 'manual') => {
  if (!userData) return null;
  
  // If already in unified format, return as-is (but ensure id exists)
  if (userData.userId && userData.loginType) {
    return {
      ...userData,
      id: userData.id || userData.userId // Keep id for backward compatibility
    };
  }
  
  // Backend provides id - use it as source of truth
  // For backward compatibility, also support email-based userId
  const email = userData.email || '';
  const backendId = userData.id || userData.userId || '';
  const userId = backendId || email; // Prefer backend id, fallback to email for Google users
  
  // Normalize role - backend returns FARMER/BUYER, normalize to capitalized format
  let role = userData.role || 'Buyer';
  if (role) {
    role = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }
  
  return {
    userId: backendId || userId, // Prefer backend id
    id: backendId || userId, // Keep id for backward compatibility
    email,
    name: userData.name || '',
    role,
    picture: userData.picture || userData.imageDataUrl || '',
    loginType: userData.loginType || loginType
  };
};

export const AuthProvider = ({ children }) => {
  // Read from unified key, fallback to old key for migration
  const [user, setUser] = useState(() => {
    const loggedInUser = readJson(STORAGE_USER_KEY, null);
    if (loggedInUser) {
      return normalizeUser(loggedInUser);
    }
    // Try old key for migration
    const oldUser = readJson('auth_user', null);
    if (oldUser) {
      return normalizeUser(oldUser);
    }
    return null;
  });
  const [allUsers, setAllUsers] = useState(() => readJson(STORAGE_USERS_KEY, []));
  const [rolesByEmail, setRolesByEmail] = useState(() => readJson(STORAGE_ROLES_KEY, {}));

  useEffect(() => {
    if (user) {
      writeJson(STORAGE_USER_KEY, user);
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    writeJson(STORAGE_USERS_KEY, allUsers);
  }, [allUsers]);

  useEffect(() => {
    writeJson(STORAGE_ROLES_KEY, rolesByEmail);
  }, [rolesByEmail]);

  // Note: Admin users should be created via backend API, not seeded in frontend
  // allUsers is now just a local cache for admin dashboard display, not used for authentication

  /**
   * Register a new user via backend API
   * Backend is the authority for user identity
   */
  const register = async (name, email, password, role) => {
    try {
      // Call backend API - backend validates and creates user
      const userData = await authService.signup(name, email, password, role);
      
      // Backend returns user with id, name, email, role
      // Use backend-provided id as the source of truth
      const unifiedUser = normalizeUser({
        id: userData.id,
        userId: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        loginType: 'manual'
      }, 'manual');
      
      setUser(unifiedUser);
      
      // Update local cache for admin dashboard (optional, not used for auth)
      setAllUsers((prev) => {
        const exists = prev.find(u => u.email === email);
        if (!exists) {
          return [...prev, unifiedUser];
        }
        return prev;
      });
    } catch (error) {
      console.error('[AuthContext] Registration error:', error);
      throw error;
    }
  };

  /**
   * Login via backend API
   * Backend validates credentials and returns user identity
   */
  const login = async (email, password) => {
    try {
      // Call backend API - backend validates credentials
      const userData = await authService.login(email, password);
      
      // Backend returns user with id, name, email, role
      // Use backend-provided id as the source of truth
      const unifiedUser = normalizeUser({
        id: userData.id,
        userId: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        loginType: 'manual'
      }, 'manual');
      
      setUser(unifiedUser);
      
      // Update local cache for admin dashboard (optional, not used for auth)
      setAllUsers((prev) => {
        const exists = prev.find(u => u.email === email);
        if (!exists) {
          return [...prev, unifiedUser];
        }
        return prev.map(u => u.email === email ? unifiedUser : u);
      });
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw error;
    }
  };

  /**
   * Google sign-in handler
   * @param {Object} credentialResponse - Google OAuth credential response
   * @param {Function} onRoleSelected - Callback when role is selected (first time only)
   */
  const handleGoogleSignIn = (credentialResponse, onRoleSelected) => {
    try {
      // Decode JWT token
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const googleUser = JSON.parse(jsonPayload);
      
      const email = googleUser.email || '';
      const userId = email; // Use email as stable userId
      const name = googleUser.name || googleUser.given_name || '';
      const picture = googleUser.picture || '';
      
      // Check if role is already saved for this email
      const savedRole = rolesByEmail[email];
      
      if (savedRole) {
        // Auto-login with saved role
        const unifiedUser = {
          userId,
          id: userId, // For backward compatibility
          email,
          name,
          role: savedRole,
          picture,
          loginType: 'google'
        };
        setUser(unifiedUser);
        
        // Ensure Google user is in allUsers list for Admin Dashboard
        const existingUser = allUsers.find(u => u.email === email);
        if (!existingUser) {
          setAllUsers((prev) => [...prev, unifiedUser]);
        }
      } else {
        // First time - show role selection
        const tempUser = { userId, email, name, picture, loginType: 'google' };
        if (onRoleSelected) {
          onRoleSelected(tempUser);
        }
      }
    } catch (error) {
      console.error('[Auth] Error during Google sign-in:', error);
      // Never throw - show user-friendly error
      alert('Google sign-in failed. Please try again.');
    }
  };

  /**
   * Complete Google sign-in after role selection
   */
  const completeGoogleSignIn = (tempUser, selectedRole) => {
    try {
      // Normalize role to capitalized format
      const normalizedRole = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1).toLowerCase();
      
      // Save role mapping
      setRolesByEmail((prev) => ({
        ...prev,
        [tempUser.email]: normalizedRole
      }));
      
      // Create unified user object
      const unifiedUser = {
        userId: tempUser.userId,
        id: tempUser.userId, // For backward compatibility
        email: tempUser.email,
        name: tempUser.name,
        role: normalizedRole,
        picture: tempUser.picture,
        loginType: 'google'
      };
      setUser(unifiedUser);
      
      // Add Google user to allUsers list for Admin Dashboard
      const existingUser = allUsers.find(u => u.email === tempUser.email);
      if (!existingUser) {
        setAllUsers((prev) => [...prev, unifiedUser]);
      } else {
        // Update existing user with Google info
        setAllUsers((prev) => prev.map(u => 
          u.email === tempUser.email ? { ...u, ...unifiedUser } : u
        ));
      }
    } catch (error) {
      console.error('[Auth] Error completing Google sign-in:', error);
      alert('Failed to complete sign-in. Please try again.');
    }
  };

  const logout = () => {
    setUser(null);
  };

  // Admin/user management helpers
  const createUser = (userData) => {
    const exists = allUsers.find((u) => u.email === userData.email);
    if (exists) throw new Error('Email already exists');
    const created = { 
      id: userData.id || Date.now().toString(),
      userId: userData.userId || userData.email || userData.id || Date.now().toString(),
      ...userData,
      loginType: userData.loginType || 'manual'
    };
    setAllUsers((prev) => [...prev, created]);
    return created;
  };

  const updateUser = (id, updates) => {
    setAllUsers((prev) => prev.map((u) => 
      (u.id === id || u.userId === id || u.email === id) 
        ? { ...u, ...updates, userId: updates.userId || u.userId || u.email || u.id } 
        : u
    ));
    if (user && (user.id === id || user.userId === id || user.email === id)) {
      const next = { ...user, ...updates };
      // Never keep password in session object
      const { password: _ignore, ...sessionSafe } = next;
      setUser(sessionSafe);
    }
  };

  const deleteUser = (id) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== id && u.userId !== id && u.email !== id));
    if (user && (user.id === id || user.userId === id || user.email === id)) setUser(null);
  };

  const value = useMemo(
    () => ({ 
      user, 
      allUsers, 
      setAllUsers, 
      register, 
      login, 
      logout, 
      createUser, 
      updateUser, 
      deleteUser,
      handleGoogleSignIn,
      completeGoogleSignIn
    }),
    [user, allUsers, rolesByEmail]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;



