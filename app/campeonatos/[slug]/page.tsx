import { collection, getDocs, query, orderBy, doc, getDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trophy, Crown, Calendar, ArrowLeft, Shield, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface Championship {
    id: string;
    title: string;
    slug: string;
    image?: string;
    description?: string;
    division: string;
    isActive: boolean;
    currentChampionId?: string;
    currentDefenses?: number;
    wonAt?: { toDate: () => Date };
}

interface Wrestler {
    id: string;
    name: string;
    nickname?: string;
    image?: string;
    slug?: string;
}

interface Reign {
    id: string;
    wrestlerId: string;
    wrestlerName: string;
    wonAt: { toDate: () => Date };
    lostAt: { toDate: () => Date } | null;
    wonAtEventName?: string;
    lostAtEventName?: string;
    wonAgainstName?: string;
    lostToName?: string;
    defenses: number;
    reignNumber: number;
}

async function getChampionshipBySlug(slug: string) {
    const q = query(collection(db, "campeonatos"), where("slug", "==", slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Championship;
}

async function getChampionshipReigns(championshipId: string) {
    const q = query(
        collection(db, "campeonatos", championshipId, "reigns"),
        orderBy("reignNumber", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reign[];
}

async function getWrestler(wrestlerId: string) {
    const docSnap = await getDoc(doc(db, "luchadores", wrestlerId));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Wrestler;
}

function calculateReignDays(wonAt: { toDate: () => Date }, lostAt?: { toDate: () => Date } | null): number {
    const start = wonAt.toDate();
    const end = lostAt ? lostAt.toDate() : new Date();
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(timestamp: { toDate: () => Date }) {
    return timestamp.toDate().toLocaleDateString("es-BO", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const championship = await getChampionshipBySlug(slug);
    if (!championship) {
        return { title: "Campeonato no encontrado" };
    }
    return {
        title: `${championship.title} | Liga Nacional de Lucha`,
        description: championship.description || `Historial del ${championship.title} de la Liga Nacional de Lucha de Bolivia.`
    };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChampionshipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const championship = await getChampionshipBySlug(slug);

    if (!championship) {
        notFound();
    }

    const reigns = await getChampionshipReigns(championship.id);
    const currentChampion = championship.currentChampionId
        ? await getWrestler(championship.currentChampionId)
        : null;

    const reignDays = championship.wonAt ? calculateReignDays(championship.wonAt) : 0;

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <section className="relative py-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-lnl-gold/5 via-transparent to-transparent" />

                <div className="relative z-10 max-w-7xl mx-auto px-4">
                    <Link
                        href="/campeonatos"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase">Todos los Campeonatos</span>
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Belt Image */}
                        <div className="relative aspect-square max-w-md mx-auto lg:mx-0">
                            <div className="absolute inset-0 bg-gradient-radial from-lnl-gold/20 to-transparent rounded-full blur-3xl" />
                            {championship.image ? (
                                <Image
                                    src={championship.image}
                                    alt={championship.title}
                                    fill
                                    className="object-contain z-10 drop-shadow-[0_0_50px_rgba(255,215,0,0.3)]"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Trophy className="w-32 h-32 text-lnl-gold/50" />
                                </div>
                            )}
                        </div>

                        {/* Championship Info */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lnl-gold/20 border border-lnl-gold/30 text-lnl-gold text-xs font-bold uppercase tracking-widest mb-4">
                                <Trophy className="w-3 h-3" />
                                <span>Título Activo</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">
                                {championship.title}
                            </h1>

                            {championship.description && (
                                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                    {championship.description}
                                </p>
                            )}

                            {/* Current Champion Card */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-lnl-gold" />
                                    Campeón Actual
                                </h3>

                                {currentChampion ? (
                                    <div className="flex items-center gap-6">
                                        <Link href={`/luchadores/${currentChampion.slug || currentChampion.id}`}>
                                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-lnl-gold shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                                                {currentChampion.image ? (
                                                    <Image
                                                        src={currentChampion.image}
                                                        alt={currentChampion.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                                                        <Crown className="w-10 h-10 text-lnl-gold" />
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                        <div>
                                            <Link
                                                href={`/luchadores/${currentChampion.slug || currentChampion.id}`}
                                                className="hover:text-lnl-gold transition-colors"
                                            >
                                                <h4 className="text-2xl font-black uppercase italic">{currentChampion.name}</h4>
                                            </Link>
                                            {currentChampion.nickname && (
                                                <p className="text-gray-500 italic">&quot;{currentChampion.nickname}&quot;</p>
                                            )}
                                            <div className="flex gap-6 mt-3">
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-lnl-gold">{reignDays}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase">Días</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-lnl-gold">{championship.currentDefenses || 0}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase">Defensas</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 text-gray-500">
                                        <Shield className="w-16 h-16" />
                                        <div>
                                            <p className="text-xl font-black uppercase">Título Vacante</p>
                                            <p className="text-sm">El próximo campeón será coronado pronto</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reign History */}
            <section className="max-w-7xl mx-auto px-4 py-16">
                <div className="flex items-center gap-3 mb-8">
                    <Calendar className="w-6 h-6 text-lnl-gold" />
                    <h2 className="text-3xl font-black uppercase italic">Historial de Reinados</h2>
                </div>

                {reigns.length === 0 ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-gray-500">
                        <Star className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Aún no hay historial de reinados registrado.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800 text-left">
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">#</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Campeón</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Ganó</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Perdió</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Días</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Defensas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reigns.map((reign) => {
                                    const days = calculateReignDays(reign.wonAt, reign.lostAt);
                                    const isCurrent = !reign.lostAt;

                                    return (
                                        <tr
                                            key={reign.id}
                                            className={`border-b border-zinc-800/50 ${isCurrent ? "bg-lnl-gold/5" : ""}`}
                                        >
                                            <td className="p-4">
                                                <span className={`font-black ${isCurrent ? "text-lnl-gold" : "text-gray-500"}`}>
                                                    {reign.reignNumber}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-bold text-white">{reign.wrestlerName}</p>
                                                {reign.wonAgainstName && (
                                                    <p className="text-xs text-gray-500">vs {reign.wonAgainstName}</p>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <p className="text-gray-300">{formatDate(reign.wonAt)}</p>
                                                {reign.wonAtEventName && (
                                                    <p className="text-xs text-gray-500">{reign.wonAtEventName}</p>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {reign.lostAt ? (
                                                    <>
                                                        <p className="text-gray-300">{formatDate(reign.lostAt)}</p>
                                                        {reign.lostToName && (
                                                            <p className="text-xs text-gray-500">a {reign.lostToName}</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs font-bold uppercase rounded">
                                                        Actual
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="font-bold text-white">{days}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="font-bold text-white">{reign.defenses}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
