// frontend/src/lib/axios.ts

import { useAuthStore } from '@/stores/auth-store';
import axios from 'axios';

const api = axios.create({
  // CORRECCIÓN: Usamos directamente la variable de entorno, que ya debe contener la ruta completa a la API.
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
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
    return Promise.reject(error);
  },
);

export default api;