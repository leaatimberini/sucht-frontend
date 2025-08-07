'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useCartStore, CartItem } from '@/stores/cart-store';
import { AuthCheck } from '@/components/auth-check';
import { Event } from '@/types/event.types';
import { Trash2, ShoppingCart, Loader } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Wallet, initMercadoPago } from '@mercadopago/sdk-react';
import toast from 'react-hot-toast';

// Inicializamos Mercado Pago
if (process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
  initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY);
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  // Cargamos los eventos disponibles para el selector
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events?filter=upcoming'); // Asumimos un filtro de eventos futuros
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      }
    };
    fetchEvents();
  }, []);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCreatePreference = async () => {
    if (!selectedEventId) {
      toast.error('Por favor, selecciona un evento para tu compra.');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        eventId: selectedEventId,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };
      const response = await api.post('/store/purchase/create-preference', payload);
      setPreferenceId(response.data.preferenceId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'No se pudo generar el pago.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0 && !preferenceId) {
    return (
      <AuthCheck>
        <div className="container mx-auto px-4 py-8 text-center">
            <ShoppingCart className="mx-auto h-16 w-16 text-zinc-600 mb-4" />
            <h1 className="text-3xl font-bold text-white">Tu carrito está vacío</h1>
            <p className="text-zinc-400 mt-2 mb-6">Parece que aún no has añadido ningún producto.</p>
            <Link href="/store" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg">
              Ir a la Tienda
            </Link>
        </div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Carrito de Compras</h1>

        {!preferenceId ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                  <Image src={item.imageUrl || '/placeholder.png'} alt={item.name} width={80} height={80} className="rounded-md object-cover" />
                  <div className="ml-4 flex-grow">
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <p className="text-green-400 font-semibold">${item.price}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      className="w-16 bg-zinc-800 text-white text-center rounded-md p-2 border border-zinc-700"
                    />
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-lg p-6 h-fit">
              <h2 className="text-2xl font-bold text-white mb-4">Resumen de la Compra</h2>
              <div className="space-y-2 text-zinc-300">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-white text-xl pt-2 border-t border-zinc-700">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-6">
                <label htmlFor="event-selector" className="block text-sm font-medium text-zinc-300 mb-2">
                  Selecciona el evento para tu compra
                </label>
                <select
                  id="event-selector"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700"
                >
                  <option value="">Selecciona un evento...</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleCreatePreference}
                disabled={isLoading || !selectedEventId}
                className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg disabled:opacity-50"
              >
                {isLoading ? <Loader className="animate-spin mx-auto" /> : 'Proceder al Pago'}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Finaliza tu compra</h2>
            <p className="text-zinc-400 mb-6">Serás redirigido a Mercado Pago para completar la compra de forma segura.</p>
            <Wallet initialization={{ preferenceId }} />
            <button onClick={() => { setPreferenceId(null); clearCart(); }} className='w-full text-center text-sm text-zinc-400 hover:text-white mt-4'>
              Cancelar y vaciar carrito
            </button>
          </div>
        )}
      </div>
    </AuthCheck>
  );
}