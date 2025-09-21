import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_USER_KEY = 'auth_user';
const STORAGE_USERS_KEY = 'users';

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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readJson(STORAGE_USER_KEY, null));
  const [allUsers, setAllUsers] = useState(() => readJson(STORAGE_USERS_KEY, []));

  useEffect(() => {
    writeJson(STORAGE_USER_KEY, user);
  }, [user]);

  useEffect(() => {
    writeJson(STORAGE_USERS_KEY, allUsers);
  }, [allUsers]);

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
    setUser({ id: newUser.id, name, email, role });
  };

  const login = (email, password) => {
    const found = allUsers.find((u) => u.email === email && u.password === password);
    if (!found) {
      throw new Error('Invalid credentials');
    }
    setUser({ id: found.id, name: found.name, email: found.email, role: found.role });
  };

  const logout = () => {
    setUser(null);
  };

  // Admin/user management helpers
  const createUser = (userData) => {
    const exists = allUsers.find((u) => u.email === userData.email);
    if (exists) throw new Error('Email already exists');
    const created = { id: Date.now().toString(), ...userData };
    setAllUsers((prev) => [...prev, created]);
    return created;
  };

  const updateUser = (id, updates) => {
    setAllUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    if (user && user.id === id) {
      const next = { ...user, ...updates };
      // Never keep password in session object
      const { password: _ignore, ...sessionSafe } = next;
      setUser(sessionSafe);
    }
  };

  const deleteUser = (id) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== id));
    if (user && user.id === id) setUser(null);
  };

  const value = useMemo(
    () => ({ user, allUsers, setAllUsers, register, login, logout, createUser, updateUser, deleteUser }),
    [user, allUsers]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;



