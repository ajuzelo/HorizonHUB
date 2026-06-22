import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  // Em desenvolvimento (npm run dev) usa o proxy do Vite (/api -> localhost:3001)
  // Em produção (Netlify) usa a URL pública do Render
  baseURL: import.meta.env.DEV ? '/api' : 'https://horizonhub-81rr.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
