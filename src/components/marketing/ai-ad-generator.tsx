
'use client';
import { useState } from 'react';
import { Sparkles, Copy, Check, Image as ImageIcon, Type, Download } from 'lucide-react';
import { marketingService } from '@/lib/services/marketing.service';
import { Button } from "@/components/ui/button";

export function AiAdGenerator() {
    const [mode, setMode] = useState<'text' | 'image'>('text');

    // Text State
    const [description, setDescription] = useState('');
    const [platform, setPlatform] = useState<'IG' | 'FB'>('IG');
    const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);

    // Image State
    const [imagePrompt, setImagePrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerateCopy = async () => {
        if (!description) return;
        setLoading(true);
        setGeneratedOptions([]);
        try {
            const options = await marketingService.generateCopy(description, platform);
            setGeneratedOptions(options);
        } catch (error) {
            console.error('Error generating copy:', error);
            setGeneratedOptions(['Error al generar el anuncio.']);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!imagePrompt) return;
        setLoading(true);
        setGeneratedImage(null);
        try {
            const images = await marketingService.generateImage(imagePrompt);
            if (images && images.length > 0) {
                setGeneratedImage(images[0]);
            }
        } catch (error) {
            console.error('Error generating image:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow h-full flex flex-col">
            <div className="p-6 pb-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    AI Studio
                </h3>
                <p className="text-sm text-muted-foreground">Genera textos e imágenes para tus anuncios.</p>
            </div>

            <div className="p-6 pt-2 flex-1 flex flex-col gap-4">
                {/* Custom Tabs */}
                <div className="flex p-1 bg-muted rounded-lg">
                    <button
                        onClick={() => setMode('text')}
                        className={`flex-1 flex items-center justify-center py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'text' ? 'bg-background text-foreground shadow custom-shadow' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Type className="w-4 h-4 mr-2" /> Copywriting
                    </button>
                    <button
                        onClick={() => setMode('image')}
                        className={`flex-1 flex items-center justify-center py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'image' ? 'bg-background text-foreground shadow custom-shadow' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <ImageIcon className="w-4 h-4 mr-2" /> Imágenes
                    </button>
                </div>

                {/* TEXT TAB */}
                {mode === 'text' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Plataforma</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPlatform('IG')}
                                    className={`flex-1 py-2 text-sm rounded-md border transition-colors ${platform === 'IG' ? 'bg-pink-600/20 border-pink-600 text-pink-400' : 'border-zinc-800 hover:bg-zinc-800'}`}
                                >
                                    Instagram
                                </button>
                                <button
                                    onClick={() => setPlatform('FB')}
                                    className={`flex-1 py-2 text-sm rounded-md border transition-colors ${platform === 'FB' ? 'bg-blue-600/20 border-blue-600 text-blue-400' : 'border-zinc-800 hover:bg-zinc-800'}`}
                                >
                                    Facebook
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sobre el evento</label>
                            <textarea
                                className="w-full min-h-[100px] rounded-md border border-zinc-800 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Ej: Fiesta Halloween, 2x1 tragos..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <Button
                            onClick={handleGenerateCopy}
                            disabled={loading || !description}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            {loading ? <Sparkles className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generar Copy
                        </Button>

                        {generatedOptions.length > 0 && (
                            <div className="mt-4 space-y-3">
                                {generatedOptions.map((option, idx) => (
                                    <div key={idx} className="group relative rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors">
                                        <p className="text-sm whitespace-pre-wrap">{option}</p>
                                        <button
                                            onClick={() => copyToClipboard(option, idx)}
                                            className="absolute top-2 right-2 p-2 rounded-md bg-zinc-800 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                                        >
                                            {copiedIndex === idx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* IMAGE TAB */}
                {mode === 'image' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Describe la imagen</label>
                            <textarea
                                className="w-full min-h-[100px] rounded-md border border-zinc-800 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Ej: Multitud energética bailando bajo luces neón púrpuras, estilo cyberpunk..."
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                            />
                        </div>

                        <Button
                            onClick={handleGenerateImage}
                            disabled={loading || !imagePrompt}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        >
                            {loading ? <Sparkles className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                            Crear Imagen (DALL-E 3)
                        </Button>

                        {generatedImage && (
                            <div className="mt-4 rounded-lg overflow-hidden border border-zinc-800 relative group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={generatedImage} alt="Generated Ad" className="w-full h-auto object-cover" />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <a
                                        href={generatedImage}
                                        target="_blank"
                                        download="ad-creative.png"
                                        className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-md backdrop-blur-sm transition-colors"
                                        title="Abrir Original"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
