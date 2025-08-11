// src/app/mi-cuenta/components/MyProducts.tsx
'use client';

import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { ProductPurchase } from '@/types/product-purchase.types'; // ✅ Asegúrate de que esta importación sea la correcta.

// Removimos la definición local de la interfaz para evitar conflictos
// interface ProductPurchase { ... }

export default function MyProducts({ userId }: { userId: string }) {
    const [products, setProducts] = useState<ProductPurchase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/store/purchase/my-products');
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchProducts();
        }
    }, [userId]);

    if (loading) {
        return <div className="text-center py-10 text-white">Cargando productos...</div>;
    }

    if (products.length === 0) {
        return <div className="text-center py-10 text-white">No tienes productos comprados aún.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((purchase) => (
                <div key={purchase.id} className="bg-gray-800 rounded-lg p-6 flex flex-col items-center shadow-lg">
                    <h2 className="text-xl font-bold mb-2 text-white">{purchase.product.name}</h2>
                    <p className="text-gray-400 mb-4">{purchase.event.title}</p>
                    <div className="bg-white p-4 rounded-md mb-4">
                        <QRCode value={purchase.id} size={150} />
                    </div>
                    <p className="text-sm text-gray-500">
                        Comprado el: {new Date(purchase.createdAt).toLocaleDateString()}
                    </p>
                    {purchase.redeemedAt ? (
                        <span className="mt-2 text-green-500 font-bold">Canjeado</span>
                    ) : (
                        <span className="mt-2 text-red-500 font-bold">No canjeado</span>
                    )}
                </div>
            ))}
        </div>
    );
}