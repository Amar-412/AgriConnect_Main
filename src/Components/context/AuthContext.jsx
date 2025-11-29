import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_USER_KEY = 'loggedInUser'; // Unified key
const STORAGE_USERS_KEY = 'users';
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
  
  // Migrate from old format
  const email = userData.email || '';
  const userId = email || userData.id || userData.userId || '';
  
  // Normalize role to capitalized format
  const role = userData.role 
    ? (userData.role.charAt(0).toUpperCase() + userData.role.slice(1).toLowerCase())
    : 'Buyer';
  
  return {
    userId,
    id: userData.id || userId, // Keep id for backward compatibility
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

  // Seed a default admin if none exists
  useEffect(() => {
    if (!allUsers || allUsers.length === 0) {
      const adminUser = { id: 'admin-1', name: 'Admin', email: 'admin@example.com', password: 'admin', role: 'admin' };
      setAllUsers([adminUser]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = (name, email, password, role) => {
    const existing = allUsers.find((u) => u.email === email);
    if (existing) {
      throw new Error('Email already registered');
    }
    const newUser = { id: Date.now().toString(), name, email, password, role };
    setAllUsers((prev) => [...prev, newUser]);
    
    // Create unified user object
    const unifiedUser = normalizeUser({
      email,
      name,
      role,
      id: newUser.id
    }, 'manual');
    setUser(unifiedUser);
  };

  const login = (email, password) => {
    const found = allUsers.find((u) => u.email === email && u.password === password);
    if (!found) {
      throw new Error('Invalid credentials');
    }
    
    // Create unified user object
    const unifiedUser = normalizeUser({
      email: found.email,
      name: found.name,
      role: found.role,
      id: found.id
    }, 'manual');
    setUser(unifiedUser);
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



