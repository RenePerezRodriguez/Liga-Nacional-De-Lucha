"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteImageFromStorage } from "@/lib/storage-utils";
import Link from "next/link";
import { Plus, Calendar, Star, Trophy } from "lucide-react";
import Image from "next/image";

interface Event extends DocumentData {
    id: string;
    title: string;
    date: string;
    time: string;
    description: string;
    image?: string;
    isFeatured?: boolean;
    resultsRecorded?: boolean;
    matches?: unknown[];
}

export default function EventsAdminPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "eventos"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Event[];
            setEvents(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (confirm(`¿Eliminar evento: ${title}?`)) {
            try {
                const event = events.find(e => e.id === id);
                if (event?.image) {
                    await deleteImageFromStorage(event.image);
                }
                await deleteDoc(doc(db, "eventos", id));
                alert("Evento eliminado");
            } catch (error) {
                console.error("Error deleting event:", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">Gestión de Eventos</h1>
                    <p className="text-gray-400 text-sm">Carteleras, fechas y venta de entradas.</p>
                </div>
                <Link
                    href="/admin/eventos/nuevo"
                    className="bg-lnl-red text-white px-4 py-2 rounded font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-red-700 transition-colors"
                >
                    <Plus className="w-5 h-5" /> Nuevo Evento
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-gray-500">Cargando eventos...</p>
                ) : events.length === 0 ? (
                    <p className="text-gray-500">No hay eventos registrados.</p>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className={`bg-zinc-900 border rounded-xl overflow-hidden group flex flex-col ${event.isFeatured ? 'border-lnl-gold shadow-lg shadow-yellow-900/10' : 'border-zinc-800'}`}>
                            {event.image ? (
                                <div className="relative aspect-video">
                                    <Image src={event.image} alt={event.title} fill className="object-cover" />
                                    {event.isFeatured && (
                                        <div className="absolute top-2 right-2 bg-lnl-gold text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-black" /> Destacado
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="aspect-video bg-zinc-800 flex items-center justify-center text-gray-600">
                                    <Calendar className="w-10 h-10" />
                                </div>
                            )}

                            <div className="p-4 flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight mb-1">{event.title}</h3>
                                        <p className="text-sm text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date} • {event.time}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-2">{event.description}</p>
                            </div>

                            <div className="p-4 border-t border-zinc-800 bg-black/20 flex justify-end gap-2">
                                {event.matches && event.matches.length > 0 && (() => {
                                    const eventDate = new Date(`${event.date}T${event.time || "00:00"}`);
                                    const now = new Date();
                                    const isEventReady = now >= eventDate;

                                    if (event.resultsRecorded) {
                                        return (
                                            <Link
                                                href={`/admin/eventos/${event.id}/resultados`}
                                                className="text-sm font-bold uppercase px-3 py-1 rounded flex items-center gap-1 text-green-500 bg-green-500/10 hover:bg-green-500/20"
                                            >
                                                <Trophy className="w-3 h-3" /> Ver Resultados
                                            </Link>
                                        );
                                    }

                                    if (isEventReady) {
                                        return (
                                            <Link
                                                href={`/admin/eventos/${event.id}/resultados`}
                                                className="text-sm font-bold uppercase px-3 py-1 rounded flex items-center gap-1 text-lnl-gold bg-lnl-gold/10 hover:bg-lnl-gold/20"
                                            >
                                                <Trophy className="w-3 h-3" /> Registrar
                                            </Link>
                                        );
                                    }

                                    return (
                                        <div className="group/tooltip relative">
                                            <button disabled className="text-sm font-bold uppercase px-3 py-1 rounded flex items-center gap-1 text-gray-500 bg-zinc-800 cursor-not-allowed opacity-50">
                                                <Trophy className="w-3 h-3" /> Registrar
                                            </button>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 text-xs text-white text-center rounded hidden group-hover/tooltip:block z-10 border border-zinc-700">
                                                Habilitado el día del evento
                                            </div>
                                        </div>
                                    );
                                })()}
                                <Link href={`/admin/eventos/${event.id}`} className="text-sm text-gray-300 hover:text-white font-bold uppercase px-3 py-1 bg-zinc-800 rounded">
                                    Editar
                                </Link>
                                <button onClick={() => handleDelete(event.id, event.title)} className="text-sm text-red-500 hover:text-red-400 font-bold uppercase px-3 py-1 bg-zinc-800 rounded">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
