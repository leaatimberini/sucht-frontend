// src/components/dashboard-filters.tsx
'use client';

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EventSelectItem {
  id: string;
  title: string;
}

// 1. AÑADIMOS LA NUEVA PROPIEDAD OPCIONAL A LA INTERFAZ
interface DashboardFiltersProps {
  onFilterChange: (filters: { eventId?: string, startDate?: string, endDate?: string }) => void;
  initialEventId?: string | null;
}

// 2. ACEPTAMOS LA NUEVA PROP EN EL COMPONENTE
export function DashboardFilters({ onFilterChange, initialEventId }: DashboardFiltersProps) {
  const [events, setEvents] = useState<EventSelectItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [date, setDate] = useState<DateRange | undefined>();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get<EventSelectItem[]>('/events/select');
        setEvents(res.data);
      } catch (error) {
        console.error("Failed to fetch events for select", error);
      }
    };
    fetchEvents();
  }, []);

  // 3. NUEVO EFECTO PARA ESTABLECER EL VALOR INICIAL
  // Este efecto se ejecuta cuando el initialEventId se carga en la página padre.
  useEffect(() => {
    if (initialEventId) {
      setSelectedEvent(initialEventId);
    }
  }, [initialEventId]);

  const handleApplyFilters = () => {
    onFilterChange({
      eventId: selectedEvent || undefined,
      startDate: date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
      endDate: date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
    });
  };

  const handleClearFilters = () => {
    setSelectedEvent('');
    setDate(undefined);
    onFilterChange({});
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6 flex flex-wrap items-center gap-4">
      <Select value={selectedEvent} onValueChange={setSelectedEvent}>
        <SelectTrigger className="w-full sm:w-[200px] bg-zinc-800 border-zinc-700">
          <SelectValue placeholder="Filtrar por evento" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 text-white border-zinc-700">
          {events.map(event => (
            <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full sm:w-[300px] justify-start text-left font-normal bg-zinc-800 border-zinc-700 hover:bg-zinc-700",
              !date && "text-zinc-400"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                `${format(date.from, "dd/MM/yyyy")} - ${format(date.to, "dd/MM/yyyy")}`
              ) : (
                format(date.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Seleccionar rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <div className="flex items-center gap-2">
        <Button onClick={handleApplyFilters} className="bg-pink-600 hover:bg-pink-700 text-white">
          Aplicar Filtros
        </Button>
        <Button onClick={handleClearFilters} variant="ghost" className="hover:bg-zinc-700 text-zinc-400 p-2">
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}