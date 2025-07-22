import { useAuthStore } from '@/stores/auth-store';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // La URL base de nuestro backend
});

// Interceptor para añadir el token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;