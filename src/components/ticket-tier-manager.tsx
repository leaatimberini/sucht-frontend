'use client';

import { useEffect, useState, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { TicketTier, ProductType } from "@/types/ticket.types";
import toast from "react-hot-toast";
import { Modal } from "./ui/modal";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { EditTicketTierForm } from "./edit-ticket-tier-form";

// Esquema de validación COMPLETO para el formulario de CREACIÓN
const createTierSchema = z.object({
  name: z.string().min(3, { message: "El nombre es requerido." }),
  isFree: z.boolean().default(true),
  price: z.coerce.number().min(0, { message: "El precio no puede ser negativo." }),
  quantity: z.coerce.number().int().min(1, { message: "La cantidad debe ser al menos 1." }),
  productType: z.nativeEnum(ProductType),
  allowPartialPayment: z.boolean().default(false),
  partialPaymentPrice: z.coerce.number().min(0).optional().nullable(),
  isBirthdayDefault: z.boolean().optional(),
  isBirthdayVipOffer: z.boolean().optional(),
  consumptionCredit: z.coerce.number().min(0).optional().nullable(),
  validUntil: z.string().optional().nullable(),
  // --- NUEVO: CAMPOS PARA MESAS VIP AÑADIDOS AL SCHEMA ---
  tableNumber: z.coerce.number().int().positive().optional().nullable(),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  location: z.string().optional().nullable(),
  linkedRewardId: z.string().optional().nullable(), // Nuevo campo en schema
}).refine(data => !data.isFree ? data.price > 0 : true, {
  message: "El precio es requerido para entradas de pago.",
  path: ['price'],
}).refine(data => data.allowPartialPayment ? data.partialPaymentPrice && data.partialPaymentPrice > 0 : true, {
  message: "El precio de la seña es requerido si se permite el pago parcial.",
  path: ['partialPaymentPrice'],
});

type CreateTierFormInputs = z.infer<typeof createTierSchema>;

export function TicketTierManager({ eventId }: { eventId: string }) {
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [rewards, setRewards] = useState<any[]>([]); // Estado para rewards

  // Fetch rewards
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const { data } = await api.get('/rewards');
        setRewards(data);
      } catch (error) {
        console.error("Error fetching rewards", error);
      }
    };
    fetchRewards();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createTierSchema),
    defaultValues: {
      name: '',
      isFree: true,
      price: 0,
      quantity: 100,
      productType: ProductType.TICKET,
      allowPartialPayment: false,
      isBirthdayDefault: false,
      isBirthdayVipOffer: false,
    }
  });

  const isFreeTicket = watch('isFree');
  const allowPartialPayment = watch('allowPartialPayment');
  const productType = watch('productType');

  useEffect(() => {
    if (isFreeTicket) {
      setValue('price', 0);
    }
  }, [isFreeTicket, setValue]);


  const fetchTiers = useCallback(async () => {
    try {
      const response = await api.get(`/events/${eventId}/ticket-tiers`);
      setTiers(response.data);
    } catch (error) {
      console.error("Failed to fetch ticket tiers", error);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchTiers();
    }
  }, [eventId, fetchTiers]);

  const onSubmitCreate: SubmitHandler<CreateTierFormInputs> = async (data) => {
    try {
      const payload = {
        ...data,
        isFree: data.price === 0,
        eventId: eventId,
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,
      };
      await api.post(`/events/${eventId}/ticket-tiers`, payload);
      toast.success("Tipo de entrada creado con éxito.");
      reset();
      fetchTiers();
      setIsCreateModalOpen(false);
    } catch (error: any) {
      const errorMessages = error.response?.data?.message;
      const displayError = Array.isArray(errorMessages) ? errorMessages.join(', ') : "Error al crear el tipo de entrada.";
      toast.error(displayError);
    }
  };

  const handleEditClick = (tier: TicketTier) => {
    setSelectedTier(tier);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (tierId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este tipo de entrada?")) {
      try {
        await api.delete(`/events/${eventId}/ticket-tiers/${tierId}`);
        toast.success("Tipo de entrada eliminado.");
        fetchTiers();
      } catch (error) {
        toast.error("Error al eliminar el tipo de entrada.");
      }
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mt-8">
        <h3 className="text-xl font-semibold text-white">Entradas Disponibles</h3>
        <button
          onClick={() => {
            reset({ name: '', isFree: true, price: 0, quantity: 100, productType: ProductType.TICKET, allowPartialPayment: false, isBirthdayDefault: false, isBirthdayVipOffer: false });
            setIsCreateModalOpen(true);
          }}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-3 rounded-lg flex items-center space-x-2 text-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Añadir Tipo</span>
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {tiers.map(tier => (
          <div key={tier.id} className="flex justify-between items-center bg-zinc-900 p-4 rounded-lg border border-zinc-800">
            <div>
              <p className="font-semibold text-white">{tier.name}</p>
              <p className="text-sm text-zinc-400">Tipo: {tier.productType} | Cantidad: {tier.quantity}</p>
            </div>
            <div className="flex items-center space-x-4">
              <p className="font-bold text-lg text-pink-500">
                {tier.isFree ? 'Gratis' : `$${tier.price}`}
              </p>
              <button onClick={() => handleEditClick(tier)} className="text-zinc-400 hover:text-white" title="Editar"><Edit className="h-4 w-4" /></button>
              <button onClick={() => handleDeleteClick(tier.id)} className="text-zinc-400 hover:text-red-500" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Añadir Nuevo Tipo de Entrada"
      >
        <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4">
          <div>
            <label htmlFor="name-create" className="block text-sm font-medium text-zinc-300 mb-1">Nombre</label>
            <input {...register('name')} id="name-create" className="w-full bg-zinc-800 rounded-md p-2 text-white" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="productType-create" className="block text-sm font-medium text-zinc-300 mb-1">Tipo de Producto</label>
            <select {...register('productType')} id="productType-create" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700">
              <option value={ProductType.TICKET}>Entrada General</option>
              <option value={ProductType.VIP_TABLE}>Mesa VIP</option>
              <option value={ProductType.VOUCHER}>Voucher de Consumo</option>
            </select>
          </div>

          {/* --- NUEVO: CAMPOS CONDICIONALES PARA MESAS VIP --- */}
          {productType === ProductType.VIP_TABLE && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-dashed border-zinc-600 rounded-lg animate-in fade-in">
              <div>
                <label htmlFor="tableNumber-create" className="block text-sm font-medium text-zinc-300 mb-1">Nº Mesa</label>
                <input type="number" {...register('tableNumber')} id="tableNumber-create" placeholder="Ej: 7" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700" />
                {errors.tableNumber && <p className="text-xs text-red-500 mt-1">{errors.tableNumber.message}</p>}
              </div>
              <div>
                <label htmlFor="capacity-create" className="block text-sm font-medium text-zinc-300 mb-1">Capacidad</label>
                <input type="number" {...register('capacity')} id="capacity-create" placeholder="Ej: 8" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700" />
                {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity.message}</p>}
              </div>
              <div>
                <label htmlFor="location-create" className="block text-sm font-medium text-zinc-300 mb-1">Ubicación</label>
                <input type="text" {...register('location')} id="location-create" placeholder="Ej: Cabina" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700" />
              </div>
            </div>
          )}

          <div className="space-y-3 rounded-lg border border-pink-500/30 bg-pink-500/10 p-4">
            <h4 className="font-semibold text-white">Configuración de Cumpleaños</h4>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="isBirthdayDefault-create" {...register('isBirthdayDefault')} className="h-4 w-4 rounded accent-pink-600" />
              <label htmlFor="isBirthdayDefault-create" className="text-sm font-medium text-zinc-300">Usar como entrada gratuita de cumpleaños</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="isBirthdayVipOffer-create" {...register('isBirthdayVipOffer')} className="h-4 w-4 rounded accent-amber-500" />
              <label htmlFor="isBirthdayVipOffer-create" className="text-sm font-medium text-zinc-300">Usar como oferta VIP de cumpleaños</label>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isFree-create" {...register('isFree')} className="accent-pink-600 h-4 w-4 rounded" />
            <label htmlFor="isFree-create" className="text-sm font-medium text-zinc-300">Sin Cargo</label>
          </div>
          {!isFreeTicket && (
            <div className="animate-in fade-in">
              <label htmlFor="price-create" className="block text-sm font-medium text-zinc-300 mb-1">Precio</label>
              <input {...register('price')} id="price-create" type="number" step="0.01" className="w-full bg-zinc-800 rounded-md p-2 text-white" />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
          )}
          <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-md">
            <label htmlFor="allowPartialPayment-create" className="text-sm font-medium text-zinc-300">Permitir Seña</label>
            <label htmlFor="allowPartialPayment-create" className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="allowPartialPayment-create" className="sr-only peer" {...register('allowPartialPayment')} />
              <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>
          {allowPartialPayment && (
            <div className="animate-in fade-in">
              <label htmlFor="partialPaymentPrice-create" className="block text-sm font-medium text-zinc-300 mb-1">Precio de la Seña</label>
              <input {...register('partialPaymentPrice')} id="partialPaymentPrice-create" type="number" step="0.01" className="w-full bg-zinc-800 rounded-md p-2 text-white" />
              {errors.partialPaymentPrice && <p className="text-xs text-red-500 mt-1">{errors.partialPaymentPrice.message}</p>}
            </div>

          )}

          <div className="animate-in fade-in">
            <label htmlFor="linkedRewardId-create" className="block text-sm font-medium text-zinc-300 mb-1">Incluir Producto/Regalo (Opcional)</label>
            <select {...register('linkedRewardId')} id="linkedRewardId-create" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700">
              <option value="">-- Ninguno --</option>
              {rewards.map(reward => (
                <option key={reward.id} value={reward.id}>
                  {reward.name} ({reward.pointsCost} pts)
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-500 mt-1">El cliente recibirá un QR extra para canjear este producto.</p>
          </div>

          <div>
            <label htmlFor="quantity-create" className="block text-sm font-medium text-zinc-300 mb-1">Cantidad Disponible</label>
            <input {...register('quantity')} id="quantity-create" type="number" className="w-full bg-zinc-800 rounded-md p-2 text-white" />
            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
          </div>
          <div>
            <label htmlFor="validUntil-create" className="block text-sm font-medium text-zinc-300 mb-1">Válido Hasta (Opcional)</label>
            <input id="validUntil-create" type="datetime-local" {...register('validUntil')} className="w-full bg-zinc-800 rounded-md p-2 text-white" />
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSubmitting} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg disabled:opacity-50">
              {isSubmitting ? 'Añadiendo...' : 'Añadir Entrada'}
            </button>
          </div>
        </form>
      </Modal >

      {selectedTier && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Editando: ${selectedTier.name}`}>
          <EditTicketTierForm
            tier={selectedTier}
            eventId={eventId}
            onClose={() => setIsEditModalOpen(false)}
            onTierUpdated={fetchTiers}
          />
        </Modal>
      )
      }
    </>
  );
}