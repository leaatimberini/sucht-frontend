
'use client';
import { useState } from 'react';
import { marketingService } from '@/lib/services/marketing.service';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Facebook } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function ConnectAccountModal({ onAccountAdded }: { onAccountAdded?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [platform, setPlatform] = useState("META");
    const [accountId, setAccountId] = useState("");
    const [token, setToken] = useState("");

    const handleSubmit = async () => {
        if (!name || !accountId || !token) {
            toast.error("Completa todos los campos");
            return;
        }

        setLoading(true);
        try {
            await marketingService.createAccount({
                name,
                platform,
                accountId,
                accessToken: token,
                isActive: true
            });
            toast.success("Cuenta conectada con éxito");
            setOpen(false);
            if (onAccountAdded) onAccountAdded();
        } catch (error) {
            console.error(error);
            toast.error("Error al conectar cuenta");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
                <Plus className="w-4 h-4 mr-2" />
                Conectar Cuenta
            </Button>

            <Modal isOpen={open} onClose={() => setOpen(false)} title="Conectar Cuenta Publicitaria">
                <div className="grid gap-4 py-4 text-white">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">Plataforma</label>
                        <Select value={platform} onValueChange={setPlatform}>
                            <SelectTrigger className="bg-[#2a2a2a] border-[#444] text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#2a2a2a] border-[#444] text-white">
                                <SelectItem value="META">Meta Ads (Facebook/Instagram)</SelectItem>
                                <SelectItem value="GOOGLE">Google Ads (Coming Soon)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">Nombre de Referencia</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Instagram Principal"
                            className="bg-[#2a2a2a] border border-[#444] text-white rounded-md h-9 px-3 py-1 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">Ad Account ID</label>
                        <input
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            placeholder="act_123456789"
                            className="bg-[#2a2a2a] border border-[#444] text-white rounded-md h-9 px-3 py-1 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <p className="text-xs text-muted-foreground">ID de la cuenta publicitaria de Meta.</p>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">Access Token (Manual)</label>
                        <input
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            type="password"
                            placeholder="EAAB..."
                            className="bg-[#2a2a2a] border border-[#444] text-white rounded-md h-9 px-3 py-1 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <p className="text-xs text-muted-foreground">Token de larga duración generado en Meta Developers.</p>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setOpen(false)} className="border-[#444] text-gray-300 hover:bg-[#333] hover:text-white">
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Facebook className="w-4 h-4 mr-2" />}
                            Guardar Conexión
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
