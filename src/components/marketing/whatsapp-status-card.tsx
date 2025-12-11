'use client';
import { Copy, Check, MessageSquareMore, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export function WhatsappStatusCard() {
    const webhookUrl = "https://api.sucht.com.ar/marketing/whatsapp/webhook"; // Assuming this is the PROD URL

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado al portapapeles");
    };

    return (
        <div className="rounded-xl border border-green-800 bg-green-950/20 shadow p-6">
            <div className="pb-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2 text-green-400">
                        <MessageSquareMore className="w-5 h-5" />
                        WhatsApp Bot
                    </h3>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-green-400 border-green-700 bg-green-900/30">
                        Service Mode (Free)
                    </div>
                </div>
                <p className="text-sm text-green-200/60 mt-1">
                    Responde automáticamente a usuarios que inician chat.
                </p>
            </div>
            <div className="pt-4">
                <div className="space-y-4">
                    <div className="bg-black/40 p-3 rounded-md border border-green-900/50">
                        <p className="text-xs text-muted-foreground mb-1">Webhook URL</p>
                        <div className="flex items-center justify-between">
                            <code className="text-sm text-green-300 truncate mr-2">{webhookUrl}</code>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-green-400 hover:text-green-300 hover:bg-green-900/50" onClick={() => copyToClipboard(webhookUrl)}>
                                <Copy className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        <p>1. Configura este Webhook en Meta Developers.</p>
                        <p>2. Suscríbete al evento `messages`.</p>
                        <p>3. El bot responderá &quot;Hola&quot; con un menú Interactivo.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
