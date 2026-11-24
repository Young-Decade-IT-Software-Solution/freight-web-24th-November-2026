import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('freighterp_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('freighterp_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on boot
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('freighterp_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('freighterp_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('freighterp_token', newToken);
      localStorage.setItem('freighterp_user', JSON.stringify(newUser));
      return { success: true };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('freighterp_token');
    localStorage.removeItem('freighterp_user');
  };

  const isSuperAdmin = user?.role === 'Super Admin';
  const isBranchAdmin = user?.role === 'Branch Admin' || isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isSuperAdmin,
        isBranchAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
