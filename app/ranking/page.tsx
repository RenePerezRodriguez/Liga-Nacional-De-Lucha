"use client";

import { useState } from "react";
import { Trophy, TrendingUp, Minus, TrendingDown, X, Swords, Calendar, Info } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type WrestlerRanking = {
    rank: number;
    slug: string;
    name: string;
    movement: string;
    image?: string;
    points: number;
    reason: string;
    recentMatches: { opponent: string, result: "win" | "loss" | "draw", event: string }[];
};

const ranking: WrestlerRanking[] = [
    {
        rank: 1,
        slug: "el-sombra",
        name: "El Sombra",
        movement: "same",
        image: "/images/roster/el-sombra.png",
        points: 2500,
        reason: "Campeón reinante. 5 defensas exitosas del título.",
        recentMatches: [
            { opponent: "Titán", result: "win", event: "Noche de Campeones" },
            { opponent: "Furia Roja", result: "win", event: "Caos en la Jaula" },
            { opponent: "Águila Dorada", result: "win", event: "Guerra del Valle" },
        ]
    },
    {
        rank: 2,
        slug: "titan",
        name: "Titán",
        movement: "up",
        image: "/images/roster/titan.png",
        points: 2350,
        reason: "Victoria contundente contra Furia Roja. Aspirante #1 al título.",
        recentMatches: [
            { opponent: "Furia Roja", result: "win", event: "Noche de Campeones" },
            { opponent: "La Pantera", result: "win", event: "Caos en la Jaula" },
            { opponent: "El Sombra", result: "loss", event: "Guerra del Valle" },
        ]
    },
    {
        rank: 3,
        slug: "furia-roja",
        name: "Furia Roja",
        movement: "down",
        image: "/images/roster/furia-roja.png",
        points: 2100,
        reason: "Derrota ante Titán lo hizo bajar un puesto.",
        recentMatches: [
            { opponent: "Titán", result: "loss", event: "Noche de Campeones" },
            { opponent: "Águila Dorada", result: "win", event: "Caos en la Jaula" },
            { opponent: "La Pantera", result: "win", event: "Guerra del Valle" },
        ]
    },
    {
        rank: 4,
        slug: "aguila-dorada",
        name: "Águila Dorada",
        movement: "up",
        image: "/images/roster/aguila-dorada.png",
        points: 1950,
        reason: "Racha de victorias sobre luchadores de medio cartel.",
        recentMatches: [
            { opponent: "La Pantera", result: "win", event: "Noche de Campeones" },
            { opponent: "Furia Roja", result: "loss", event: "Caos en la Jaula" },
            { opponent: "Novato X", result: "win", event: "Guerra del Valle" },
        ]
    },
    {
        rank: 5,
        slug: "la-pantera",
        name: "La Pantera",
        movement: "same",
        image: undefined,
        points: 1800,
        reason: "Se mantiene estable a pesar de las derrotas.",
        recentMatches: [
            { opponent: "Águila Dorada", result: "loss", event: "Noche de Campeones" },
            { opponent: "Titán", result: "loss", event: "Caos en la Jaula" },
            { opponent: "Novato Y", result: "win", event: "Guerra del Valle" },
        ]
    },
];

export default function RankingPage() {
    const [selectedWrestler, setSelectedWrestler] = useState<WrestlerRanking | null>(null);

    return (
        <div className="min-h-screen bg-black pb-20">
            <div className="bg-lnl-gold py-12 mb-10 text-black">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter mb-2">Power Rankings</h1>
                    <p className="font-bold uppercase tracking-widest opacity-80 text-sm md:text-base">Actualizado: Diciembre 2024</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-gray-500 text-center mb-8 text-sm">Haz clic en un luchador para ver sus luchas recientes.</p>
                <div className="space-y-4">
                    {ranking.map((wrestler) => (
                        <div
                            key={wrestler.rank}
                            onClick={() => setSelectedWrestler(wrestler)}
                            className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-lnl-gold transition-all group relative overflow-hidden text-center sm:text-left cursor-pointer"
                        >
                            {/* Rank Number */}
                            <div className="flex-shrink-0 w-16 text-center">
                                <span className="text-4xl md:text-5xl font-black text-zinc-700 group-hover:text-white transition-colors italic">#{wrestler.rank}</span>
                            </div>

                            {/* Avatar */}
                            <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 relative rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 group-hover:border-lnl-gold">
                                {wrestler.image ? (
                                    <Image src={wrestler.image} alt={wrestler.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold text-2xl">?</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-grow">
                                <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight">{wrestler.name}</h3>
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-400">
                                    <Trophy className="w-3 h-3 text-lnl-gold" />
                                    <span>{wrestler.points} Puntos</span>
                                </div>
                            </div>

                            {/* Trend */}
                            <div className="flex-shrink-0 px-4">
                                {wrestler.movement === 'up' && <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-green-500" />}
                                {wrestler.movement === 'down' && <TrendingDown className="w-6 h-6 md:w-8 md:h-8 text-red-500" />}
                                {wrestler.movement === 'same' && <Minus className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />}
                            </div>
                        </div>
                    ))}
                </div>
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
                                        <Image src={selectedWrestler.image} alt={selectedWrestler.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold text-2xl">?</div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white uppercase italic">{selectedWrestler.name}</h2>
                                    <p className="text-lnl-gold font-bold">Puesto #{selectedWrestler.rank} • {selectedWrestler.points} Pts</p>
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="bg-zinc-800/50 p-4 rounded-lg mb-6 border-l-4 border-lnl-gold">
                                <div className="flex items-start gap-2">
                                    <Info className="w-5 h-5 text-lnl-gold flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-300">{selectedWrestler.reason}</p>
                                </div>
                            </div>

                            {/* Recent Matches */}
                            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                                <Swords className="w-4 h-4 text-lnl-red" /> Luchas Recientes
                            </h3>
                            <div className="space-y-3">
                                {selectedWrestler.recentMatches.map((match, index) => (
                                    <div key={index} className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-2 h-2 rounded-full ${match.result === 'win' ? 'bg-green-500' : match.result === 'loss' ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                                            <span className="text-white font-bold">vs {match.opponent}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-bold uppercase ${match.result === 'win' ? 'text-green-500' : match.result === 'loss' ? 'text-red-500' : 'text-gray-500'}`}>
                                                {match.result === 'win' ? 'Victoria' : match.result === 'loss' ? 'Derrota' : 'Empate'}
                                            </span>
                                            <p className="text-gray-500 text-xs">{match.event}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

