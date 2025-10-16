'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { User, UserRole } from '@/types/user.types';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';

export function StaffManager({ onStaffChange, viewAs = 'ADMIN' }: { onStaffChange: () => void, viewAs?: 'ADMIN' | 'OWNER' }) {
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailToSearch, setEmailToSearch] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [notFound, setNotFound] = useState(false);

  // ✅ CORRECCIÓN: Añadimos el rol 'OWNER' a la lista de roles disponibles para el ADMIN.
  const availableRoles = viewAs === 'OWNER'
    ? [UserRole.RRPP, UserRole.VERIFIER, UserRole.BARRA, UserRole.ORGANIZER]
    : [UserRole.RRPP, UserRole.VERIFIER, UserRole.BARRA, UserRole.ORGANIZER, UserRole.OWNER, UserRole.ADMIN];

  const handleSearch = async () => {
    if (!emailToSearch) return;
    setIsLoading(true);
    setNotFound(false);
    try {
      const response = await api.get(`/users/by-email/${emailToSearch}`);
      setSearchedUser(response.data);
      setSelectedRoles(response.data.roles.filter((r: UserRole) => r !== UserRole.CLIENT));
    } catch (error) {
      setSearchedUser(null);
      setSelectedRoles([]);
      setNotFound(true);
      toast('Usuario no encontrado. Puedes invitarlo con los roles que selecciones.', { icon: '🧑‍🚀' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleInviteOrUpdate = async () => {
    setIsLoading(true);
    try {
      const finalRoles = selectedRoles.includes(UserRole.ADMIN) 
        ? selectedRoles 
        : Array.from(new Set([...selectedRoles, UserRole.CLIENT]));

      const response = await api.post('/users/invite-staff', {
        email: searchedUser?.email || emailToSearch,
        roles: finalRoles,
      });
      setSearchedUser(response.data);
      setSelectedRoles(response.data.roles.filter((r: UserRole) => r !== UserRole.CLIENT));
      setNotFound(false);
      toast.success(`Usuario ${searchedUser ? 'actualizado' : 'invitado'} con éxito.`);
      onStaffChange();
    } catch (error) {
      toast.error('Ocurrió un error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex space-x-2">
        <input
          type="email"
          value={emailToSearch}
          onChange={(e) => setEmailToSearch(e.target.value)}
          placeholder="Buscar o invitar por email..."
          className="flex-1 bg-zinc-800 rounded-md p-2 text-white border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-pink-500"
        />
        <button onClick={handleSearch} disabled={isLoading} className="bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <span>{isLoading ? 'Buscando...' : 'Buscar'}</span>
        </button>
      </div>

      {(searchedUser || notFound) && (
        <div className="mt-6 border-t border-zinc-700 pt-6">
          <h3 className="text-lg font-semibold text-white">
            {searchedUser ? `Editando a ${searchedUser.name}` : `Invitando a ${emailToSearch}`}
          </h3>
          <p className="text-sm text-zinc-400">{searchedUser?.email || emailToSearch}</p>

          <div className="mt-4 space-y-2">
            <p className="font-medium text-zinc-300">Seleccionar Roles de Staff:</p>
            <div className="flex flex-wrap gap-4">
              {availableRoles.map(role => (
                <label key={role} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="h-4 w-4 rounded bg-zinc-700 text-pink-600 focus:ring-pink-500 border-zinc-600"
                  />
                  <span className="font-semibold">{role.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button onClick={handleInviteOrUpdate} disabled={isLoading} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
              {searchedUser ? 'Actualizar Roles' : 'Enviar Invitación'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}