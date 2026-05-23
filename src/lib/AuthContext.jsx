import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// Simple local auth using localStorage
// Users are stored as: { email, password, full_name, role, id, created_date }
const USERS_KEY = 'shop_users';
const CURRENT_USER_KEY = 'shop_current_user';

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch { return []; }
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState({ id: 'local', public_settings: {} });

  useEffect(() => {
    // Restore session from localStorage
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        const u = JSON.parse(saved);
        setUser(u);
        setIsAuthenticated(true);
      }
    } catch {}
    setIsLoadingAuth(false);
    setAuthChecked(true);
  }, []);

  const login = async ({ email, password }) => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Email hoặc mật khẩu không đúng');
    const { password: _pw, ...safeUser } = found;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    setUser(safeUser);
    setIsAuthenticated(true);
    return safeUser;
  };

  const register = async ({ email, password, full_name }) => {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('Email này đã được đăng ký');
    }
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      full_name: full_name || email.split('@')[0],
      role: users.length === 0 ? 'admin' : 'user', // first user is admin
      created_date: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    const { password: _pw, ...safeUser } = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    setUser(safeUser);
    setIsAuthenticated(true);
    return safeUser;
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const checkUserAuth = () => {
    // Already handled in useEffect
  };

  const checkAppState = () => {
    // No-op for local auth
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState,
      login,
      register,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
