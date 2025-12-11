import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/axios';
import { Loader2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

interface PartnerApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PartnerApplicationModal({ isOpen, onClose }: PartnerApplicationModalProps) {
    const { register, handleSubmit, reset } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            api.get('/partners/categories')
                .then(res => setCategories(res.data))
                .catch(err => console.error("Failed to fetch categories", err));
        }
    }, [isOpen]);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description);
            if (data.category) formData.append('category', data.category);
            if (data.instagramUrl) formData.append('instagramUrl', data.instagramUrl);
            if (data.websiteUrl) formData.append('websiteUrl', data.websiteUrl);
            if (data.address) formData.append('address', data.address);
            if (data.whatsapp) formData.append('whatsapp', data.whatsapp);

            if (data.logo && data.logo[0]) formData.append('logo', data.logo[0]);
            if (data.cover && data.cover[0]) formData.append('cover', data.cover[0]);

            await api.post('/partners/apply', formData);

            toast.success('¡Solicitud enviada! Nos pondremos en contacto contigo.');
            reset();
            onClose();
            // Permanently hide the banner maybe? Or just close modal.
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error al enviar solicitud. Es posible que ya tengas una solicitud en curso.';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Solicitud de Partner">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-white">
                <p className="text-sm text-zinc-400">
                    Completa los datos de tu negocio para unirte al Club de Beneficios.
                    Tu solicitud quedará pendiente de aprobación.
                </p>

                <div>
                    <label className="block text-sm font-medium mb-1">Nombre del Negocio/Emprendimiento</label>
                    <input {...register('name', { required: true })} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" placeholder="Ej: Burger King" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Rubro / Categoría</label>
                    <input
                        list="categories-list"
                        {...register('category', { required: true })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white"
                        placeholder="Ej: Gastronomía, Indumentaria..."
                    />
                    <datalist id="categories-list">
                        {categories.map((c) => (
                            <option key={c} value={c} />
                        ))}
                    </datalist>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Descripción Breve</label>
                    <textarea {...register('description', { required: true })} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" placeholder="¿Qué ofrecen?" rows={3} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Instagram (Link Completo)</label>
                        <input {...register('instagramUrl')} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" placeholder="https://instagram.com/..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">WhatsApp (Número Completo)</label>
                        <input {...register('whatsapp')} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" placeholder="+549..." />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Dirección (Opcional)</label>
                    <input {...register('address')} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" placeholder="Calle 123, Ciudad" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Logo (Cuadrado)</label>
                        <input type="file" accept="image/*" {...register('logo')} className="text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-zinc-800 file:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Portada (Horizontal)</label>
                        <input type="file" accept="image/*" {...register('cover')} className="text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-zinc-800 file:text-white" />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancelar</button>
                    <button type="submit" disabled={isLoading} className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2">
                        {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
                        {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
