'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { AuthCheck } from '@/components/auth-check';
import { UserProfile } from '../page'; // Reutilizamos el tipo desde la página principal
import { Reward, UserReward } from '@/types/reward.types';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { Loader2, Star } from 'lucide-react';

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function MisPremiosPage() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    // No es necesario recargar todo, solo lo que se necesita para esta página
    // por eso no ponemos setIsLoading(true) al inicio del todo
    try {
      const [userRes, rewardsRes, userRewardsRes] = await Promise.all([
        api.get('/users/profile/me'),
        api.get('/rewards'),
        api.get('/rewards/my-rewards'),
      ]);
      setUserData(userRes.data);
      setRewards(rewardsRes.data.filter((r: Reward) => r.isActive));
      // Filtramos para mostrar solo los premios listos para usar
      setUserRewards(userRewardsRes.data.filter((ur: UserReward) => ur.redeemedAt === null));
    } catch (error) {
      toast.error('No se pudieron cargar los datos de premios.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRedeem = async (rewardId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres canjear este premio? Se restarán los puntos de tu cuenta.')) return;
    try {
      toast.loading('Canjeando premio...');
      await api.post(`/rewards/${rewardId}/redeem`);
      toast.dismiss();
      toast.success('¡Premio canjeado con éxito!');
      fetchData(); // Volvemos a cargar los datos para reflejar el cambio
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'No se pudo canjear el premio.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-pink-500" size={32} />
      </div>
    );
  }

  return (
    <AuthCheck>
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tienda de Canje</h1>
          <p className="text-zinc-400">Usa tus puntos de lealtad para obtener premios exclusivos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map(reward => (
            <div key={reward.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col">
              <div className="flex-grow">
                <h4 className="font-bold text-white">{reward.name}</h4>
                <p className="text-sm text-zinc-400 mt-1">{reward.description}</p>
                <p className="text-sm text-zinc-500 mt-2">Stock: {reward.stock ?? 'Ilimitado'}</p>
              </div>
              <button
                onClick={() => handleRedeem(reward.id)}
                disabled={!userData?.points || userData.points < reward.pointsCost || reward.stock === 0}
                className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Star size={16} />
                Canjear por {reward.pointsCost} puntos
              </button>
            </div>
          ))}
        </div>

        <hr className="border-zinc-800" />

        <div>
          <h2 className="text-3xl font-bold text-white mb-4">Mis Premios Listos para Usar</h2>
          {userRewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userRewards.map(ur => (
                <div key={ur.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center">
                  <div className="bg-white p-4 rounded-lg"><QRCodeSVG value={ur.id} size={160} fgColor="#000000" bgColor="#ffffff" /></div>
                  <h3 className="text-2xl font-bold text-white mt-6">{ur.reward.name}</h3>
                  <p className="text-zinc-400 text-sm mt-2">{ur.reward.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-lg">
              <p className="text-zinc-400">Aún no has canjeado ningún premio.</p>
            </div>
          )}
        </div>
      </div>
    </AuthCheck>
  );
}