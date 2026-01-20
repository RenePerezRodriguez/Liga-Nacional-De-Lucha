"use client";

import { useState, useEffect, use, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RingsideMap, SeatStatus } from "@/components/events/ringside-map";
import { Loader2, ArrowLeft, Ticket, ToggleLeft, ToggleRight, Check, Cloud, CloudOff } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SeatingData {
    enabled: boolean;
    seats: Record<string, SeatStatus>;
}

const DEFAULT_SEATING_DATA: SeatingData = {
    enabled: true,
    seats: {},
};

const TOOLS: { id: SeatStatus; label: string; color: string }[] = [
    { id: "available", label: "Disponible", color: "bg-zinc-700" },
    { id: "reserved", label: "Reservado", color: "bg-yellow-600" },
    { id: "sold", label: "Vendido", color: "bg-red-600" },
    { id: "blocked", label: "Bloqueado", color: "bg-zinc-900" },
];

export default function EventSeatsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [eventTitle, setEventTitle] = useState("");
    const [seatingData, setSeatingData] = useState<SeatingData>(DEFAULT_SEATING_DATA);
    const [selectedTool, setSelectedTool] = useState<SeatStatus>("sold");

    // Track if there are unsaved changes
    const [hasChanges, setHasChanges] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-save function
    const saveToFirestore = useCallback(async (dataToSave: SeatingData) => {
        setSaving(true);
        try {
            const docRef = doc(db, "eventos", id);
            await updateDoc(docRef, { seatingData: dataToSave });
            setLastSaved(new Date());
            setHasChanges(false);
        } catch (error) {
            console.error("Error auto-saving:", error);
        } finally {
            setSaving(false);
        }
    }, [id]);

    // Debounced auto-save when seatingData changes
    useEffect(() => {
        if (!loading && hasChanges) {
            // Clear existing timeout
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            // Set new timeout (save after 1 second of no changes)
            saveTimeoutRef.current = setTimeout(() => {
                saveToFirestore(seatingData);
            }, 1000);
        }

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [seatingData, hasChanges, loading, saveToFirestore]);

    useEffect(() => {
        async function loadEvent() {
            try {
                const docRef = doc(db, "eventos", id);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    router.push("/admin/eventos");
                    return;
                }

                const data = docSnap.data();
                setEventTitle(data.title || "Evento");

                if (data.seatingData) {
                    setSeatingData({
                        enabled: data.seatingData.enabled ?? true,
                        seats: data.seatingData.seats || {},
                    });
                }
            } catch (error) {
                console.error("Error loading event:", error);
            } finally {
                setLoading(false);
            }
        }
        loadEvent();
    }, [id, router]);

    const handleSeatClick = (seatId: string) => {
        const currentStatus = seatingData.seats[seatId] || "available";
        const newStatus = currentStatus === selectedTool ? "available" : selectedTool;

        setSeatingData(prev => ({
            ...prev,
            seats: {
                ...prev.seats,
                [seatId]: newStatus,
            },
        }));
        setHasChanges(true);
    };

    const handleToggleEnabled = () => {
        setSeatingData(prev => ({ ...prev, enabled: !prev.enabled }));
        setHasChanges(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-lnl-red animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/admin/ringside" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-2">
                        <ArrowLeft className="w-4 h-4" /> Volver a Ringside
                    </Link>
                    <h1 className="text-2xl font-black text-white uppercase italic flex items-center gap-2">
                        <Ticket className="w-6 h-6 text-lnl-gold" />
                        Gestionar Ringside
                    </h1>
                    <p className="text-gray-400 text-sm">{eventTitle}</p>
                </div>

                {/* Auto-save Status Indicator */}
                <div className="flex items-center gap-3">
                    {saving ? (
                        <div className="flex items-center gap-2 text-yellow-500 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Guardando...</span>
                        </div>
                    ) : hasChanges ? (
                        <div className="flex items-center gap-2 text-yellow-500 text-sm">
                            <CloudOff className="w-4 h-4" />
                            <span>Cambios pendientes</span>
                        </div>
                    ) : lastSaved ? (
                        <div className="flex items-center gap-2 text-green-500 text-sm">
                            <Cloud className="w-4 h-4" />
                            <span>Guardado automatico</span>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Enable Toggle */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-bold">Habilitar Venta de Ringside Online</h3>
                        <p className="text-gray-500 text-sm">Si esta desactivado, los usuarios veran un mensaje para contactar por WhatsApp.</p>
                    </div>
                    <button
                        onClick={handleToggleEnabled}
                        className={cn(
                            "p-2 rounded-lg transition-colors",
                            seatingData.enabled ? "bg-green-600 text-white" : "bg-zinc-800 text-gray-400"
                        )}
                    >
                        {seatingData.enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                </div>
            </div>

            {seatingData.enabled && (
                <>
                    {/* Tool Selection */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-white font-bold mb-4">Herramienta de Marcado</h3>
                        <p className="text-gray-500 text-sm mb-4">Selecciona un estado y haz clic en los asientos del mapa. Los cambios se guardan automaticamente.</p>
                        <div className="flex flex-wrap gap-3">
                            {TOOLS.map(tool => (
                                <button
                                    key={tool.id}
                                    onClick={() => setSelectedTool(tool.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all font-bold text-sm uppercase",
                                        selectedTool === tool.id
                                            ? "border-white bg-white/10 text-white"
                                            : "border-zinc-700 text-gray-400 hover:border-zinc-500"
                                    )}
                                >
                                    <div className={cn("w-4 h-4 rounded", tool.color)} />
                                    {tool.label}
                                    {selectedTool === tool.id && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Seating Map */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-zinc-800">
                            <h3 className="text-white font-bold">Mapa de Asientos</h3>
                            <p className="text-gray-500 text-sm">Haz clic en un asiento para aplicar la herramienta seleccionada.</p>
                        </div>
                        <RingsideMap
                            mode="admin"
                            seats={seatingData.seats}
                            onSeatClick={handleSeatClick}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
