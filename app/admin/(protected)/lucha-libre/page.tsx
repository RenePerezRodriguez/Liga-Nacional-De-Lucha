"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";
import { Users, Trophy, Calendar, BarChart3, Plus, ArrowRight, Loader2, Swords, Crown, Star } from "lucide-react";
import { AutoTour, TourButton } from "@/components/admin/admin-tour";
import { sidebarTour } from "@/lib/tour-definitions";

interface Stats {
    wrestlers: number;
    championships: number;
    events: number;
    upcomingEvents: number;
}

interface TopWrestler {
    id: string;
    name: string;
    nickname?: string;
    image?: string;
    rankingPoints?: number;
}

interface Championship {
    id: string;
    title: string;
    currentChampionId?: string;
    image?: string;
}

interface NextEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    isFeatured?: boolean;
}

export default function LuchaLibreDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({ wrestlers: 0, championships: 0, events: 0, upcomingEvents: 0 });
    const [topWrestlers, setTopWrestlers] = useState<TopWrestler[]>([]);
    const [championships, setChampionships] = useState<Championship[]>([]);
    const [nextEvent, setNextEvent] = useState<NextEvent | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch counts
                const [wrestlersSnap, champsSnap, eventsSnap] = await Promise.all([
                    getDocs(collection(db, "luchadores")),
                    getDocs(collection(db, "campeonatos")),
                    getDocs(collection(db, "eventos"))
                ]);

                const today = new Date().toISOString().split("T")[0];
                const upcomingCount = eventsSnap.docs.filter(d => d.data().date >= today).length;

                setStats({
                    wrestlers: wrestlersSnap.size,
                    championships: champsSnap.size,
                    events: eventsSnap.size,
                    upcomingEvents: upcomingCount
                });

                // Fetch top 5 wrestlers by ranking
                const topQuery = query(
                    collection(db, "luchadores"),
                    orderBy("rankingPoints", "desc"),
                    limit(5)
                );
                const topSnap = await getDocs(topQuery);
                setTopWrestlers(topSnap.docs.map(d => ({ id: d.id, ...d.data() })) as TopWrestler[]);

                // Fetch championships
                const champsQuery = query(collection(db, "campeonatos"), orderBy("title"));
                const champsData = await getDocs(champsQuery);
                setChampionships(champsData.docs.map(d => ({ id: d.id, ...d.data() })) as Championship[]);

                // Fetch next event
                const nextEventQuery = query(
                    collection(db, "eventos"),
                    where("date", ">=", today),
                    orderBy("date"),
                    limit(1)
                );
                const nextSnap = await getDocs(nextEventQuery);
                if (!nextSnap.empty) {
                    setNextEvent({ id: nextSnap.docs[0].id, ...nextSnap.docs[0].data() } as NextEvent);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-lnl-red" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Auto-start tour on first visit */}
            <AutoTour tourId="sidebar" steps={sidebarTour} />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                        <Swords className="w-8 h-8 text-lnl-red" />
                        Lucha Libre
                    </h1>
                    <p className="text-gray-400 text-sm">Gestión de luchadores, campeonatos y eventos</p>
                </div>
                <TourButton tourId="sidebar" steps={sidebarTour} />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/luchadores" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-lnl-gold transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{stats.wrestlers}</p>
                            <p className="text-xs text-gray-500 uppercase font-bold">Luchadores</p>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/campeonatos" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-lnl-gold transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-lnl-gold/20 rounded-lg flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-lnl-gold" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{stats.championships}</p>
                            <p className="text-xs text-gray-500 uppercase font-bold">Campeonatos</p>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/eventos" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-lnl-gold transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-lnl-red/20 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-lnl-red" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{stats.upcomingEvents}</p>
                            <p className="text-xs text-gray-500 uppercase font-bold">Próximos</p>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/ranking" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-lnl-gold transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{stats.wrestlers}</p>
                            <p className="text-xs text-gray-500 uppercase font-bold">En Ranking</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Ranked Wrestlers */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                            <Star className="w-5 h-5 text-lnl-gold" /> Top Luchadores
                        </h2>
                        <Link href="/admin/luchadores/nuevo" className="text-xs bg-zinc-800 text-white px-3 py-1 rounded font-bold uppercase hover:bg-zinc-700 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Nuevo
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {topWrestlers.length > 0 ? topWrestlers.map((wrestler, idx) => (
                            <Link
                                key={wrestler.id}
                                href={`/admin/luchadores/${wrestler.id}`}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                            >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${idx === 0 ? "bg-lnl-gold text-black" : idx === 1 ? "bg-gray-400 text-black" : idx === 2 ? "bg-amber-700 text-white" : "bg-zinc-700 text-gray-400"
                                    }`}>
                                    {idx + 1}
                                </span>
                                <div className="w-10 h-10 relative rounded-full overflow-hidden bg-zinc-700 flex-shrink-0">
                                    {wrestler.image && (
                                        <Image src={wrestler.image} alt={wrestler.name} fill className="object-cover" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white text-sm truncate">{wrestler.name}</p>
                                    {wrestler.nickname && <p className="text-xs text-gray-500 truncate">{wrestler.nickname}</p>}
                                </div>
                                <span className="text-xs text-lnl-gold font-bold">{wrestler.rankingPoints || 0} pts</span>
                            </Link>
                        )) : (
                            <p className="text-gray-500 text-sm text-center py-4">No hay luchadores registrados</p>
                        )}
                    </div>

                    <Link href="/admin/ranking" className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-white font-bold uppercase">
                        Ver Ranking Completo <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {/* Championships */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                            <Crown className="w-5 h-5 text-lnl-gold" /> Campeonatos
                        </h2>
                        <Link href="/admin/campeonatos/nuevo" className="text-xs bg-zinc-800 text-white px-3 py-1 rounded font-bold uppercase hover:bg-zinc-700 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Nuevo
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {championships.length > 0 ? championships.slice(0, 4).map((champ) => (
                            <Link
                                key={champ.id}
                                href={`/admin/campeonatos/${champ.id}`}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                            >
                                <div className="w-12 h-8 relative bg-zinc-700 rounded flex-shrink-0 flex items-center justify-center">
                                    {champ.image ? (
                                        <Image src={champ.image} alt={champ.title} fill className="object-contain p-1" />
                                    ) : (
                                        <Trophy className="w-4 h-4 text-lnl-gold" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white text-sm truncate">{champ.title}</p>
                                    <p className="text-xs text-gray-500">
                                        {champ.currentChampionId ? "Con campeón" : "Vacante"}
                                    </p>
                                </div>
                            </Link>
                        )) : (
                            <p className="text-gray-500 text-sm text-center py-4">No hay campeonatos registrados</p>
                        )}
                    </div>

                    <Link href="/admin/campeonatos" className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-white font-bold uppercase">
                        Ver Todos <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            {/* Next Event Banner */}
            {nextEvent && (
                <div className="bg-gradient-to-r from-lnl-red/20 to-transparent border border-lnl-red/30 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-lnl-red font-bold uppercase tracking-widest mb-1">Próximo Evento</p>
                            <h3 className="text-xl font-black text-white uppercase">{nextEvent.title}</h3>
                            <p className="text-gray-400 text-sm">{nextEvent.date} • {nextEvent.time}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href={`/admin/eventos/${nextEvent.id}`}
                                className="bg-zinc-800 text-white px-4 py-2 rounded font-bold uppercase text-xs hover:bg-zinc-700"
                            >
                                Editar
                            </Link>
                            <Link
                                href={`/admin/eventos/${nextEvent.id}/resultados`}
                                className="bg-lnl-gold text-black px-4 py-2 rounded font-bold uppercase text-xs hover:bg-yellow-500 flex items-center gap-1"
                            >
                                <Trophy className="w-3 h-3" /> Resultados
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/admin/luchadores/nuevo" className="bg-zinc-800 hover:bg-zinc-700 text-center p-4 rounded-xl transition-colors">
                    <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <span className="text-xs font-bold text-gray-300 uppercase">Nuevo Luchador</span>
                </Link>
                <Link href="/admin/campeonatos/nuevo" className="bg-zinc-800 hover:bg-zinc-700 text-center p-4 rounded-xl transition-colors">
                    <Trophy className="w-6 h-6 text-lnl-gold mx-auto mb-2" />
                    <span className="text-xs font-bold text-gray-300 uppercase">Nuevo Título</span>
                </Link>
                <Link href="/admin/eventos/nuevo" className="bg-zinc-800 hover:bg-zinc-700 text-center p-4 rounded-xl transition-colors">
                    <Calendar className="w-6 h-6 text-lnl-red mx-auto mb-2" />
                    <span className="text-xs font-bold text-gray-300 uppercase">Nuevo Evento</span>
                </Link>
                <Link href="/admin/ranking" className="bg-zinc-800 hover:bg-zinc-700 text-center p-4 rounded-xl transition-colors">
                    <BarChart3 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <span className="text-xs font-bold text-gray-300 uppercase">Ver Rankings</span>
                </Link>
            </div>
        </div>
    );
}
