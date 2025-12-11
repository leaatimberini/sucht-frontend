'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { marketingService } from '@/lib/services/marketing.service';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Rocket } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Event {
    id: string;
    title: string;
    startDate: string;
}

export function QuickPromoteModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);

    // Form State
    const [selectedEvent, setSelectedEvent] = useState<string>("");
    const [budget, setBudget] = useState<string>("5000");
    const [platform, setPlatform] = useState<string>("IG");
    const [endDate, setEndDate] = useState<string>("");

    const [currency, setCurrency] = useState<string>("ARS");

    useEffect(() => {
        if (open) {
            fetchEvents();
            fetchCurrency();
        }
    }, [open]);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events/select');
            setEvents(res.data);
        } catch (error) {
            console.error("Failed to fetch events", error);
            try {
                const res = await api.get('/events');
                setEvents(res.data);
            } catch (e) {
                toast.error("No se pudieron cargar los eventos");
            }
        }
    };

    const fetchCurrency = async () => {
        try {
            const accounts = await marketingService.getAccounts();
            if (accounts && accounts.length > 0) {
                setCurrency(accounts[0].currency || "ARS");
            }
        } catch (e) {
            console.error("Failed to fetch currency");
        }
    };

    const handlePromote = async () => {
        if (!selectedEvent) {
            toast.error("Selecciona un evento");
            return;
        }

        if (!endDate) {
            toast.error("Selecciona una fecha de finalización");
            return;
        }

        setLoading(true);
        try {
            await marketingService.quickCreateCampaign(selectedEvent, Number(budget), platform, endDate);
            toast.success("Campaña creada con éxito");
            setOpen(false);
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || "Error al crear la campaña";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold shadow-lg transform hover:scale-105 transition-all w-full md:w-auto"
            >
                <Rocket className="w-4 h-4 mr-2" />
                Promocionar Evento
            </Button>

            <Modal isOpen={open} onClose={() => setOpen(false)} title="Quick Boost">
                <div className="grid gap-4 py-4 text-white">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Evento a Promocionar
                        </label>
                        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                            <SelectTrigger className="bg-[#2a2a2a] border-[#444] text-white">
                                <SelectValue placeholder="Selecciona un evento..." />
                            </SelectTrigger>
                            <SelectContent className="bg-[#2a2a2a] border-[#444] text-white">
                                {events.map(event => (
                                    <SelectItem key={event.id} value={event.id}>
                                        {event.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>



                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">
                            Fecha de Finalización
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="bg-[#2a2a2a] border border-[#444] text-white rounded-md h-9 px-3 py-1"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">
                            Presupuesto Total ({currency})
                        </label>
                        <input
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="bg-[#2a2a2a] border border-[#444] text-white rounded-md h-9 px-3 py-1"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">
                            Plataforma
                        </label>
                        <Select value={platform} onValueChange={setPlatform}>
                            <SelectTrigger className="bg-[#2a2a2a] border-[#444] text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#2a2a2a] border-[#444] text-white">
                                <SelectItem value="IG">Instagram + Facebook</SelectItem>
                                <SelectItem value="FB">Solo Facebook</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-md text-sm text-blue-200 mt-2">
                        <p className="font-semibold">Info:</p>
                        <ul className="list-disc list-inside">
                            <li>Se usará la imagen del flyer.</li>
                            <li>La IA generará el texto del anuncio.</li>
                            <li>La campaña se creará en estado PAUSADO.</li>
                        </ul>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setOpen(false)} className="border-[#444] text-gray-300 hover:bg-[#333] hover:text-white">
                            Cancelar
                        </Button>
                        <Button onClick={handlePromote} disabled={loading || !selectedEvent || !endDate} className="bg-pink-600 hover:bg-pink-700 text-white">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Rocket className="w-4 h-4 mr-2" />}
                            Lanzar Campaña
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
