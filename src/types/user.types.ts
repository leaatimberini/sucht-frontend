// frontend/src/types/user.types.ts

// Asegúrate de que el nombre del tipo coincida con el de tu archivo
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  RRPP = 'rrpp',
  VERIFIER = 'verifier',
  CLIENT = 'client',
}

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  roles: UserRole[];
  profileImageUrl?: string;
  instagramHandle?: string;
  whatsappNumber?: string;
  dateOfBirth?: Date;
  
  mpAccessToken?: string;
  mpUserId?: string;
  rrppCommissionRate?: number;

  // CORRECCIÓN: Añadimos las nuevas propiedades de fecha
  createdAt: Date;
  updatedAt: Date;
}