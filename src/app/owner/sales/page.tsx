'use client';

// Reutilizamos la misma página que ya creamos para el dashboard del admin.
// Esto evita duplicar código y mantiene la consistencia.
import SalesHistoryPage from "@/app/dashboard/sales/page";

export default function OwnerSalesPage() {
  return <SalesHistoryPage />;
}