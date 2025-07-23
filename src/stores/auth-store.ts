import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios'; // <-- Importa tu cliente de axios configurado

// Definimos la forma de nuestro estado y las acciones
interface AuthState {
  token: string | null;
  user: { email: string; role: string } | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  // La función `persist` hace que el estado se guarde en el localStorage del navegador,
  // para que el usuario no pierda la sesión al refrescar la página.
  persist(
    (set, get) => ({
      token: null,
      user: null,

      login: async (credentials) => {
        try {
          // --- LÍNEA CORREGIDA ---
          // Usamos el cliente 'api' y una ruta relativa
          const response = await api.post('/api/auth/login', credentials);
          // -----------------------

          const { access_token } = response.data;
          
          // Decodificamos el token para extraer la información del usuario
          const payload = JSON.parse(atob(access_token.split('.')[1]));

          set({ 
            token: access_token,
            user: { email: payload.email, role: payload.role }
          });
        } catch (error: any) {
          // Si hay un error, lo relanzamos para que el componente lo pueda atrapar
          if (error.response) {
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
      name: 'auth-storage', // nombre de la clave en el localStorage
    },
  ),
);