export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  RRPP = 'rrpp',
  VERIFIER = 'verifier',
  BARRA = 'barra',
  CLIENT = 'client',
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
  dateOfBirth: Date | string | null; // Aceptamos string por los formularios
  createdAt: Date | string;
  updatedAt: Date | string;

  // Propiedades del sistema de lealtad y pagos
  points: number;
  isMpLinked: boolean;
  rrppCommissionRate: number | null;
  
  // --- PROPIEDAD AÑADIDA ---
  // Esta propiedad nos la envía la API en el endpoint /profile/me
  isPushSubscribed?: boolean;

  // Objeto opcional con la información de nivel
  loyalty?: {
    currentLevel: string;
    nextLevel: string | null;
    progressPercentage: number;
    pointsToNextLevel: number;
  };
}