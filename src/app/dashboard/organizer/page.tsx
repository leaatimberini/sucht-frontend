// OrganizerDashboardPage Component - src/app/dashboard/organizer/page.tsx
'use client';

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { AuthCheck } from "@/components/auth-check";
import { UserRole } from "@/types/user.types";
import toast from 'react-hot-toast';
import { Crown, CheckCircle, XCircle } from "lucide-react";

// The types remain the same as the Owner's panel
interface InvitationHistoryItem {
    invitedUser: { name: string, email: string };
    event: { title: string };
    ticket: {
        quantity: number;
        redeemedCount: number;
        isVipAccess: boolean;
        status: string;
    };
    // Organizers don't see gifts, but we keep the type for consistency
    gifts: Record<string, number>; 
}

// History component is simplified for Organizers (no gifts column)
function InvitationHistory({ history }: { history: InvitationHistoryItem[] }) {
    if (history.length === 0) {
        return (
            <div className="text-center py-10 bg-zinc-900 border border-zinc-800 rounded-lg">
                <p className="text-zinc-500">Aún no has enviado ninguna invitación.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-700">
              <tr>
                <th className="p-4 text-sm font-semibold text-white">Invitado</th>
                <th className="p-4 text-sm font-semibold text-white">Evento</th>
                <th className="p-4 text-sm font-semibold text-white text-center">Personas</th>
                <th className="p-4 text-sm font-semibold text-white text-center">Ingresaron</th>
                <th className="p-4 text-sm font-semibold text-white text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index} className="border-b border-zinc-800 last:border-b-0">
                  <td className="p-4"><p className="font-semibold text-zinc-200">{item.invitedUser.name}</p><p className="text-sm text-zinc-500">{item.invitedUser.email}</p></td>
                  <td className="p-4 text-zinc-300">{item.event.title}</td>
                  <td className="p-4 text-center font-bold text-white">{item.ticket.quantity} {item.ticket.isVipAccess && <Crown className="inline ml-1 text-blue-400" size={16}/>}</td>
                  <td className="p-4 text-center text-zinc-300">{item.ticket.redeemedCount}</td>
                  <td className="p-4 text-center">
                    {item.ticket.redeemedCount > 0 ? (
                        <span className="flex items-center justify-center gap-2 text-green-400"><CheckCircle size={16} /> Ingresó</span>
                    ) : (
                        <span className="flex items-center justify-center gap-2 text-zinc-400"><XCircle size={16} /> Pendiente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    );
}

// Main page component
export default function OrganizerDashboardPage() {
  const [invitationHistory, setInvitationHistory] = useState<InvitationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            // This endpoint will be created next
            const historyRes = await api.get('/organizer/invitations/my-history');
            setInvitationHistory(historyRes.data);
        } catch (error) {
            toast.error("No se pudo cargar tu historial de invitaciones.");
        } finally {
            setIsLoading(false);
        }
    };
    fetchHistory();
  }, []);

  return (
    <AuthCheck allowedRoles={[UserRole.ORGANIZER]}>
      <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-white">Panel de Organizador</h1>
            <p className="text-zinc-400 mt-1">Gestiona tus invitaciones y revisa el estado de tus invitados.</p>
        </div>
        
        {isLoading ? (
           <p className="text-zinc-400 text-center">Cargando historial...</p>
        ) : (
            <div className="mt-10">
                <h2 className="text-2xl font-bold text-white mb-4">Historial de Invitaciones Enviadas</h2>
                <InvitationHistory history={invitationHistory} />
            </div>
        )}
      </div>
    </AuthCheck>
  );
}