// frontend/src/lib/axios.ts

import { useAuthStore } from '@/stores/auth-store';
import axios from 'axios';

const isServer = typeof window === 'undefined';
const baseURL = isServer ? 'http://localhost:5000/api' : process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  (config) => {
    // Esta lógica para añadir el token es correcta y no se modifica.
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Si la API devuelve 401 (Unauthorized), forzamos logout
    if (error.response && error.response.status === 401) {
      const { logout } = useAuthStore.getState();
      if (typeof window !== 'undefined') {
        // Evitamos loop infinito si ya estamos en login
        if (!window.location.pathname.startsWith('/login')) {
          logout();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;