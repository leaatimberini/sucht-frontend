'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { PlusCircle, Edit, Trash2, Loader, Gift, History, Star } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

// --- TIPOS DE DATOS ---
interface Reward {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
  stock: number | null;
  isActive: boolean;
  redemptionLocation: 'door' | 'bar';
}

interface RedeemedReward {
  id: string;
  user: { name: string; email: string; };
  reward: { name: string; };
  redeemedAt: string;
}

const rewardSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido'),
  description: z.string().optional().nullable(),
  pointsCost: z.coerce.number().min(1, 'El costo debe ser mayor a 0'),
  stock: z.coerce.number().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
  redemptionLocation: z.enum(['door', 'bar']).default('bar'),
});
type RewardFormInputs = z.infer<typeof rewardSchema>;

export default function RewardsManagementPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [history, setHistory] = useState<RedeemedReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [birthdayRewardId, setBirthdayRewardId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(rewardSchema),
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rewardsRes, historyRes, configRes] = await Promise.all([
        api.get('/rewards'),
        api.get('/rewards/history/redeemed'),
        api.get('/configuration')
      ]);
      setRewards(rewardsRes.data);
      setHistory(historyRes.data);
      setBirthdayRewardId(configRes.data.birthday_reward_id || null);
    } catch (error) {
      toast.error('No se pudieron cargar los datos de premios.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ESTA ES LA FUNCIÓN CRÍTICA QUE DEBE ESTAR ACTUALIZADA ---
  const handleSetBirthdayReward = async (rewardId: string) => {
    try {
      // Nos aseguramos de enviar el payload correcto al backend
      await api.patch('/configuration', {
        birthday_reward_id: rewardId
      });
      toast.success('Premio de cumpleaños actualizado.');
      fetchData();
    } catch (error) {
      toast.error('No se pudo actualizar el premio de cumpleaños.');
    }
  };

  const openModalToCreate = () => {
    setEditingReward(null);
    reset({ name: '', description: null, pointsCost: 0, stock: null, isActive: true, redemptionLocation: 'bar' });
    setIsModalOpen(true);
  };

  const openModalToEdit = (reward: Reward) => {
    setEditingReward(reward);
    reset(reward);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este premio?')) {
      try {
        await api.delete(`/rewards/${id}`);
        toast.success('Premio eliminado.');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar el premio.');
      }
    }
  };

  const onSubmit = async (data: RewardFormInputs) => {
    try {
      if (editingReward) {
        await api.patch(`/rewards/${editingReward.id}`, data);
        toast.success('Premio actualizado con éxito.');
      } else {
        await api.post('/rewards', data);
        toast.success('Premio creado con éxito.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Ocurrió un error al guardar el premio.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Gift className="text-pink-400" />
            Gestión de Premios
          </h1>
          <button onClick={openModalToCreate} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
            <PlusCircle size={20} />
            Crear Premio
          </button>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-700">
              <tr>
                <th className="p-4 text-sm font-semibold text-white">Cumpleaños</th>
                <th className="p-4 text-sm font-semibold text-white">Nombre</th>
                <th className="p-4 text-sm font-semibold text-white">Costo (Puntos)</th>
                <th className="p-4 text-sm font-semibold text-white">Stock</th>
                <th className="p-4 text-sm font-semibold text-white">Estado</th>
                <th className="p-4 text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && rewards.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-6 text-zinc-400">Cargando premios...</td></tr>
              ) : rewards.map((reward) => {
                const isBirthdayReward = reward.id === birthdayRewardId;
                return (
                  <tr key={reward.id} className={`border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50 ${isBirthdayReward ? 'bg-amber-500/10' : ''}`}>
                    <td className="p-4 text-center">
                      <button onClick={() => handleSetBirthdayReward(reward.id)} title="Establecer como premio de cumpleaños">
                        <Star size={18} className={`${isBirthdayReward ? 'text-amber-400 fill-amber-400' : 'text-zinc-500 hover:text-amber-400'}`} />
                      </button>
                    </td>
                    <td className="p-4 font-semibold text-zinc-200">{reward.name}</td>
                    <td className="p-4 text-pink-400 font-bold">{reward.pointsCost}</td>
                    <td className="p-4 text-zinc-300">{reward.stock ?? 'Ilimitado'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${reward.isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                        {reward.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 flex items-center gap-4">
                      <button onClick={() => openModalToEdit(reward)} className="text-zinc-400 hover:text-white"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(reward.id)} className="text-red-500 hover:text-red-400"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-4">
          <History className="text-sky-400" />
          Historial de Canjes
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-700">
              <tr>
                <th className="p-4 text-sm font-semibold text-white">Cliente</th>
                <th className="p-4 text-sm font-semibold text-white">Premio Canjeado</th>
                <th className="p-4 text-sm font-semibold text-white">Fecha de Canje</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && history.length === 0 ? (
                <tr><td colSpan={3} className="text-center p-6 text-zinc-400">Cargando historial...</td></tr>
              ) : history.map((item) => (
                <tr key={item.id} className="border-b border-zinc-800 last:border-b-0">
                  <td className="p-4">
                    <p className="font-semibold text-zinc-200">{item.user.name}</p>
                    <p className="text-sm text-zinc-500">{item.user.email}</p>
                  </td>
                  <td className="p-4 text-zinc-300">{item.reward.name}</td>
                  <td className="p-4 text-zinc-400">{formatDate(item.redeemedAt)} hs</td>
                </tr>
              ))}
              {history.length === 0 && !isLoading && (
                <tr><td colSpan={3} className="text-center p-6 text-zinc-500">Aún no se ha canjeado ningún premio.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold text-white mb-6">{editingReward ? 'Editar Premio' : 'Crear Nuevo Premio'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300">Nombre del Premio</label>
                <input id="name" {...register('name')} className="mt-1 w-full bg-zinc-800 p-2 rounded-md" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="pointsCost" className="block text-sm font-medium text-zinc-300">Costo en Puntos</label>
                <input id="pointsCost" type="number" {...register('pointsCost')} className="mt-1 w-full bg-zinc-800 p-2 rounded-md" />
                {errors.pointsCost && <p className="text-red-500 text-xs mt-1">{errors.pointsCost.message}</p>}
              </div>
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-zinc-300">Stock (dejar en blanco para ilimitado)</label>
                <input id="stock" type="number" {...register('stock')} className="mt-1 w-full bg-zinc-800 p-2 rounded-md" />
              </div>
              <div>
                <label htmlFor="redemptionLocation" className="block text-sm font-medium text-zinc-300">Lugar de Canje</label>
                <select id="redemptionLocation" {...register('redemptionLocation')} className="mt-1 w-full bg-zinc-800 p-2 rounded-md">
                  <option value="bar">Barra</option>
                  <option value="door">Puerta</option>
                </select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-zinc-300">Descripción</label>
                <textarea id="description" {...register('description')} className="mt-1 w-full bg-zinc-800 p-2 rounded-md" rows={3}></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input id="isActive" type="checkbox" {...register('isActive')} className="accent-pink-600" />
                <label htmlFor="isActive" className="text-sm text-zinc-300">Premio Activo</label>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                  {isSubmitting ? <Loader className="animate-spin" /> : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}