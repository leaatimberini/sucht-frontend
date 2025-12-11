'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { PlusCircle, Edit, Trash2, Loader, ShoppingBasket, Gift, History, Check, X, Loader2, Plus, Search, Pencil, Package, DollarSign, Filter } from 'lucide-react';
import { Event } from '@/types/event.types';
import { AuthCheck } from '@/components/auth-check';
import { UserRole } from '@/types/user.types';
import { formatDate } from '@/lib/date-utils';

// --- TIPOS DE DATOS ---
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  stock: number | null;
  isActive: boolean;
  imageUrl?: string | null;
}

interface ProductPurchaseHistory {
  id: string;
  user: { name: string; email: string };
  product: { name: string };
  event: { title: string };
  quantity: number;
  amountPaid: number;
  origin: string;
  redeemedAt: string | null;
  createdAt: string;
}

const productSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido'),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  originalPrice: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
  imageUrl: z.string().url().optional().or(z.literal('')),
});
type ProductFormInputs = z.infer<typeof productSchema>;

const giftSchema = z.object({
  email: z.string().email('Debe ser un email válido.'),
  eventId: z.string().min(1, 'Debes seleccionar un evento.'),
  quantity: z.coerce.number().int().min(1, 'La cantidad debe ser al menos 1.'),
});
type GiftFormInputs = z.infer<typeof giftSchema>;

// --- SUB-COMPONENTE: MODAL PARA REGALAR PRODUCTOS (CORREGIDO) ---
function GiftProductModal({ product, onClose }: { product: Product, onClose: () => void }) {
  const [events, setEvents] = useState<Event[]>([]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(giftSchema),
    defaultValues: { quantity: 1 }
  });

  useEffect(() => {
    api.get('/events').then(res => setEvents(res.data));
  }, []);

  const onSubmit = async (data: GiftFormInputs) => {
    try {
      await api.post('/store/products/gift', {
        ...data,
        productId: product.id
      });
      toast.success(`¡${product.name} (x${data.quantity}) enviado a ${data.email}!`);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar el regalo.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-2">Regalar Producto</h2>
        <p className="text-zinc-400 mb-6">Estás regalando: <span className="font-semibold text-pink-400">{product.name}</span></p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300">Email del Cliente</label>
            <input id="email" {...register('email')} className="mt-1 w-full bg-zinc-800 p-2 rounded-md" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-zinc-300">Cantidad</label>
              <input id="quantity" type="number" {...register('quantity')} className="mt-1 w-full bg-zinc-800 p-2 rounded-md" />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
            </div>
            <div>
              <label htmlFor="eventId" className="block text-sm font-medium text-zinc-300">Para el Evento</label>
              <select id="eventId" {...register('eventId')} className="mt-1 w-full bg-zinc-800 p-2 rounded-md">
                <option value="">Selecciona un evento</option>
                {events.map(event => <option key={event.id} value={event.id}>{event.title}</option>)}
              </select>
              {errors.eventId && <p className="text-red-500 text-xs mt-1">{errors.eventId.message}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
              {isSubmitting ? <Loader className="animate-spin" /> : 'Enviar Regalo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTE: HISTORIAL DE COMPRAS ---
function PurchaseHistory() {
  const [history, setHistory] = useState<ProductPurchaseHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/store/purchase/history');
        setHistory(response.data);
      } catch (error) {
        toast.error('No se pudo cargar el historial de compras.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
        <History className="text-sky-400" />
        Historial de Compras de Productos
      </h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-zinc-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-white">Fecha</th>
              <th className="p-4 text-sm font-semibold text-white">Cliente</th>
              <th className="p-4 text-sm font-semibold text-white">Producto</th>
              <th className="p-4 text-sm font-semibold text-white">Evento</th>
              <th className="p-4 text-sm font-semibold text-white">Origen</th>
              <th className="p-4 text-sm font-semibold text-white text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center p-6 text-zinc-400"><Loader2 className="animate-spin mx-auto" /></td></tr>
            ) : history.map((purchase) => (
              <tr key={purchase.id} className="border-b border-zinc-800 last:border-b-0">
                <td className="p-4 text-zinc-400 text-sm">{formatDate(purchase.createdAt, 'dd/MM/yy HH:mm')}hs</td>
                <td className="p-4"><p className="font-semibold text-zinc-200">{purchase.user.name}</p><p className="text-sm text-zinc-500">{purchase.user.email}</p></td>
                <td className="p-4 font-semibold text-white">{purchase.product.name} (x{purchase.quantity})</td>
                <td className="p-4 text-zinc-300">{purchase.event.title}</td>
                <td className="p-4"><span className={`px-2 py-0.5 text-xs rounded-full ${purchase.origin === 'PURCHASE' ? 'bg-blue-500/20 text-blue-400' :
                  purchase.origin === 'OWNER_GIFT' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>{purchase.origin}</span></td>
                <td className="p-4 text-center">
                  {purchase.redeemedAt ? (
                    <span className="flex items-center justify-center gap-2 text-green-400"><Check size={16} /> Canjeado</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2 text-zinc-400"><X size={16} /> Pendiente</span>
                  )}
                </td>
              </tr>
            ))}
            {history.length === 0 && !isLoading && (
              <tr><td colSpan={6} className="text-center p-6 text-zinc-500">No hay compras de productos registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [giftingProduct, setGiftingProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/store/admin/products');
      setProducts(response.data);
    } catch (error) {
      toast.error('No se pudieron cargar los productos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModalToCreate = () => {
    setEditingProduct(null);
    reset({ name: '', description: null, price: 0, originalPrice: null, stock: null, isActive: true, imageUrl: '' });
    setIsModalOpen(true);
  };

  const openModalToEdit = (product: Product) => {
    setEditingProduct(product);
    reset({ ...product, imageUrl: product.imageUrl || '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await api.delete(`/store/products/${id}`);
        toast.success('Producto eliminado.');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar el producto.');
      }
    }
  };

  const onSubmit = async (data: ProductFormInputs) => {
    try {
      if (editingProduct) {
        await api.patch(`/store/products/${editingProduct.id}`, data);
        toast.success('Producto actualizado con éxito.');
      } else {
        await api.post('/store/products', data);
        toast.success('Producto creado con éxito.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Ocurrió un error al guardar el producto.');
    }
  };

  return (
    <AuthCheck allowedRoles={[UserRole.ADMIN]}>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShoppingBasket className="text-pink-400" />
            Gestión de Productos (Tienda)
          </h1>
          <button
            onClick={openModalToCreate}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Crear Producto
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-700">
              <tr>
                <th className="p-4 text-sm font-semibold text-white">Nombre</th>
                <th className="p-4 text-sm font-semibold text-white">Precio (Desc.)</th>
                <th className="p-4 text-sm font-semibold text-white">Precio Orig.</th>
                <th className="p-4 text-sm font-semibold text-white">Stock</th>
                <th className="p-4 text-sm font-semibold text-white">Estado</th>
                <th className="p-4 text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center p-6 text-zinc-400">Cargando productos...</td></tr>
              ) : products.map((product) => (
                <tr key={product.id} className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50">
                  <td className="p-4 font-semibold text-zinc-200">{product.name}</td>
                  <td className="p-4 text-green-400 font-bold">${product.price}</td>
                  <td className="p-4 text-zinc-400 line-through">${product.originalPrice ?? '-'}</td>
                  <td className="p-4 text-zinc-300">{product.stock ?? 'Ilimitado'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${product.isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4 flex items-center gap-4">
                    <button onClick={() => setGiftingProduct(product)} className="text-green-400 hover:text-green-300" title="Regalar Producto"><Gift size={18} /></button>
                    <button onClick={() => openModalToEdit(product)} className="text-zinc-400 hover:text-white" title="Editar"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-400" title="Eliminar"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && !isLoading && (
                <tr><td colSpan={6} className="text-center p-6 text-zinc-500">No hay productos creados. ¡Añade el primero!</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 w-full max-w-lg">
              <h2 className="text-2xl font-bold text-white mb-6">{editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-zinc-300">Nombre del Producto</label>
                  <input id="name" {...register('name')} className="mt-1 w-full bg-zinc-800 p-2 rounded-md" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-zinc-300">Precio (con Descuento)</label>
                    <input id="price" type="number" step="0.01" {...register('price')} className="mt-1 w-full bg-zinc-800 p-2 rounded-md" />
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="originalPrice" className="block text-sm font-medium text-zinc-300">Precio Original (de Carta)</label>
                    <input id="originalPrice" type="number" step="0.01" {...register('originalPrice')} className="mt-1 w-full bg-zinc-800 p-2 rounded-md" />
                  </div>
                </div>
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-zinc-300">Stock (dejar vacío para ilimitado)</label>
                  <input id="stock" type="number" {...register('stock')} className="mt-1 w-full bg-zinc-800 p-2 rounded-md" />
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Imagen del Producto</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="URL de la imagen (o subir archivo)"
                      {...register('imageUrl')}
                      className="flex-1 bg-zinc-800 p-2 rounded-md text-sm"
                    />
                    <label className="bg-zinc-700 hover:bg-zinc-600 text-white cursor-pointer px-4 py-2 rounded-md flex items-center gap-2">
                      <span className="text-sm font-bold">Subir</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const formData = new FormData();
                          formData.append('file', file);

                          const toastId = toast.loading('Subiendo imagen...');
                          try {
                            const res = await api.post('/cloudinary/upload', formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            // Assuming response matches Cloudinary response structure 
                            // and we want 'secure_url' or 'url'
                            const url = res.data.secure_url || res.data.url;
                            if (url) {
                              reset({ ...getValues(), imageUrl: url });
                              toast.success('Imagen subida', { id: toastId });
                            }
                          } catch (err) {
                            console.error(err);
                            toast.error('Error al subir', { id: toastId });
                          }
                        }}
                      />
                    </label>
                  </div>
                  {/* Preview */}
                  {watch('imageUrl') && (
                    <div className="mt-2 w-full h-32 bg-zinc-800 rounded-md relative overflow-hidden">
                      <img src={watch('imageUrl')!} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-zinc-300">Descripción</label>
                  <textarea id="description" {...register('description')} className="mt-1 w-full bg-zinc-800 p-2 rounded-md" rows={3}></textarea>
                </div>
                <div className="flex items-center gap-2">
                  <input id="isActive" type="checkbox" {...register('isActive')} className="accent-pink-600" />
                  <label htmlFor="isActive" className="text-sm text-zinc-300">Producto Activo en la Tienda</label>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>
                  <button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                    {isSubmitting ? <Loader className="animate-spin" /> : 'Guardar Producto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {giftingProduct && <GiftProductModal product={giftingProduct} onClose={() => setGiftingProduct(null)} />}

        {/* Renderizamos el nuevo componente de historial */}
        <PurchaseHistory />
      </div>
    </AuthCheck>
  );
}