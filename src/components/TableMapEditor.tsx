'use client';

import { useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Image from 'next/image';
import { Save } from 'lucide-react';
import type { Table } from '@/types/table.types';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import type { DropTargetMonitor } from 'react-dnd';

// --- TIPOS ---
interface DragItem { id: string; }

// --- SUB-COMPONENTE DRAGGABLETABLE ---
const DraggableTable = ({ table, onClick }: { table: Table; onClick: () => void; }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'table',
        item: { id: table.id },
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }));
    drag(ref);

    const statusClasses = {
        available: 'border-green-500 bg-green-500/20 hover:bg-green-500/40',
        reserved: 'border-red-500 bg-red-500/20 cursor-not-allowed',
        occupied: 'border-amber-500 bg-amber-500/20 cursor-pointer',
        unavailable: 'border-zinc-600 bg-zinc-800/50 cursor-pointer',
    };

    return (
        <button
            onClick={onClick}
            ref={ref}
            className={`absolute p-2 border-2 rounded-lg flex flex-col items-center justify-center transition-all text-center ${statusClasses[table.status]}`}
            style={{
                left: `calc(${table.positionX || 50}% - 30px)`,
                top: `calc(${table.positionY || 50}% - 30px)`,
                opacity: isDragging ? 0.5 : 1,
                width: '60px',
                height: '60px'
            }}
            title={`${table.category.name} ${table.tableNumber}`}
        >
            <span className="font-bold text-lg text-white">{table.tableNumber}</span>
            <span className="text-xs text-zinc-400 leading-tight">{table.category.name}</span>
        </button>
    );
};

// --- COMPONENTE PRINCIPAL DEL EDITOR DE MAPA ---
export function TableMapEditor({ tables, setTables, onTableClick }: { tables: Table[]; setTables: React.Dispatch<React.SetStateAction<Table[]>>; onTableClick: (table: Table) => void; }) {
    const mapRef = useRef<HTMLDivElement>(null);

    const handleTableDrop = (tableId: string, x: number, y: number) => {
        setTables(prevTables =>
            prevTables.map(t =>
                t.id === tableId ? { ...t, positionX: x, positionY: y } : t
            )
        );
    };
    
    const handleSaveChanges = async () => {
        toast.loading('Guardando posiciones...');
        try {
            const updatePromises = tables.map(table =>
                api.patch(`/tables/${table.id}/position`, {
                    positionX: table.positionX,
                    positionY: table.positionY,
                })
            );
            await Promise.all(updatePromises);
            toast.dismiss();
            toast.success('¡Posiciones guardadas con éxito!');
        } catch (error) {
            toast.dismiss();
            toast.error('No se pudieron guardar las posiciones.');
        }
    };

    const [, drop] = useDrop(() => ({
        accept: 'table',
        drop: (item: unknown, monitor) => {
            const map = mapRef.current;
            const draggedItem = item as DragItem;
            if (!map || !draggedItem.id) return;
            const mapRect = map.getBoundingClientRect();
            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;
            const newXPercent = ((clientOffset.x - mapRect.left) / mapRect.width) * 100;
            const newYPercent = ((clientOffset.y - mapRect.top) / mapRect.height) * 100;
            handleTableDrop(draggedItem.id, newXPercent, newYPercent);
        },
    }));
    drop(mapRef);

    return (
        <DndProvider backend={HTML5Backend}>
            <div id="map-container" ref={mapRef} className="relative w-full max-w-lg mx-auto my-8 border-2 border-dashed border-zinc-700 rounded-lg bg-black/20">
                <Image src="/images/tables-map-bg.png" alt="Mapa de mesas" width={512} height={768} className="w-full h-auto opacity-30"/>
                {tables.map(table => (
                    <DraggableTable key={table.id} table={table} onClick={() => onTableClick(table)} />
                ))}
            </div>
            <div className="flex justify-end">
                <button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <Save size={18}/> Guardar Posiciones
                </button>
            </div>
        </DndProvider>
    );
}