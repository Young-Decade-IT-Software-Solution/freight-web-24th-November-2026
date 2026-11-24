import axios from 'axios';

const getPortalBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/+$/, '');
    return cleanUrl.endsWith('/portal') ? cleanUrl : `${cleanUrl}/portal`;
  }
  return '/api/portal';
};

const portalApi = axios.create({
  baseURL: getPortalBaseUrl(),
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
