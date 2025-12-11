import { Store, MapPin } from "lucide-react";
import Link from "next/link";

interface PartnerCardProps {
    partner: {
        id: string;
        name: string;
        description?: string;
        logoUrl?: string;
        coverUrl?: string; // Added
        category?: string;
        address?: string;
    };
    onClick?: () => void;
}

export function PartnerCard({ partner, onClick }: PartnerCardProps) {
    return (
        <div
            className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-pink-500/50 transition-all cursor-pointer flex flex-col h-full"
            onClick={onClick}
        >
            <div className="h-32 bg-zinc-950 relative overflow-hidden">
                {/* Cover Image or Default Gradient */}
                {partner.coverUrl ? (
                    <img
                        src={partner.coverUrl}
                        alt="Cover"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    />
                ) : null}

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/50 to-zinc-950"></div>

                <div className="absolute -bottom-6 left-4 w-16 h-16 rounded-xl border-4 border-zinc-900 bg-zinc-800 overflow-hidden shadow-lg z-10">
                    {partner.logoUrl ? (
                        <img src={partner.logoUrl} alt={partner.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                            <Store className="w-8 h-8" />
                        </div>
                    )}
                </div>

                {partner.category && (
                    <span className="absolute top-2 right-2 bg-black/60 backdrop-blur text-xs font-bold px-2 py-1 rounded-full border border-zinc-700 uppercase tracking-wide text-zinc-300">
                        {partner.category}
                    </span>
                )}
            </div>

            <div className="p-4 pt-8 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white group-hover:text-pink-500 transition-colors mb-1">{partner.name}</h3>

                {partner.address && (
                    <p className="text-xs text-zinc-400 flex items-center gap-1 mb-3">
                        <MapPin className="w-3 h-3" /> {partner.address}
                    </p>
                )}

                <p className="text-sm text-zinc-500 line-clamp-2 mb-4 flex-1">{partner.description || 'Sin descripción disponible.'}</p>

                <button className="w-full py-2 bg-zinc-800 hover:bg-pink-600 text-white rounded-lg text-sm font-bold transition-colors mt-auto">
                    Ver Beneficios
                </button>
            </div>
        </div>
    );
}
