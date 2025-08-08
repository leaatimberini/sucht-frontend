// frontend/src/stores/auth-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import api from '@/lib/axios';
import { User } from '@/types/user.types';

// The UserState now uses the full User type for compatibility
type UserState = User;

interface AuthState {
  token: string | null;
  user: UserState | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoggedIn: () => boolean;
  fetchUser: () => Promise<void>;
  init: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      login: async (credentials) => {
        try {
          const response = await api.post('/auth/login', credentials);
          const { accessToken, user } = response.data;
          
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          set({ token: accessToken, user: user });
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Error al iniciar sesión');
          }
          throw new Error('Un error inesperado ocurrió.');
        }
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        set({ token: null, user: null });
      },

      isLoggedIn: () => {
        return get().token !== null;
      },
      
      fetchUser: async () => {
        try {
          const response = await api.get('/users/profile/me');
          set({ user: response.data });
        } catch (error) {
          console.error("Error al refrescar el perfil del usuario, cerrando sesión.", error);
          get().logout();
        }
      },
      
      init: () => {
        const token = get().token;
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          get().fetchUser();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    },
  ),
);