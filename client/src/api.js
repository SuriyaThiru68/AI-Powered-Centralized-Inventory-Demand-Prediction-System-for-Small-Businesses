import axios from 'axios';

/**
 * Central Axios instance used by every page.
 * - Reads base URL from VITE_API_URL env variable (falls back to localhost for dev)
 * - Automatically attaches the JWT Bearer token from localStorage on every request
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// ── Request interceptor: inject Auth header ───────────────────────
api.interceptors.request.use(
  (config) => {
    const raw = localStorage.getItem('inventory_user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (_) {
        // malformed storage — ignore
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: auto-logout on 401 ─────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear session and reload
      localStorage.removeItem('inventory_user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
