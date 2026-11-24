import axios from 'axios';

const portalApi = axios.create({
  baseURL: '/api/portal',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach portal JWT token
portalApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('freighterp_portal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
portalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('freighterp_portal_token');
      localStorage.removeItem('freighterp_portal_user');
      localStorage.removeItem('freighterp_portal_customer');
      if (
        window.location.pathname.startsWith('/portal') &&
        !['/portal/login', '/portal/forgot-password', '/portal/reset-password', '/portal/accept-invitation'].some(
          (p) => window.location.pathname.startsWith(p)
        )
      ) {
        window.location.href = '/portal/login';
      }
    }
    return Promise.reject(error);
  }
);

export default portalApi;
