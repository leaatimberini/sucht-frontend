// Dashboard - Página de Invitaciones y Regalos para el Propietario
// Permite al propietario enviar invitaciones de cortesía y regalos a los invitados.
// Implementa validaciones robustas y una interfaz de usuario intuitiva.

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
import { Loader2, Send, Gift, Crown, Plus, Minus, Ticket, CalendarDays } from 'lucide-react';

// Interfaz para el tipo de dato Evento
interface Event {
  id: string;
  title: string;
  startDate: string;
}

// Esquema de validación actualizado para incluir el evento
const invitationSchema = z.object({
  email: z.string().email({ message: 'Debe ser un correo electrónico válido.' }),
  eventId: z.string().min(1, { message: 'Debes seleccionar un evento.' }), // <-- CAMPO NUEVO
  includeEntry: z.boolean().default(true),
  guestCount: z.coerce.number().int().min(0).max(10).optional(),
  isVipAccess: z.boolean().optional(),
}).refine(data => {
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
  const [events, setEvents] = useState<Event[]>([]); // <-- ESTADO PARA EVENTOS
  const [giftableProducts, setGiftableProducts] = useState<Product[]>([]);
  const [selectedGifts, setSelectedGifts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ // <-- Tipado explícito
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
      eventId: '', // <-- Valor por defecto
      includeEntry: true,
      guestCount: 0,
      isVipAccess: false,
    },
  });
  
  const includeEntry = useWatch({ control, name: 'includeEntry' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar eventos y productos en paralelo
        const [eventsRes, productsRes] = await Promise.all([
          api.get('/events'),
          api.get('/store/products/giftable')
        ]);
        
        // Filtrar solo eventos futuros
        const futureEvents = eventsRes.data.filter(
          (event: Event) => new Date(event.startDate) > new Date()
        );
        setEvents(futureEvents);
        setGiftableProducts(productsRes.data);

      } catch (error) {
        toast.error('No se pudieron cargar los datos necesarios (eventos/productos).');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGiftQuantityChange = (productId: string, delta: number) => {
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
    const giftedProductsPayload = Object.entries(selectedGifts).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    if (!data.includeEntry && giftedProductsPayload.length === 0) {
        toast.error("Debes incluir una entrada o regalar al menos un producto.");
        return;
    }

    // <-- Payload actualizado para incluir eventId
    const finalPayload: any = {
      email: data.email,
      eventId: data.eventId,
      giftedProducts: giftedProductsPayload,
    };

    if(data.includeEntry) {
        finalPayload.guestCount = data.guestCount;
        finalPayload.isVipAccess = data.isVipAccess;
    }

    try {
      // Endpoint actualizado a la nueva convención
      await api.post('/owner-invitations', finalPayload);
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
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                <input {...register('email')} id="email" type="email" placeholder="invitado@email.com" className="w-full bg-zinc-800 rounded-md p-2 text-white placeholder-zinc-500 border border-transparent focus:border-pink-600 focus:ring-0" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          {/* --- NUEVA SECCIÓN PARA SELECCIONAR EVENTO --- */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><CalendarDays size={20} /> 2. Evento de la Invitación</h2>
            <div>
              <label htmlFor="eventId" className="block text-sm font-medium text-zinc-300 mb-1">Seleccionar Evento</label>
              <select
                {...register('eventId')}
                id="eventId"
                className="w-full bg-zinc-800 rounded-md p-2 text-white border border-transparent focus:border-pink-600 focus:ring-0 disabled:opacity-50"
                disabled={isLoading || events.length === 0}
              >
                <option value="" disabled>
                  {isLoading ? "Cargando eventos..." : "Elige un evento"}
                </option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
              {events.length === 0 && !isLoading && <p className="text-amber-500 text-xs mt-1">No hay eventos futuros disponibles.</p>}
              {errors.eventId && <p className="text-red-500 text-xs mt-1">{errors.eventId.message}</p>}
            </div>
          </div>
          {/* --- FIN DE LA NUEVA SECCIÓN --- */}


          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Ticket size={20} /> 3. Entrada de Cortesía</h2>
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
                            <input {...register('guestCount')} id="guestCount" type="number" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-transparent focus:border-pink-600 focus:ring-0" />
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
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><Gift size={20} /> 4. Regalar Productos de Barra</h2>
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
                  <p className="text-center text-zinc-500 py-4">No hay productos configurados en la tienda para regalar.</p>
                )}
              </div>
            )}
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