import { WrestlerCard } from "@/components/wrestler-card";
import { Trophy, TrendingUp, Minus, TrendingDown } from "lucide-react";
import Image from "next/image";

export default function RankingPage() {
    const ranking = [
        { rank: 1, name: "El Sombra", movement: "same", image: "/images/roster/el-sombra.png", points: 2500 },
        { rank: 2, name: "Titán", movement: "up", image: "/images/roster/titan.png", points: 2350 },
        { rank: 3, name: "Furia Roja", movement: "down", image: "/images/roster/furia-roja.png", points: 2100 },
        { rank: 4, name: "Águila Dorada", movement: "up", image: "/images/roster/aguila-dorada.png", points: 1950 },
        { rank: 5, name: "La Pantera", movement: "same", image: undefined, points: 1800 },
    ];

    return (
        <div className="min-h-screen bg-black pb-20">
            <div className="bg-lnl-gold py-12 mb-10 text-black">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter mb-2">Power Rankings</h1>
                    <p className="font-bold uppercase tracking-widest opacity-80 text-sm md:text-base">Actualizado: Diciembre 2024</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-4">
                    {ranking.map((wrestler) => (
                        <div key={wrestler.rank} className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-lnl-gold transition-all group relative overflow-hidden text-center sm:text-left">
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
        </div>
    );
}
