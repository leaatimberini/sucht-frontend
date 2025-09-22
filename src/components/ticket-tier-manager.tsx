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

// FIX: Se reintroduce 'isFree' en el esquema de validación
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
}).refine(data => !data.isFree ? data.price > 0 : true, {
    message: "El precio es requerido para entradas de pago.",
    path: ['price'],
});

type CreateTierFormInputs = z.infer<typeof createTierSchema>;

export function TicketTierManager({ eventId }: { eventId: string }) {
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue, // Importamos setValue para controlar el formulario
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createTierSchema),
    defaultValues: {
        name: '',
        isFree: true,
        price: 0,
        quantity: 100,
        productType: ProductType.TICKET,
    }
  });

  const isFreeTicket = watch('isFree');
  const allowPartialPayment = watch('allowPartialPayment');

  // FIX: Lógica para poner el precio a 0 automáticamente si se marca "Sin Cargo"
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
        eventId,
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
            reset({ name: '', isFree: true, price: 0, quantity: 100, productType: ProductType.TICKET });
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
          {/* Usamos el formulario completo como en la captura de pantalla */}
          <div>
            <label htmlFor="name-create">Nombre</label>
            <input {...register('name')} id="name-create" />
            {errors.name && <p>{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="productType-create">Tipo de Producto</label>
            <select {...register('productType')} id="productType-create">
              <option value={ProductType.TICKET}>Entrada General</option>
              <option value={ProductType.VIP_TABLE}>Mesa VIP</option>
              <option value={ProductType.VOUCHER}>Voucher de Consumo</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isFree-create" {...register('isFree')} />
            <label htmlFor="isFree-create">Sin Cargo</label>
          </div>
          {!isFreeTicket && (
            <div>
              <label htmlFor="price-create">Precio</label>
              <input {...register('price')} id="price-create" type="number" step="0.01" />
              {errors.price && <p>{errors.price.message}</p>}
            </div>
          )}
          {/* (Aquí irían los demás campos del formulario de la captura) */}
          <button type="submit" disabled={isSubmitting}>Añadir Entrada</button>
        </form>
      </Modal>

      {selectedTier && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Editando: ${selectedTier.name}`}>
          <EditTicketTierForm 
            tier={selectedTier}
            eventId={eventId}
            onClose={() => setIsEditModalOpen(false)}
            onTierUpdated={fetchTiers}
          />
        </Modal>
      )}
    </>
  );
}