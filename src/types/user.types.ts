// Este enum debe ser idéntico al que está en el backend (src/users/user.entity.ts)
export enum UserRole {
  ADMIN = 'admin',
  RRPP = 'rrpp',
  VERIFIER = 'verifier',
  CLIENT = 'client',
}

// Interfaz para el objeto User que recibimos de la API
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}