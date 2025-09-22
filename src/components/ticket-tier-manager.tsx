// src/components/ticket-tier-manager.tsx

'use client';



import { useEffect, useState, useCallback } from "react";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import api from "@/lib/axios";

import { TicketTier, ProductType } from "@/types/ticket.types";

import toast from "react-hot-toast";

import { Modal } from "./ui/modal";

import { PlusCircle, Edit, Trash2 } from "lucide-react";

import { EditTicketTierForm } from "./edit-ticket-tier-form";



// 1. AÑADIMOS LOS NUEVOS CAMPOS AL ESQUEMA DE VALIDACIÓN

const createTierSchema = z.object({

  name: z.string().min(3, { message: "El nombre es requerido." }),

  isFree: z.boolean().default(false),

  price: z.coerce.number().min(0, { message: "El precio no puede ser negativo." }).optional(),

  quantity: z.coerce.number().int().min(1, { message: "La cantidad debe ser al menos 1." }),

  validUntil: z.string().optional(),

  productType: z.nativeEnum(ProductType).default(ProductType.TICKET),

  allowPartialPayment: z.boolean().default(false),

  partialPaymentPrice: z.coerce.number().min(0).optional().nullable(),

  // --- Nuevos campos de cumpleaños ---

  isBirthdayDefault: z.boolean().optional(),

  isBirthdayVipOffer: z.boolean().optional(),

  consumptionCredit: z.coerce.number().min(0).optional().nullable(),

}).refine(data => {

  if (!data.isFree && (!data.price || data.price <= 0)) {

    return false;

  }

  return true;

}, {

  message: "El precio es requerido y debe ser mayor a cero para entradas de pago.",

  path: ['price'],

}).refine(data => {

  if (data.allowPartialPayment && (!data.partialPaymentPrice || data.partialPaymentPrice <= 0)) {

    return false;

  }

  return true;

}, {

    message: "El precio de la seña es requerido si se permite el pago parcial.",

    path: ['partialPaymentPrice'],

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

    formState: { errors, isSubmitting },

  } = useForm({

    resolver: zodResolver(createTierSchema),

    // 2. AÑADIMOS VALORES POR DEFECTO PARA LOS NUEVOS CAMPOS

    defaultValues: {

        isFree: false,

        allowPartialPayment: false,

        productType: ProductType.TICKET,

        isBirthdayDefault: false,

        isBirthdayVipOffer: false,

    }

  });



  const isFreeTicket = watch('isFree');

  const allowPartialPayment = watch('allowPartialPayment');

  const productType = watch('productType');



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



  // 3. ACTUALIZAMOS EL PAYLOAD PARA ENVIAR TODOS LOS DATOS NUEVOS

  const onSubmitCreate = async (data: CreateTierFormInputs) => {

    try {

      const payload = {

        ...data,

        price: data.isFree ? 0 : data.price,

        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,

        partialPaymentPrice: data.allowPartialPayment ? data.partialPaymentPrice : null,

      };

      await api.post(`/events/${eventId}/ticket-tiers`, payload);

      toast.success("Tipo de entrada creado con éxito.");

      reset();

      fetchTiers();

      setIsCreateModalOpen(false);

    } catch (error: any) {

      toast.error(error.response?.data?.message || "Error al crear el tipo de entrada.");

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

          onClick={() => setIsCreateModalOpen(true)}

          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-3 rounded-lg flex items-center space-x-2 text-sm"

        >

          <PlusCircle className="h-4 w-4" />

          <span>Añadir Tipo</span>

        </button>

      </div>

     

      <div className="mt-4 space-y-3">

        {tiers.length > 0 ? (

          tiers.map(tier => (

            <div key={tier.id} className="flex justify-between items-center bg-zinc-900 p-4 rounded-lg border border-zinc-800">

              <div>

                <p className="font-semibold text-white">{tier.name}</p>

                <p className="text-sm text-zinc-400">Tipo: {tier.productType} | Cantidad: {tier.quantity}</p>

                {tier.validUntil && (

                  <p className="text-xs text-yellow-400 mt-1">

                    Válido hasta: {new Date(tier.validUntil).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })} hs.

                  </p>

                )}

              </div>

              <div className="flex items-center space-x-4">

                <p className="font-bold text-lg text-pink-500">

                  {tier.isFree ? 'Gratis' : `$${tier.price}`}

                </p>

                <button onClick={() => handleEditClick(tier)} className="text-zinc-400 hover:text-white" title="Editar"><Edit className="h-4 w-4" /></button>

                <button onClick={() => handleDeleteClick(tier.id)} className="text-zinc-400 hover:text-red-500" title="Eliminar"><Trash2 className="h-4 w-4" /></button>

              </div>

            </div>

          ))

        ) : (

          <div className="text-center py-10 bg-zinc-900 border border-zinc-800 rounded-lg">

            <p className="text-zinc-500">Aún no hay tipos de entrada para este evento.</p>

          </div>

        )}

      </div>



      <Modal

        isOpen={isCreateModalOpen}

        onClose={() => setIsCreateModalOpen(false)}

        title="Añadir Nuevo Tipo de Entrada"

      >

        <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4">

          <div>

            <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">Nombre (Ej: General)</label>

            <input {...register('name')} id="name" className="w-full bg-zinc-800 rounded-md p-2 text-white" />

            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}

          </div>



          <div>

            <label htmlFor="productType" className="block text-sm font-medium text-zinc-300 mb-1">Tipo de Producto</label>

            <select {...register('productType')} id="productType" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700">

              <option value={ProductType.TICKET}>Entrada General</option>

              <option value={ProductType.VIP_TABLE}>Mesa VIP</option>

              <option value={ProductType.VOUCHER}>Voucher de Consumo</option>

            </select>

            {errors.productType && <p className="text-xs text-red-500 mt-1">{errors.productType.message}</p>}

          </div>

         

          {/* --- 4. AÑADIMOS LA NUEVA SECCIÓN DE CONFIGURACIÓN DE CUMPLEAÑOS --- */}

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

            {productType === ProductType.VIP_TABLE && (

                <div className="animate-in fade-in pt-2">

                  <label htmlFor="consumptionCredit-create" className="block text-sm font-medium text-zinc-300 mb-1">Crédito en Consumo ($)</label>

                  <input {...register('consumptionCredit')} id="consumptionCredit-create" type="number" step="1" placeholder="200000" className="w-full bg-zinc-800 rounded-md p-2 text-white" />

                  <p className="text-xs text-zinc-500 mt-1">Define el valor en consumo que incluye esta mesa.</p>

                </div>

            )}

          </div>



          <div className="flex items-center space-x-2">

            <input type="checkbox" id="isFree" {...register('isFree')} className="accent-pink-600" />

            <label htmlFor="isFree" className="text-sm font-medium text-zinc-300">Sin Cargo</label>

          </div>



          <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-md">

            <label htmlFor="allowPartialPayment" className="text-sm font-medium text-zinc-300">Permitir Seña</label>

            <label htmlFor="allowPartialPayment" className="relative inline-flex items-center cursor-pointer">

              <input type="checkbox" id="allowPartialPayment" className="sr-only peer" {...register('allowPartialPayment')} />

              <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>

            </label>

          </div>



          {allowPartialPayment && (

            <div className="animate-in fade-in">

              <label htmlFor="partialPaymentPrice" className="block text-sm font-medium text-zinc-300 mb-1">Precio de la Seña</label>

              <input {...register('partialPaymentPrice')} id="partialPaymentPrice" type="number" step="0.01" className="w-full bg-zinc-800 rounded-md p-2 text-white" />

              {errors.partialPaymentPrice && <p className="text-xs text-red-500 mt-1">{errors.partialPaymentPrice.message}</p>}

            </div>

          )}



          {!isFreeTicket && (

            <div>

              <label htmlFor="price" className="block text-sm font-medium text-zinc-300 mb-1">Precio Total</label>

              <input {...register('price')} id="price" type="number" step="0.01" className="w-full bg-zinc-800 rounded-md p-2 text-white" />

              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}

            </div>

          )}



          <div>

            <label htmlFor="quantity" className="block text-sm font-medium text-zinc-300 mb-1">Cantidad Disponible</label>

            <input {...register('quantity')} id="quantity" type="number" className="w-full bg-zinc-800 rounded-md p-2 text-white" />

            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}

          </div>



          <div>

            <label htmlFor="validUntil" className="block text-sm font-medium text-zinc-300 mb-1">Válido Hasta (Opcional)</label>

            <input id="validUntil" type="datetime-local" {...register('validUntil')} className="w-full bg-zinc-800 rounded-md p-2 text-white"/>

          </div>

         

          <div className="flex justify-end pt-4">

            <button type="submit" disabled={isSubmitting} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg disabled:opacity-50">

              {isSubmitting ? 'Añadiendo...' : 'Añadir Entrada'}

            </button>

          </div>

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