import { notFound } from "next/navigation";
import { getDoc, doc, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Clock, ArrowLeft, Ticket } from "lucide-react";
import { RingsideBooking } from "../../../components/events/ringside-booking";

// Define Event Interface
interface EventData extends DocumentData {
    title: string;
    date: string;
    time: string;
    venueName: string;
    description: string;
    image?: string;
    prices?: { name: string; price: number }[];
    seatingData?: {
        enabled: boolean;
        prices: {
            north: { [row: string]: number };
            south: { [row: string]: number };
            west: { [row: string]: number };
        };
        seats: Record<string, "available" | "selected" | "reserved" | "sold" | "blocked">;
    };
}

// Helper to fetch event
async function getEvent(id: string) {
    try {
        const docRef = doc(db, "eventos", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as unknown as EventData;
        }
    } catch (e) {
        console.error("Error fetching event:", e);
    }
    return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const event = await getEvent(id);
    if (!event) return { title: "Evento no encontrado" };
    return {
        title: `${event.title} | Entradas LNL`,
        description: `Compra tus entradas para ${event.title}. ${event.date} en ${event.venueName}.`,
    };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) return notFound();

    return (
        <div className="min-h-screen bg-zinc-950 pb-20">
            {/* Hero Banner */}
            <div className="relative h-[50vh] w-full overflow-hidden">
                {event.image ? (
                    <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover opacity-50 blur-sm"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 mt-10">
                    <span className="inline-block px-3 py-1 bg-lnl-red text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4">
                        Próximo Evento
                    </span>
                    <h1 className="text-4xl md:text-7xl font-black text-white max-w-4xl uppercase italic leading-none mb-6 drop-shadow-lg">
                        {event.title}
                    </h1>
                    <div className="flex flex-wrap justify-center gap-6 text-gray-300 font-bold uppercase text-sm md:text-base tracking-wider">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-lnl-gold" />
                            {event.date}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-lnl-gold" />
                            {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-lnl-gold" />
                            {event.venueName}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
                <Link href="/eventos" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 uppercase text-xs font-bold tracking-widest transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Volver a Eventos
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Content & Map */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Description */}
                        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-8 rounded-2xl">
                            <h2 className="text-2xl font-black text-white uppercase italic mb-4">Sobre el Evento</h2>
                            <div className="prose prose-invert max-w-none text-gray-300">
                                <p>{event.description || "Prepárate para la mejor acción de la lucha libre boliviana."}</p>
                            </div>
                        </div>

                        {/* Interactive Seating Map */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-1 overflow-hidden">
                            <div className="bg-zinc-950 p-6 border-b border-zinc-900 flex justify-between items-center">
                                <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-2">
                                    <Ticket className="w-6 h-6 text-lnl-gold" /> Reserva tu Ringside
                                </h2>
                                <div className="hidden md:flex gap-4">
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <div className="w-3 h-3 bg-zinc-800 border border-zinc-600 rounded"></div> Disponible
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <div className="w-3 h-3 bg-lnl-gold rounded"></div> Tu Selección
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <div className="w-3 h-3 bg-red-900/50 rounded"></div> Ocupado
                                    </div>
                                </div>
                            </div>

                            {/* Client Component for Booking Logic */}
                            <RingsideBooking
                                eventId={event.id}
                                eventTitle={event.title}
                                seatingData={event.seatingData}
                                ringsidePrices={event.ringsidePrices}
                            />
                        </div>

                    </div>

                    {/* Right: Event Poster & Quick Info */}
                    <div className="space-y-6">
                        <div className="sticky top-6">
                            <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-2xl mb-6 shadow-2xl">
                                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden">
                                    {event.image ? (
                                        <Image src={event.image} alt={event.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 font-black italic text-4xl">LNL</div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6 rounded-2xl">
                                <h3 className="text-white font-bold uppercase mb-4">Información General</h3>
                                <ul className="space-y-4 text-sm text-gray-400">
                                    <li className="flex justify-between border-b border-zinc-800 pb-2">
                                        <span>Fecha</span>
                                        <span className="text-white font-bold">{event.date}</span>
                                    </li>
                                    <li className="flex justify-between border-b border-zinc-800 pb-2">
                                        <span>Hora</span>
                                        <span className="text-white font-bold">{event.time}</span>
                                    </li>
                                    <li className="flex justify-between border-b border-zinc-800 pb-2">
                                        <span>Lugar</span>
                                        <span className="text-white font-bold text-right">{event.venueName}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
