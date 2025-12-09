'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Loader2, QrCode } from 'lucide-react';

interface Redemption {
    id: string;
    code: string;
    status: 'pending' | 'redeemed' | 'expired';
    benefit: {
        title: string;
        partner: {
            name: string;
        }
    }
}

export function MyCoupons() {
    const [coupons, setCoupons] = useState<Redemption[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const { data } = await api.get('/benefits/my-coupons');
                setCoupons(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCoupons();
    }, []);

    if (isLoading) return <div className="py-4 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-zinc-500" /></div>;
    if (coupons.length === 0) return null;

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <QrCode className="text-pink-500" /> Mis Cupones
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {coupons.map((coupon) => (
                    <div key={coupon.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg flex flex-col items-center text-center">
                        <div className="mb-2">
                            <span className="text-xs text-zinc-400 block">{coupon.benefit.partner.name}</span>
                            <h4 className="font-bold text-white">{coupon.benefit.title}</h4>
                        </div>
                        <div className="bg-white text-black text-2xl font-mono font-bold py-2 px-6 rounded tracking-widest mb-2 border-2 border-dashed border-zinc-300">
                            {coupon.code}
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${coupon.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                coupon.status === 'redeemed' ? 'bg-green-500/20 text-green-400' :
                                    'bg-red-500/20 text-red-400'
                            }`}>
                            {coupon.status === 'pending' ? 'LISTO PARA USAR' :
                                coupon.status === 'redeemed' ? 'YA USADO' : 'EXPIRADO'}
                        </span>
                        {coupon.status === 'pending' && <p className="text-[10px] text-zinc-500 mt-2">Muestra este código al local.</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}
