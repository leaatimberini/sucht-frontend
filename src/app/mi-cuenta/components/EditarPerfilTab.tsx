// src/app/mi-cuenta/components/EditarPerfilTab.tsx
'use client';

import { EditProfileForm } from "@/components/edit-profile-form";
import { User } from "@/types/user.types";

type UserProfile = User & { isPushSubscribed?: boolean; points?: number };

export function EditarPerfilTab({ user }: { user: UserProfile }) {
  return (
    <EditProfileForm user={user} />
  );
}