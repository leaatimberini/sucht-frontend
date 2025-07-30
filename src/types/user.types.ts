export enum UserRole {
  OWNER = 'owner', // <-- ROL AÑADIDO
  ADMIN = 'admin',
  RRPP = 'rrpp',
  VERIFIER = 'verifier',
  CLIENT = 'client',
}

export interface User {
  id: string;
  username: string | null;
  email: string;
  name: string;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
  profileImageUrl: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
  dateOfBirth: string | null;
}
