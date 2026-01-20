"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Ticket, Calendar, MapPin, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    venueName?: string;
    image?: string;
    isFeatured?: boolean;
    seatingData?: {
        enabled: boolean;
        seats: Record<string, string>;
    };
}

export default function RingsideAdminPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const q = query(collection(db, "eventos"), orderBy("date", "desc"));
                const snap = await getDocs(q);
                const data = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Event[];
                setEvents(data);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    const getSeatStats = (event: Event) => {
        if (!event.seatingData?.seats) return { sold: 0, reserved: 0, available: 108 };

        const seats = event.seatingData.seats;
        let sold = 0, reserved = 0, blocked = 0;

        Object.values(seats).forEach(status => {
            if (status === "sold") sold++;
            else if (status === "reserved") reserved++;
            else if (status === "blocked") blocked++;
        });

        const total = 108; // 3 sides x 3 rows x 12 seats
        const available = total - sold - reserved - blocked;

        return { sold, reserved, available };
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-lnl-red animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic flex items-center gap-3">
                        <Ticket className="w-7 h-7 text-lnl-gold" />
                        Gestion Ringside
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Administra los asientos numerados de cada evento
                    </p>
                </div>
            </div>

            {/* Events Grid */}
            {events.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                    <Ticket className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No hay eventos</h3>
                    <p className="text-gray-400 mb-6">Crea un evento primero para gestionar sus asientos.</p>
                    <Link
                        href="/admin/eventos/nuevo"
                        className="inline-flex px-6 py-3 bg-lnl-red text-white font-bold uppercase tracking-widest rounded hover:bg-red-700 transition-colors"
                    >
                        Crear Evento
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {events.map(event => {
                        const stats = getSeatStats(event);
                        const isEnabled = event.seatingData?.enabled ?? false;

                        return (
                            <Link
                                key={event.id}
                                href={`/admin/eventos/${event.id}/seats`}
                                className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-lnl-gold/50 transition-all hover:shadow-lg hover:shadow-lnl-gold/10"
                            >
                                {/* Event Image */}
                                <div className="relative h-40 bg-zinc-950">
                                    {event.image ? (
                                        <Image
                                            src={event.image}
                                            alt={event.title}
                                            fill
                                            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Ticket className="w-12 h-12 text-zinc-800" />
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3">
                                        {isEnabled ? (
                                            <span className="px-2 py-1 bg-green-600 text-white text-[10px] font-bold uppercase rounded">
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-zinc-700 text-gray-400 text-[10px] font-bold uppercase rounded">
                                                Inactivo
                                            </span>
                                        )}
                                    </div>

                                    {/* Featured Badge */}
                                    {event.isFeatured && (
                                        <div className="absolute top-3 left-3">
                                            <span className="px-2 py-1 bg-lnl-gold text-black text-[10px] font-bold uppercase rounded">
                                                Destacado
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Event Info */}
                                <div className="p-4 space-y-3">
                                    <h3 className="text-white font-bold text-lg group-hover:text-lnl-gold transition-colors truncate">
                                        {event.title}
                                    </h3>

                                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {event.date}
                                        </span>
                                        {event.venueName && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {event.venueName}
                                            </span>
                                        )}
                                    </div>

                                    {/* Seat Stats */}
                                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                                        <div className="flex gap-4 text-xs">
                                            <div className="text-center">
                                                <div className="text-green-500 font-bold">{stats.available}</div>
                                                <div className="text-gray-600">Libres</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-red-500 font-bold">{stats.sold}</div>
                                                <div className="text-gray-600">Vendidos</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-yellow-500 font-bold">{stats.reserved}</div>
                                                <div className="text-gray-600">Reservados</div>
                                            </div>
                                        </div>

                                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-lnl-gold transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
