import axios from 'axios';
import { getToken, clearAuth } from '../utils/storage';

// In development, always use the Vite /api proxy. This prevents local .env
// files pointing at stale ports (such as 5000, which macOS may reserve).
// Production may still provide an absolute API URL via VITE_API_URL.
const baseURL = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_URL || '/api');

const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthenticationRequest =
      /\/auth\/(student\/(login|register)|admin\/login)\/?$/.test(url);

    // Failed login is an ordinary 401, not an expired authenticated session.
    if (error.response?.status === 401 && !isAuthenticationRequest) {
      clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
