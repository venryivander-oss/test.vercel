import axios from 'axios';

const isProduction = import.meta.env.PROD;

const api = axios.create({
  baseURL: isProduction ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api'),
  timeout: 8000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('API connection offline or pending:', error.message);
    if (error.config && error.config.url && error.config.url.includes('/reports/summary')) {
      return Promise.resolve({ data: { sales: 0, purchases: 0, lowStock: 0 } });
    }
    return Promise.resolve({ data: [] });
  }
);

export default api;
