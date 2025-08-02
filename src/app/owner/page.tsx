// src/app/owner/page.tsx
'use client';

import DashboardPage from '../dashboard/page';

export default function OwnerDashboardPage() {
  // Por ahora, reutilizamos la página principal del dashboard de métricas.
  // En el futuro, este puede ser un componente totalmente personalizado para el Dueño.
  return <DashboardPage />;
}