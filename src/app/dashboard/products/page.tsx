// frontend/src/app/dashboard/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { PlusCircle, Edit, Trash2, Loader, ShoppingBasket } from 'lucide-react';

// --- TIPOS DE DATOS ---
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  stock: number | null;
  isActive: boolean;
}

const productSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido'),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  originalPrice: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
});
type ProductFormInputs = z.infer<typeof productSchema>;

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/store/products');
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
    reset({ name: '', description: null, price: 0, originalPrice: null, stock: null, isActive: true });
    setIsModalOpen(true);
  };

  const openModalToEdit = (product: Product) => {
    setEditingProduct(product);
    reset(product);
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

      {/* Tabla de Productos */}
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
                  <button onClick={() => openModalToEdit(product)} className="text-zinc-400 hover:text-white"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-400"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
             {products.length === 0 && !isLoading && (
                <tr><td colSpan={6} className="text-center p-6 text-zinc-500">No hay productos creados. ¡Añade el primero!</td></tr>
              )}
          </tbody>
        </table>
      </div>

      {/* Modal para Crear/Editar Productos */}
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
    </div>
  );
}