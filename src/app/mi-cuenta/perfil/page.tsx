'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { AuthCheck } from '@/components/auth-check';
import { UserProfile } from '../page'; // Reutilizamos el tipo desde la página principal de mi-cuenta
import { EditProfileForm } from '@/components/edit-profile-form';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function EditarPerfilPage() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users/profile/me');
      setUserData(response.data);
    } catch (error) {
      toast.error('No se pudo cargar tu perfil.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AuthCheck>
      <h1 className="text-3xl font-bold text-white mb-6">Editar Perfil</h1>
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-pink-500" size={32} />
        </div>
      ) : userData ? (
        // El componente EditProfileForm ya contiene toda la lógica y UI del formulario
        <EditProfileForm user={userData} onProfileUpdated={fetchData} />
      ) : (
        <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-lg">
          <p className="text-zinc-400">Hubo un error al cargar tu información de perfil.</p>
        </div>
      )}
    </AuthCheck>
  );
}