import { useAuthStore } from '@/stores/auth-store';
import axios from 'axios';

const api = axios.create({
  // Construimos la URL base completa, incluyendo /api
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
});

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