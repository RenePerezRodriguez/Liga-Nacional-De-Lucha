"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Ticket, Shield, Zap, Loader2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSiteConfig } from "@/components/config-provider";

interface FeaturedEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    whatsappLink?: string;
    prices?: {
        name: string;
        price: number;
        description?: string;
    }[];
}

const DEFAULT_PRICES = {
    ringside: { name: "Ringside (Primera Fila)", price: 100, color: "bg-lnl-gold", border: "border-lnl-gold", description: "Siente el sudor y la acción a centímetros de distancia." },
    vip: { name: "VIP (Filas 2-3)", price: 70, color: "bg-lnl-red", border: "border-lnl-red", description: "Vista privilegiada con comodidad garantizada." },
    general: { name: "General (Gradería)", price: 40, color: "bg-blue-600", border: "border-blue-600", description: "Vive la fiesta desde la mejor panorámica del coliseo." },
};

// WhatsApp SVG Icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

export default function ReservationsPage() {
    const [selectedZone, setSelectedZone] = useState<keyof typeof DEFAULT_PRICES | null>(null);
    const [event, setEvent] = useState<FeaturedEvent | null>(null);
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
                    setEvent({ id: doc.id, ...doc.data() } as FeaturedEvent);
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFeaturedEvent();
    }, []);

    const handleReservation = () => {
        if (!selectedZone) return;
        const zoneName = DEFAULT_PRICES[selectedZone].name;
        const price = DEFAULT_PRICES[selectedZone].price;
        const eventTitle = event?.title || "el próximo evento";
        const message = `Hola, quiero reservar entradas para *${eventTitle}* en zona ${zoneName} (Bs. ${price}).`;

        // Use event's whatsappLink or config number
        const phoneNumber = event?.whatsappLink?.replace(/\D/g, '') || config.whatsappVentas;
        const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappLink, "_blank");
    };

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
            <section className="relative h-[40vh] flex items-center justify-center overflow-hidden mb-12">
                <Image
                    src="/images/hero/hero-bg.png"
                    alt="LNL Arena Booking"
                    fill
                    className="object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
                <div className="relative z-10 text-center px-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lnl-red/20 text-lnl-red text-sm font-bold uppercase tracking-widest mb-4">
                        <Ticket className="w-4 h-4" />
                        <span>Venta de Entradas</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 text-shadow-lg">
                        {event ? (
                            <>
                                {event.title.split(":")[0]} <span className="text-lnl-red">{event.title.split(":")[1] || ""}</span>
                            </>
                        ) : (
                            <>Próximo <span className="text-lnl-red">Evento</span></>
                        )}
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Asegura tu lugar en el evento más explosivo del año.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Visual Map (Simulated) */}
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-lnl-red" /> Mapa de Asientos
                    </h2>

                    <div className="relative aspect-square w-full bg-zinc-900/50 rounded-xl border-2 border-zinc-800 p-8 flex flex-col items-center justify-center shadow-2xl overflow-hidden group">

                        {/* Ring */}
                        <div className="w-48 h-48 bg-zinc-950 border-4 border-lnl-red shadow-[0_0_50px_rgba(220,38,38,0.2)] flex items-center justify-center mb-12 relative rotate-45 transform group-hover:scale-105 transition-transform duration-500">
                            <div className="absolute inset-0 border border-white/10 m-1"></div>
                            <span className="transform -rotate-45 font-black text-2xl text-white/20 tracking-widest">RING</span>
                        </div>

                        {/* Zones */}
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Ringside Area */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] border-2 border-dashed border-lnl-gold/30 rounded-full animate-pulse-slow"></div>
                            <div className="absolute top-4 left-4 text-xs font-bold text-lnl-gold uppercase tracking-widest">Ringside</div>

                            {/* VIP Area */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] border-2 border-dashed border-lnl-red/30 rounded-full"></div>
                            <div className="absolute bottom-4 right-4 text-xs font-bold text-lnl-red uppercase tracking-widest">VIP</div>

                            {/* General */}
                            <div className="absolute top-2 right-2 text-xs font-bold text-blue-500 uppercase tracking-widest">General</div>
                        </div>

                        {/* Disclaimer */}
                        <div className="absolute bottom-4 left-0 w-full text-center text-xs text-gray-500 px-4">
                            * Mapa referencial. La distribución exacta puede variar.
                        </div>
                    </div>
                </div>

                {/* Selection Panel */}
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-lnl-gold" /> Elige tu Zona
                    </h2>

                    <div className="space-y-4 mb-8">
                        {Object.entries(DEFAULT_PRICES).map(([key, zone]) => (
                            <div
                                key={key}
                                onClick={() => setSelectedZone(key as keyof typeof DEFAULT_PRICES)}
                                className={`cursor-pointer p-6 rounded-xl border-2 transition-all relative overflow-hidden group ${selectedZone === key
                                    ? `${zone.border} bg-white/5 shadow-[0_0_20px_rgba(0,0,0,0.5)]`
                                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600"
                                    }`}
                            >
                                <div className={`absolute top-0 right-0 p-2 ${zone.color} text-black font-black text-xs uppercase tracking-widest rounded-bl-xl z-10`}>
                                    Bs. {zone.price}
                                </div>

                                <h3 className="text-xl font-bold uppercase italic tracking-tight mb-1 group-hover:text-white transition-colors">
                                    {zone.name}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {zone.description}
                                </p>

                                {selectedZone === key && (
                                    <motion.div layoutId="selection-chk" className="absolute bottom-4 right-4 text-green-500">
                                        <div className="bg-green-500 text-black rounded-full p-1">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-400 text-sm uppercase tracking-widest">Total Estimado</span>
                            <span className="text-3xl font-black text-white">
                                {selectedZone ? `Bs. ${DEFAULT_PRICES[selectedZone].price}` : "Bs. 0"}
                            </span>
                        </div>

                        <button
                            onClick={handleReservation}
                            disabled={!selectedZone}
                            className={`w-full py-4 font-black uppercase tracking-widest text-lg rounded transition-all flex items-center justify-center gap-3 ${selectedZone
                                ? "bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]"
                                : "bg-zinc-800 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            <WhatsAppIcon className="w-6 h-6" />
                            {selectedZone ? "Confirmar por WhatsApp" : "Selecciona una Zona"}
                        </button>
                        <p className="text-center text-xs text-gray-500 mt-4">
                            Serás redirigido a WhatsApp para completar tu compra con nuestro equipo de ventas.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

