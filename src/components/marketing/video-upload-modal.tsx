import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { marketingService } from '@/lib/services/marketing.service';

interface VideoUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaignId: string;
    uploadToken: string;
    onSuccess: () => void;
}

export function VideoUploadModal({ isOpen, onClose, campaignId, uploadToken, onSuccess }: VideoUploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
                toast.error('El archivo es demasiado grande (Máx 50MB)');
                return;
            }
            if (!selectedFile.type.startsWith('video/')) {
                toast.error('Solo se permiten archivos de video');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('campaignId', campaignId);
        formData.append('uploadToken', uploadToken);

        try {
            await marketingService.uploadVideo(formData);
            toast.success('Video subido y anuncio creado exitosamente! 🚀');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Error al subir el video. Intenta nuevamente.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cargar Video para Reel">
            <div className="space-y-4">
                <p className="text-zinc-400 text-sm">
                    Sube tu video vertical (9:16) para crear el anuncio optimizado.
                </p>

                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg hover:bg-zinc-800/50 transition-colors">
                    <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        id="video-upload"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />

                    {!file ? (
                        <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <div className="p-3 bg-zinc-800 rounded-full">
                                <Upload className="w-6 h-6 text-pink-500" />
                            </div>
                            <span className="text-sm font-medium text-white">Click para seleccionar video</span>
                            <span className="text-xs text-zinc-500">MP4, MOV hasta 50MB</span>
                        </label>
                    ) : (
                        <div className="flex items-center justify-between w-full bg-zinc-800 p-3 rounded border border-zinc-700">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="p-2 bg-pink-500/10 rounded">
                                    <Upload className="w-4 h-4 text-pink-500" />
                                </div>
                                <span className="text-sm truncate text-white">{file.name}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setFile(null)} disabled={uploading}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={onClose} disabled={uploading} className="border-zinc-700 hover:bg-zinc-800 text-white">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="bg-pink-600 hover:bg-pink-700 text-white"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Subiendo...
                            </>
                        ) : (
                            'Subir y Crear Anuncio'
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
