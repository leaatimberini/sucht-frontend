import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { PartnerApplicationModal } from './PartnerApplicationModal';
import { useAuthStore } from '@/stores/auth-store';
import { UserRole } from '@/types/user.types';

export function PartnerPromoBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const authUser = useAuthStore(state => state.user);

    useEffect(() => {
        // Check local storage
        const dismissed = localStorage.getItem('hide_partner_promo_v1');

        // Check if already partner or admin
        const isPartner = authUser?.roles?.includes(UserRole.PARTNER) || authUser?.roles?.includes(UserRole.ADMIN) || authUser?.roles?.includes(UserRole.OWNER);

        if (!dismissed && !isPartner) {
            setIsVisible(true);
        }
    }, [authUser]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('hide_partner_promo_v1', 'true');
    };

    const handleInterest = () => {
        setIsModalOpen(true);
        // We do NOT dismiss it permanently yet? Or yes? User said "solo se muestra una vez"
        // If they click "Me interesa", they fill form. If they cancel form, maybe show again later?
        // But the requirement says "only shows once".
        // Let's dismiss it when they click "Cerrar". If they click Me Interesa, we assume they are taking action.
        // We can hide banner immediately after clicking "Me interesa" to keep UI clean, or persist.
    };

    const handleApplicationSuccess = () => {
        setIsModalOpen(false);
        handleDismiss(); // Hide banner after successful application
    };

    if (!isVisible) {
        // Still render modal if open
        return <PartnerApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />;
    }

    return (
        <>
            <div className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-500/20 rounded-xl p-4 md:p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                    <button onClick={handleDismiss} className="text-zinc-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="bg-pink-500/20 p-4 rounded-full">
                        <Sparkles className="w-8 h-8 text-pink-400" />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-bold text-white mb-2">Nuevo: Club de Beneficios</h3>
                        <p className="text-zinc-300">
                            ¿Querés ser parte de nuestros partners? Registra tu Negocio o emprendimiento,
                            y ofrece descuentos exclusivos a nuestra comunidad.
                        </p>
                    </div>

                    <div className="flex gap-3 mt-4 md:mt-0">
                        <button onClick={handleDismiss} className="px-4 py-2 text-zinc-400 hover:text-white font-medium text-sm">
                            Cerrar
                        </button>
                        <button
                            onClick={handleInterest}
                            className="bg-white text-black hover:bg-zinc-200 px-6 py-2 rounded-full font-bold shadow-lg shadow-white/10 transition-all transform hover:scale-105"
                        >
                            Me interesa
                        </button>
                    </div>
                </div>
            </div>

            <PartnerApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
