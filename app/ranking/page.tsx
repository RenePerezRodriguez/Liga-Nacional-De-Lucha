"use client";

import { useEffect, useState } from "react";
import { Trophy, TrendingUp, Minus, TrendingDown, X, Info, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { collection, onSnapshot, query, orderBy, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface WrestlerRanking extends DocumentData {
    id: string;
    name: string;
    slug?: string;
    nickname?: string;
    image?: string;
    rankingPoints?: number;
    rankingMovement?: "up" | "down" | "same";
    rankingReason?: string;
}



export default function RankingPage() {
    const [wrestlers, setWrestlers] = useState<WrestlerRanking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWrestler, setSelectedWrestler] = useState<WrestlerRanking | null>(null);

    useEffect(() => {
        // Fetch wrestlers ordered by rankingPoints (highest first)
        const q = query(collection(db, "luchadores"), orderBy("rankingPoints", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(w => (w as WrestlerRanking).rankingPoints && (w as WrestlerRanking).rankingPoints! > 0) as WrestlerRanking[];
            setWrestlers(data);
            setLoading(false);
        }, (error) => {
            // If no index or no rankingPoints field, fall back to name order
            console.warn("Ranking query failed, falling back:", error);
            const fallbackQ = query(collection(db, "luchadores"), orderBy("name"));
            onSnapshot(fallbackQ, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WrestlerRanking[];
                setWrestlers(data.slice(0, 10)); // Top 10 by name if no ranking
                setLoading(false);
            });
        });
        return () => unsubscribe();
    }, []);

    const getMovementIcon = (movement?: string) => {
        switch (movement) {
            case "up": return <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-green-500" />;
            case "down": return <TrendingDown className="w-6 h-6 md:w-8 md:h-8 text-red-500" />;
            default: return <Minus className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />;
        }
    };

    return (
        <div className="min-h-screen bg-black pb-20">
            <div className="bg-lnl-gold py-12 mb-10 text-black">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter mb-2">Power Rankings</h1>
                    <p className="font-bold uppercase tracking-widest opacity-80 text-sm md:text-base">
                        Actualizado: {new Date().toLocaleDateString('es-BO', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="text-center text-gray-500 py-20">Cargando rankings...</div>
                ) : wrestlers.length > 0 ? (
                    <>
                        <p className="text-gray-500 text-center mb-8 text-sm">Haz clic en un luchador para ver más detalles.</p>
                        <div className="space-y-4">
                            {wrestlers.map((wrestler, index) => (
                                <div
                                    key={wrestler.id}
                                    onClick={() => setSelectedWrestler(wrestler)}
                                    className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-lnl-gold transition-all group relative overflow-hidden text-center sm:text-left cursor-pointer"
                                >
                                    {/* Rank Number */}
                                    <div className="flex-shrink-0 w-16 text-center">
                                        <span className="text-4xl md:text-5xl font-black text-zinc-700 group-hover:text-white transition-colors italic">#{index + 1}</span>
                                    </div>

                                    {/* Avatar */}
                                    <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 relative rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 group-hover:border-lnl-gold">
                                        {wrestler.image ? (
                                            <Image src={wrestler.image} alt={wrestler.name} fill className="object-cover" sizes="96px" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold text-2xl">?</div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-grow min-w-0">
                                        <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight">{wrestler.name}</h3>
                                        <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-400 mb-1">
                                            <Trophy className="w-3 h-3 text-lnl-gold" />
                                            <span>{wrestler.rankingPoints || 0} Puntos</span>
                                        </div>
                                        {wrestler.rankingReason && (
                                            <p className="text-xs text-gray-500 truncate max-w-md hidden sm:block">
                                                {wrestler.rankingReason}
                                            </p>
                                        )}
                                    </div>

                                    {/* Trend */}
                                    <div className="flex-shrink-0 px-4">
                                        {getMovementIcon(wrestler.rankingMovement)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No hay rankings disponibles.</p>
                        <p className="text-gray-600 text-sm mt-2">Los rankings se publicarán próximamente.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedWrestler && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedWrestler(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg p-6 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedWrestler(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-20 h-20 relative rounded-full overflow-hidden bg-zinc-800 border-2 border-lnl-gold flex-shrink-0">
                                    {selectedWrestler.image ? (
                                        <Image src={selectedWrestler.image} alt={selectedWrestler.name} fill className="object-cover" sizes="80px" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold text-2xl">?</div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white uppercase italic">{selectedWrestler.name}</h2>
                                    <p className="text-lnl-gold font-bold">{selectedWrestler.rankingPoints || 0} Pts</p>
                                </div>
                            </div>

                            {/* Reason */}
                            {selectedWrestler.rankingReason && (
                                <div className="bg-zinc-800/50 p-4 rounded-lg border-l-4 border-lnl-gold">
                                    <div className="flex items-start gap-2">
                                        <Info className="w-5 h-5 text-lnl-gold flex-shrink-0 mt-0.5" />
                                        <p className="text-gray-300">{selectedWrestler.rankingReason}</p>
                                    </div>
                                </div>
                            )}

                            {!selectedWrestler.rankingReason && (
                                <div className="text-center text-gray-500 py-4">
                                    <p>Información de ranking próximamente.</p>
                                </div>
                            )}

                            {/* Ver Perfil Button */}
                            {selectedWrestler.slug && (
                                <Link
                                    href={`/luchadores/${selectedWrestler.slug}`}
                                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-lnl-gold text-black font-bold uppercase rounded-lg hover:bg-yellow-500 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" /> Ver Perfil Completo
                                </Link>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
