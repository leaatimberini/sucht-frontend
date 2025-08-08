// frontend/src/app/mi-cuenta/components/UsernamePrompt.tsx
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { EditProfileForm } from '@/components/edit-profile-form';
import { Copy, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export function UsernamePrompt() {
  const { user, fetchUser } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // El componente solo se muestra si el usuario está cargado
  if (!user) return null; 

  const handleCopyToClipboard = () => {
    if (!user.username) return;
    const link = `https://sucht.com.ar/p/${user.username}`;
    navigator.clipboard.writeText(link);
    toast.success('¡Link copiado al portapapeles!');
  };
  
  // Función para cerrar el modal y recargar los datos del usuario
  const handleProfileUpdated = () => {
    setIsModalOpen(false);
    fetchUser();
  };

  // Si el usuario no tiene username, mostramos el botón para crearlo
  if (!user.username) {
    return (
      <div className="bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center mb-8">
        <h2 className="text-xl font-bold text-white">¡Activa tu Link de Referido!</h2>
        <p className="text-zinc-400 mt-2 mb-4">Crea tu nombre de usuario único para empezar a compartir y ganar puntos por cada amigo que asista gracias a ti.</p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Crear mi Link
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 w-full max-w-lg relative">
               <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">&times;</button>
               <h3 className="text-2xl font-bold text-white mb-4">Elige tu Nombre de Usuario</h3>
               {/* Reutilizamos el formulario de perfil, pasando una prop para mostrar solo lo necesario */}
               <EditProfileForm user={user} onProfileUpdated={handleProfileUpdated} isUsernameSetupMode={true} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Si ya tiene username, mostramos el link
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-white flex items-center gap-2"><LinkIcon size={20} /> Tu Link de Referido</h2>
      <p className="text-zinc-400 mt-2 mb-4">Comparte este link con tus amigos. Ganarás puntos por cada uno que asista a un evento.</p>
      <div className="flex items-center space-x-2 bg-zinc-800 p-2 rounded-md">
        <span className="text-pink-400 flex-1 truncate">{`https://sucht.com.ar/p/${user.username}`}</span>
        <button onClick={handleCopyToClipboard} className="bg-pink-600 hover:bg-pink-700 p-2 rounded-md">
          <Copy className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
}