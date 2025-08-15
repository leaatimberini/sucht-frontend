'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { AuthCheck } from '@/components/auth-check';
import { UserRole } from '@/types/user.types';
import { Product } from '@/types/product.types';
import { Loader2, Send, Gift, Crown, Plus, Minus, Ticket } from 'lucide-react';

// Esquema de validación actualizado
const invitationSchema = z.object({
  email: z.string().email({ message: 'Debe ser un correo electrónico válido.' }),
  includeEntry: z.boolean().default(true),
  guestCount: z.coerce.number().int().min(0).max(10).optional(),
  isVipAccess: z.boolean().optional(),
}).refine(data => {
    // Si se incluye entrada, el número de acompañantes es requerido
    if(data.includeEntry && (data.guestCount === undefined || data.guestCount < 0)) {
        return false;
    }
    return true;
}, {
    message: "El número de acompañantes es requerido.",
    path: ["guestCount"]
});

type InvitationFormInputs = z.infer<typeof invitationSchema>;

export default function OwnerInvitationsPage() {
  const [giftableProducts, setGiftableProducts] = useState<Product[]>([]);
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
      includeEntry: true,
      guestCount: 0,
      isVipAccess: false,
    },
  });
  
  const includeEntry = useWatch({ control, name: 'includeEntry' });

  useEffect(() => {
    const fetchGiftableProducts = async () => { /* ... */ };
    fetchGiftableProducts();
  }, []);

  const handleGiftQuantityChange = (productId: string, delta: number) => { /* ... */ };

  const onSubmit = async (data: InvitationFormInputs) => {
    const giftedProductsPayload = Object.entries(selectedGifts).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    if (!data.includeEntry && giftedProductsPayload.length === 0) {
        toast.error("Debes incluir una entrada o regalar al menos un producto.");
        return;
    }

    const finalPayload: any = {
      email: data.email,
      giftedProducts: giftedProductsPayload,
    };

    if(data.includeEntry) {
        finalPayload.guestCount = data.guestCount;
        finalPayload.isVipAccess = data.isVipAccess;
    }

    try {
      await api.post('/owner/invitations', finalPayload);
      toast.success(`¡Invitación/Regalo enviado a ${data.email}!`);
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
          <h1 className="text-3xl font-bold text-white">Invitaciones y Regalos</h1>
          <p className="text-zinc-400 mt-2">Envía una invitación de cortesía, regalos de la casa, o ambas cosas.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">1. Email del Invitado</h2>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">Email del Invitado</label>
                <input {...register('email')} id="email" type="email" placeholder="invitado@email.com" className="w-full bg-zinc-800 rounded-md p-2" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">2. Entrada de Cortesía</h2>
                <Controller
                    name="includeEntry"
                    control={control}
                    render={({ field }) => (
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={field.value} onChange={field.onChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
                    )}
                />
            </div>
            {includeEntry && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="guestCount" className="block text-sm font-medium text-zinc-300 mb-1">Nº de Acompañantes</label>
                            <input {...register('guestCount')} id="guestCount" type="number" className="w-full bg-zinc-800 rounded-md p-2" />
                            {errors.guestCount && <p className="text-red-500 text-xs mt-1">{errors.guestCount.message}</p>}
                        </div>
                    </div>
                    <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-md">
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
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">3. Regalar Productos de Barra</h2>
            {/* ... (lógica de regalos sin cambios) ... */}
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 text-lg disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={20}/> Enviar</>}
            </button>
          </div>
        </form>
      </div>
    </AuthCheck>
  );
}