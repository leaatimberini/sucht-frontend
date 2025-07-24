import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import api from '@/lib/axios'; // Asegúrate de que importa nuestra instancia configurada

// Definimos la forma de nuestro estado y las acciones
interface AuthState {
  token: string | null;
  user: { email: string; role: string } | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      login: async (credentials) => {
        try {
          // --- CORRECCIÓN AQUÍ ---
          // La ruta ahora es relativa a la baseURL de axios (que ya incluye /api)
          const response = await api.post('/auth/login', credentials);
          // -----------------------
          
          const { access_token } = response.data;
          
          const payload = JSON.parse(atob(access_token.split('.')[1]));

          set({ 
            token: access_token,
            user: { email: payload.email, role: payload.role }
          });
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Error al iniciar sesión');
          }
          throw new Error('Un error inesperado ocurrió.');
        }
      },

      logout: () => {
        set({ token: null, user: null });
      },

      isLoggedIn: () => {
        return get().token !== null;
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);