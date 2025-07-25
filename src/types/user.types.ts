export enum UserRole {
  ADMIN = 'admin',
  RRPP = 'rrpp',
  VERIFIER = 'verifier',
  CLIENT = 'client',
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
  // --- CAMPOS AÑADIDOS ---
  profileImageUrl: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
  dateOfBirth: string | null;
}