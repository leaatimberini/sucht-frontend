'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { AuthCheck } from '@/components/auth-check';
import { UserRole } from '@/types/user.types';
import { Loader2, Send, Gift, Crown, Plus, Minus } from 'lucide-react';
import { Product } from '@/types/product.types'; // 1. IMPORTAMOS EL TIPO CORRECTO

const invitationSchema = z.object({
  email: z.string().email({ message: 'Debe ser un correo electrónico válido.' }),
  guestCount: z.coerce.number().int().min(0, 'No puede ser negativo.').max(10, 'El máximo es 10.'),
  isVipAccess: z.boolean().default(false),
});

type InvitationFormInputs = z.infer<typeof invitationSchema>;

export default function OwnerInvitationsPage() {
  const [giftableProducts, setGiftableProducts] = useState<Product[]>([]); // 2. USAMOS EL TIPO Product
  const [selectedGifts, setSelectedGifts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      guestCount: 0,
      isVipAccess: false,
    },
  });

  useEffect(() => {
    const fetchGiftableProducts = async () => {
      try {
        // 3. LLAMAMOS AL ENDPOINT CORRECTO DE PRODUCTOS
        const response = await api.get('/store/products/giftable');
        setGiftableProducts(response.data);
      } catch (error) {
        toast.error('No se pudieron cargar los productos para regalar.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGiftableProducts();
  }, []);

  const handleGiftQuantityChange = (productId: string, delta: number) => { // 4. Cambiado a productId
    setSelectedGifts(prev => {
      const currentQuantity = prev[productId] || 0;
      const newQuantity = Math.max(0, currentQuantity + delta);
      const newGifts = { ...prev };
      if (newQuantity === 0) {
        delete newGifts[productId];
      } else {
        newGifts[productId] = newQuantity;
      }
      return newGifts;
    });
  };

  const onSubmit = async (data: InvitationFormInputs) => {
    // 5. ENVIAMOS productId EN LUGAR DE tierId
    const giftedProductsPayload = Object.entries(selectedGifts).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    const finalPayload = {
      ...data,
      giftedProducts: giftedProductsPayload,
    };

    try {
      await api.post('/owner/invitations', finalPayload);
      toast.success(`¡Invitación especial enviada a ${data.email}!`);
      reset();
      setSelectedGifts({});
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar la invitación.');
    }
  };

  return (
    <AuthCheck allowedRoles={[UserRole.OWNER, UserRole.ADMIN]}>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-white">Invitaciones Especiales</h1>
          <p className="text-zinc-400 mt-2">Envía una invitación de cortesía con acceso preferencial y regalos de la casa.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">1. Datos del Invitado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">Email del Invitado</label>
                <input {...register('email')} id="email" type="email" placeholder="invitado@email.com" className="w-full bg-zinc-800 rounded-md p-2" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="guestCount" className="block text-sm font-medium text-zinc-300 mb-1">Nº de Acompañantes</label>
                <input {...register('guestCount')} id="guestCount" type="number" className="w-full bg-zinc-800 rounded-md p-2" />
                {errors.guestCount && <p className="text-red-500 text-xs mt-1">{errors.guestCount.message}</p>}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between bg-zinc-800/50 p-3 rounded-md">
              <label htmlFor="isVipAccess" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Crown size={16} className="text-amber-400" />
                Otorgar Acceso VIP
              </label>
              <Controller
                name="isVipAccess"
                control={control}
                render={({ field }) => (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                  </label>
                )}
              />
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">2. Regalar Productos de Barra (Opcional)</h2>
            {isLoading ? <p className="text-zinc-400">Cargando productos...</p> : (
              <div className="space-y-3">
                {giftableProducts.length > 0 ? giftableProducts.map(product => (
                  <div key={product.id} className="flex justify-between items-center bg-zinc-800/50 p-3 rounded-md">
                    <div>
                      <p className="font-medium text-zinc-200">{product.name}</p>
                      <p className="text-xs text-zinc-500">${product.price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => handleGiftQuantityChange(product.id, -1)} className="p-1 rounded-full bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50" disabled={(selectedGifts[product.id] || 0) === 0}><Minus size={16} /></button>
                      <span className="font-bold text-lg w-8 text-center">{selectedGifts[product.id] || 0}</span>
                      <button type="button" onClick={() => handleGiftQuantityChange(product.id, 1)} className="p-1 rounded-full bg-zinc-700 hover:bg-zinc-600"><Plus size={16} /></button>
                    </div>
                  </div>
                )) : (
                  // MENSAJE MEJORADO
                  <p className="text-center text-zinc-500 py-4">No hay productos configurados en la tienda para regalar.</p>
                )}
              </div>
            )}
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 text-lg disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={20}/> Enviar Invitación Especial</>}
            </button>
          </div>
        </form>
      </div>
    </AuthCheck>
  );
}