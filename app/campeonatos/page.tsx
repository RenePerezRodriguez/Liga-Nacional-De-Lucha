import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trophy, Crown, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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

    return { championships, championsMap };
}

function calculateReignDays(wonAt?: { toDate: () => Date }): number {
    if (!wonAt) return 0;
    const now = new Date();
    return Math.floor((now.getTime() - wonAt.toDate().getTime()) / (1000 * 60 * 60 * 24));
}

function getDivisionLabel(division: string) {
    switch (division) {
        case "masculino": return "División Masculina";
        case "femenino": return "División Femenina";
        case "parejas": return "División de Parejas";
        default: return division;
    }
}

export const metadata = {
    title: "Campeonatos | Liga Nacional de Lucha",
    description: "Conoce los títulos y campeones actuales de la Liga Nacional de Lucha de Bolivia."
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChampionshipsPage() {
    const { championships, championsMap } = await getChampionships();

    const activeChampionships = championships.filter(c => c.isActive);
    const inactiveChampionships = championships.filter(c => !c.isActive);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Header */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-lnl-gold/10 via-transparent to-transparent" />
                <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lnl-gold/20 border border-lnl-gold/30 text-lnl-gold text-sm font-bold uppercase tracking-widest mb-6">
                        <Trophy className="w-4 h-4" />
                        <span>Los Títulos</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4">
                        Campeonatos <span className="text-lnl-gold">LNL</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        El oro que representa la excelencia en el ring. Conoce a nuestros campeones actuales.
                    </p>
                </div>
            </section>

            {/* Championships Grid */}
            <section className="max-w-7xl mx-auto px-4 pb-20">
                {activeChampionships.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>No hay campeonatos activos en este momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activeChampionships.map(champ => {
                            const champion = champ.currentChampionId ? championsMap.get(champ.currentChampionId) : null;
                            const reignDays = calculateReignDays(champ.wonAt);

                            return (
                                <Link
                                    key={champ.id}
                                    href={`/campeonatos/${champ.slug}`}
                                    className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-lnl-gold transition-all hover:shadow-[0_0_40px_rgba(255,215,0,0.15)]"
                                >
                                    {/* Belt Image */}
                                    <div className="relative aspect-video bg-gradient-to-br from-zinc-800 to-black p-6 flex items-center justify-center">
                                        {champ.image ? (
                                            <Image
                                                src={champ.image}
                                                alt={champ.title}
                                                fill
                                                className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <Trophy className="w-20 h-20 text-zinc-700" />
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-800 text-gray-400 px-2 py-1 rounded">
                                                {getDivisionLabel(champ.division)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h2 className="text-xl font-black uppercase italic tracking-tight text-white mb-4 group-hover:text-lnl-gold transition-colors">
                                            {champ.title}
                                        </h2>

                                        {champion ? (
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-lnl-gold flex-shrink-0">
                                                    {champion.image ? (
                                                        <Image src={champion.image} alt={champion.name} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                                                            <Crown className="w-6 h-6 text-lnl-gold" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{champion.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {reignDays} días • {champ.currentDefenses || 0} defensa(s)
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 text-gray-500">
                                                <Shield className="w-10 h-10" />
                                                <div>
                                                    <p className="font-bold">TÍTULO VACANTE</p>
                                                    <p className="text-xs">Próximamente se decidirá</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Inactive Championships */}
                {inactiveChampionships.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-black uppercase italic text-gray-500 mb-6">Títulos Retirados</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {inactiveChampionships.map(champ => (
                                <div key={champ.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 opacity-60">
                                    <h3 className="font-bold text-gray-400">{champ.title}</h3>
                                    <p className="text-xs text-gray-600">Título retirado</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
