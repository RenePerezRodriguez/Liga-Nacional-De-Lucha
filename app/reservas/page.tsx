"use client";

import { useState, useEffect } from "react";
import { Loader2, Ticket, Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs, query, where, limit, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RingsideBooking } from "@/components/events/ringside-booking";
import { useSiteConfig } from "@/components/config-provider";

interface SidePricing {
    alias: string;
    rowA: number;
    rowB: number;
    rowC: number;
}

interface EventData extends DocumentData {
    id: string;
    title: string;
    date: string;
    time: string;
    venueName?: string;
    prices?: { name: string; price: number }[];
    seatingData?: {
        enabled: boolean;
        seats: Record<string, "available" | "selected" | "reserved" | "sold" | "blocked">;
    };
    ringsidePrices?: {
        north: SidePricing;
        south: SidePricing;
        west: SidePricing;
    };
}

export default function ReservationsPage() {
    const [event, setEvent] = useState<EventData | null>(null);
    const [loading, setLoading] = useState(true);
    const config = useSiteConfig();

    useEffect(() => {
        async function fetchFeaturedEvent() {
            try {
                const featuredQuery = query(
                    collection(db, "eventos"),
                    where("isFeatured", "==", true),
                    limit(1)
                );
                const snap = await getDocs(featuredQuery);
                if (!snap.empty) {
                    const doc = snap.docs[0];
                    setEvent({ id: doc.id, ...doc.data() } as unknown as EventData);
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFeaturedEvent();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-lnl-red animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20">

            {/* Header */}
            <section className="relative h-[30vh] md:h-[40vh] flex items-center justify-center overflow-hidden mb-8">
                <Image
                    src="/images/hero/hero-bg.png"
                    alt="LNL Arena Booking"
                    fill
                    className="object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
                <div className="relative z-10 text-center px-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lnl-red/20 text-lnl-red text-xs md:text-sm font-bold uppercase tracking-widest mb-4">
                        <Ticket className="w-4 h-4" />
                        <span>Taquilla Virtual</span>
                    </div>
                    <h1 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 text-shadow-lg">
                        {event ? event.title : "Próximo Evento"}
                    </h1>
                    {event && (
                        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-gray-300 text-sm md:text-base">
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-lnl-gold" />
                                {event.date} • {event.time}
                            </span>
                            {event.venueName && (
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-lnl-gold" />
                                    {event.venueName}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {event ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="bg-zinc-950 p-4 md:p-6 border-b border-zinc-800">
                            <h2 className="text-lg md:text-xl font-black text-white uppercase italic flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-lnl-gold" />
                                Reserva tu Ringside
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Selecciona tus asientos en el mapa y confirma por WhatsApp.
                            </p>
                        </div>

                        <RingsideBooking
                            eventId={event.id}
                            eventTitle={event.title}
                            seatingData={event.seatingData}
                            ringsidePrices={event.ringsidePrices}
                            whatsappNumber={config.whatsappVentas}
                        />
                    </div>
                ) : (
                    <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                        <Ticket className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">No hay eventos destacados</h3>
                        <p className="text-gray-400 mb-6">Actualmente no tenemos un evento principal activo para venta online.</p>
                        <Link
                            href="/eventos"
                            className="inline-flex px-6 py-3 bg-lnl-red text-white font-bold uppercase tracking-widest rounded hover:bg-red-700 transition-colors"
                        >
                            Ver Calendario Completo
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
