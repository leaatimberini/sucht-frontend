// src/types/user.types.ts
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  ORGANIZER = 'organizer',
  RRPP = 'rrpp',
  VERIFIER = 'verifier',
  BARRA = 'barra',
  CLIENT = 'client',
  PARTNER = 'partner',
}

// Interfaz unificada con todas las propiedades que usa la aplicación
export interface User {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  roles: UserRole[];
  profileImageUrl: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
  dateOfBirth: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Propiedades del sistema de lealtad y pagos
  points: number;
  isMpLinked: boolean;
  rrppCommissionRate: number | null;

  // --- PROPIEDAD AÑADIDA ---
  isPushSubscribed?: boolean;

  // Objeto opcional con la información de nivel
  loyalty?: {
    currentLevel: string;
    nextLevel: string | null;
    progressPercentage: number;
    pointsToNextLevel: number;
  };
}