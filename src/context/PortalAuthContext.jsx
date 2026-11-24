import React, { createContext, useContext, useState, useEffect } from 'react';
import portalApi from '../services/portalApi';

const PortalAuthContext = createContext(null);

export const PortalAuthProvider = ({ children }) => {
  const [portalUser, setPortalUser] = useState(() => {
    const saved = localStorage.getItem('freighterp_portal_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [portalCustomer, setPortalCustomer] = useState(() => {
    const saved = localStorage.getItem('freighterp_portal_customer');
    return saved ? JSON.parse(saved) : null;
  });
  const [portalToken, setPortalToken] = useState(
    () => localStorage.getItem('freighterp_portal_token') || null
  );
  const [loading, setLoading] = useState(true);

  // Validate session on load
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('freighterp_portal_token');
      if (storedToken) {
        try {
          const res = await portalApi.get('/auth/me');
          if (res.data?.success) {
            setPortalUser(res.data.user);
            setPortalCustomer(res.data.customer);
            localStorage.setItem('freighterp_portal_user', JSON.stringify(res.data.user));
            localStorage.setItem('freighterp_portal_customer', JSON.stringify(res.data.customer));
          }
        } catch (err) {
          console.warn('Portal session expired:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await portalApi.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { token: newToken, user: newUser, customer: newCustomer } = res.data;
        setPortalToken(newToken);
        setPortalUser(newUser);
        setPortalCustomer(newCustomer);
        localStorage.setItem('freighterp_portal_token', newToken);
        localStorage.setItem('freighterp_portal_user', JSON.stringify(newUser));
        localStorage.setItem('freighterp_portal_customer', JSON.stringify(newCustomer));
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Login failed',
      };
    }
  };

  const loginWithSession = (token, user, customer) => {
    setPortalToken(token);
    setPortalUser(user);
    setPortalCustomer(customer);
    localStorage.setItem('freighterp_portal_token', token);
    localStorage.setItem('freighterp_portal_user', JSON.stringify(user));
    localStorage.setItem('freighterp_portal_customer', JSON.stringify(customer));
  };

  const logout = () => {
    setPortalUser(null);
    setPortalCustomer(null);
    setPortalToken(null);
    localStorage.removeItem('freighterp_portal_token');
    localStorage.removeItem('freighterp_portal_user');
    localStorage.removeItem('freighterp_portal_customer');
  };

  const updateLocalProfile = (updatedUser, updatedCustomer) => {
    if (updatedUser) {
      setPortalUser(updatedUser);
      localStorage.setItem('freighterp_portal_user', JSON.stringify(updatedUser));
    }
    if (updatedCustomer) {
      setPortalCustomer(updatedCustomer);
      localStorage.setItem('freighterp_portal_customer', JSON.stringify(updatedCustomer));
    }
  };

  return (
    <PortalAuthContext.Provider
      value={{
        portalUser,
        portalCustomer,
        portalToken,
        loading,
        login,
        loginWithSession,
        logout,
        updateLocalProfile,
      }}
    >
      {children}
    </PortalAuthContext.Provider>
  );
};

export const usePortalAuth = () => useContext(PortalAuthContext);
