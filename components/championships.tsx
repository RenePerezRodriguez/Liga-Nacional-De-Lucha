import Image from "next/image";
import Link from "next/link";
import { Trophy, Crown } from "lucide-react";
import { collection, getDocs, query, orderBy, doc, getDoc, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Championship extends DocumentData {
    id: string;
    title: string;
    slug?: string;
    currentChampionId?: string;
    currentDefenses?: number;
    image?: string;
    wonAt?: { toDate: () => Date };
}

interface Wrestler {
    id: string;
    name: string;
    nickname?: string;
    image?: string;
}

async function getChampionships() {
    const q = query(collection(db, "campeonatos"), orderBy("title"));
    const snapshot = await getDocs(q);
    const championships = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Championship[];

    // Fetch current champions
    const championsMap = new Map<string, Wrestler>();
    for (const champ of championships) {
        if (champ.currentChampionId) {
            const wrestlerDoc = await getDoc(doc(db, "luchadores", champ.currentChampionId));
            if (wrestlerDoc.exists()) {
                championsMap.set(champ.currentChampionId, { id: wrestlerDoc.id, ...wrestlerDoc.data() } as Wrestler);
            }
        }
    }

    return { championships: championships.filter(c => c.currentChampionId), championsMap };
}

function calculateReignDays(wonAt?: { toDate: () => Date }): number {
    if (!wonAt) return 0;
    const now = new Date();
    return Math.floor((now.getTime() - wonAt.toDate().getTime()) / (1000 * 60 * 60 * 24));
}

export async function ChampionshipsSection() {
    const { championships, championsMap } = await getChampionships();

    // Only show top 2 championships with current champions
    const topChampionships = championships.slice(0, 2);

    return (
        <section className="bg-gradient-to-b from-zinc-900 to-black py-10 md:py-16 border-t border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="mb-12">
                    <span className="text-lnl-gold font-bold uppercase tracking-widest text-sm block mb-2">Prestigio & Honor</span>
                    <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-white">Campeones Actuales</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 max-w-4xl mx-auto">
                    {topChampionships.length > 0 ? (
                        topChampionships.map((champ, idx) => {
                            const champion = champ.currentChampionId ? championsMap.get(champ.currentChampionId) : null;
                            const reignDays = calculateReignDays(champ.wonAt);

                            return (
                                <Link
                                    key={champ.id}
                                    href={`/campeonatos/${champ.slug || champ.id}`}
                                    className={`bg-zinc-800/50 p-6 md:p-8 rounded-xl border-2 ${idx === 0 ? 'border-lnl-gold' : 'border-zinc-500'} relative overflow-hidden group hover:border-lnl-gold transition-colors`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0" />

                                    {/* Title Belt Image */}
                                    <div className="relative z-10 w-48 h-32 mx-auto bg-black/50 mb-6 flex items-center justify-center rounded-lg border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                                        {champ.image ? (
                                            <Image src={champ.image} alt={champ.title} fill className="object-contain p-2" />
                                        ) : (
                                            <Trophy className={`w-16 h-16 ${idx === 0 ? 'text-yellow-500' : 'text-zinc-400'}`} />
                                        )}
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className="text-xl font-bold text-white uppercase tracking-wide mb-4">{champ.title}</h3>

                                        {champion ? (
                                            <div className="flex flex-col items-center">
                                                {/* Champion Photo */}
                                                <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-lnl-gold mb-3 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                                                    {champion.image ? (
                                                        <Image src={champion.image} alt={champion.name} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                                                            <Crown className="w-8 h-8 text-lnl-gold" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-2xl font-black text-lnl-red italic">{champion.name}</p>
                                                {champion.nickname && (
                                                    <p className="text-sm text-gray-500 italic">&quot;{champion.nickname}&quot;</p>
                                                )}
                                                <div className="flex gap-4 mt-3 text-xs text-gray-400">
                                                    <span>{reignDays} días</span>
                                                    <span>•</span>
                                                    <span>{champ.currentDefenses || 0} defensa(s)</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">Título Vacante</p>
                                        )}
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="col-span-2 text-gray-500">No hay campeonatos con campeones activos.</div>
                    )}
                </div>

                {/* View All Link */}
                {championships.length > 2 && (
                    <div className="mt-8">
                        <Link
                            href="/campeonatos"
                            className="inline-flex items-center gap-2 text-lnl-gold hover:text-white font-bold uppercase tracking-widest text-sm transition-colors"
                        >
                            <Trophy className="w-4 h-4" />
                            Ver Todos los Campeonatos
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
