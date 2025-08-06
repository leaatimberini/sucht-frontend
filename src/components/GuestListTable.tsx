// frontend/src/components/rrpp/GuestListTable.tsx

'use client';

// 1. Definimos los tipos basados en la respuesta de tu API para mayor seguridad
type Guest = {
  id: string;
  user: {
    name: string;
    email: string;
  };
  event: {
    title: string;
  };
  status: 'valid' | 'redeemed' | 'partially_used' | 'invalidated' | string; // Se añade 'string' por si hay otros estados
  redeemedCount: number;
};

// 2. Creamos un componente separado para el "badge" de estado para mantener el código limpio
const StatusBadge = ({ status }: { status: Guest['status'] }) => {
  // 3. Lógica corregida que interpreta todos los estados posibles
  switch (status) {
    case 'redeemed':
    case 'used':
    case 'partially_used':
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Ingresó</span>;
    case 'invalidated':
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Invalidado</span>;
    case 'valid':
    default:
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>;
  }
};

export function GuestListTable({ guests }: { guests: Guest[] }) {
  if (!guests || guests.length === 0) {
    return <p className="text-zinc-500 text-center py-4">Tu lista de invitados está vacía.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-zinc-700">
        <thead className="bg-zinc-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Invitado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Evento
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Ingresaron
            </th>
          </tr>
        </thead>
        <tbody className="bg-zinc-900 divide-y divide-zinc-700">
          {guests.map((guest) => (
            <tr key={guest.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-white">{guest.user.name}</div>
                <div className="text-sm text-zinc-400">{guest.user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{guest.event.title}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={guest.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-zinc-300">{guest.redeemedCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}