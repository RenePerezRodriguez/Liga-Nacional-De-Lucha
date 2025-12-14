"use client";

import { useState } from "react";
import { ArrowRight, Ticket, Users, Shield, Zap } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const SEAT_PRICES = {
    ringside: { name: "Ringside (Primera Fila)", price: 100, color: "bg-lnl-gold", border: "border-lnl-gold" },
    vip: { name: "VIP (Filas 2-3)", price: 70, color: "bg-lnl-red", border: "border-lnl-red" },
    general: { name: "General (Gradería)", price: 40, color: "bg-blue-600", border: "border-blue-600" },
};

export default function ReservationsPage() {
    const [selectedZone, setSelectedZone] = useState<keyof typeof SEAT_PRICES | null>(null);

    const handleReservation = () => {
        if (!selectedZone) return;
        const zoneName = SEAT_PRICES[selectedZone].name;
        const price = SEAT_PRICES[selectedZone].price;
        const message = `Hola, quiero reservar entradas para Guerra del Valle en zona ${zoneName} (Bs. ${price}).`;
        const whatsappLink = `https://wa.me/59170000000?text=${encodeURIComponent(message)}`;
        window.open(whatsappLink, "_blank");
    };

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
                        Guerra del <span className="text-lnl-red">Valle</span>
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
                        {Object.entries(SEAT_PRICES).map(([key, zone]) => (
                            <div
                                key={key}
                                onClick={() => setSelectedZone(key as keyof typeof SEAT_PRICES)}
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
                                    {key === 'ringside' && "Siente el sudor y la acción a centímetros de distancia."}
                                    {key === 'vip' && "Vista privilegiada con comodidad garantizada."}
                                    {key === 'general' && "Vive la fiesta desde la mejor panorámica del coliseo."}
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
                                {selectedZone ? `Bs. ${SEAT_PRICES[selectedZone].price}` : "Bs. 0"}
                            </span>
                        </div>

                        <button
                            onClick={handleReservation}
                            disabled={!selectedZone}
                            className={`w-full py-4 font-black uppercase tracking-widest text-lg rounded transition-all flex items-center justify-center gap-2 ${selectedZone
                                    ? "bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]"
                                    : "bg-zinc-800 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <Image src="/images/icons/whatsapp-white.svg" alt="WA" width={24} height={24} className="opacity-80" />
                                {selectedZone ? "Confirmar por WhatsApp" : "Selecciona una Zona"}
                            </span>
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
