// src/app/mi-cuenta/components/MisProductosTab.tsx
'use client';

import QRCode from 'react-qr-code';
import { ProductPurchase } from '@/types/product-purchase.types';

interface MisProductosTabProps {
  productPurchases: ProductPurchase[];
}

export function MisProductosTab({ productPurchases }: MisProductosTabProps) {
  if (productPurchases.length === 0) {
    return (
      <div className="text-center py-10 text-white">
        No tienes productos comprados aún.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {productPurchases.map((purchase) => (
        <div key={purchase.id} className="bg-zinc-900 rounded-lg p-6 flex flex-col items-center shadow-lg">
          <h2 className="text-xl font-bold mb-2 text-white">{purchase.product.name}</h2>
          <p className="text-zinc-400 mb-4">{purchase.event.title}</p>
          <div className="bg-white p-4 rounded-md mb-4">
            <QRCode value={purchase.id} size={150} />
          </div>
          <p className="text-sm text-zinc-500">
            Comprado el: {new Date(purchase.createdAt).toLocaleDateString()}
          </p>
          {purchase.redeemedAt ? (
            <span className="mt-2 text-green-500 font-bold">Canjeado</span>
          ) : (
            <span className="mt-2 text-pink-500 font-bold">No canjeado</span>
          )}
        </div>
      ))}
    </div>
  );
}