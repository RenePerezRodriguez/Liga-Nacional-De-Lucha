import Image from "next/image";
import { cn } from "@/lib/utils";

interface FighterStats {
    name: string;
    nickname: string;
    height: string;
    weight: string;
    finisher: string;
    image: string;
    alignment: "face" | "heel";
}

interface TaleOfTheTapeProps {
    fighter1: FighterStats;
    fighter2: FighterStats;
}

export function TaleOfTheTape({ fighter1, fighter2 }: TaleOfTheTapeProps) {
    return (
        <div className="w-full bg-zinc-900 border-y-4 border-lnl-gold py-8 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:20px_20px] opacity-30"></div>

            <div className="max-w-6xl mx-auto px-4 relative z-10">
                <h3 className="text-center text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-8 text-shadow-glow">
                    Tale of the Tape
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {/* Fighter 1 */}
                    <div className="text-center md:text-right order-2 md:order-1">
                        <div className="relative w-48 h-48 mx-auto md:ml-auto md:mr-0 mb-4 rounded-full border-4 border-lnl-red overflow-hidden bg-zinc-800">
                            {fighter1.image ? (
                                <Image src={fighter1.image} alt={fighter1.name} fill sizes="192px" className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-700 animate-pulse" />
                            )}
                        </div>
                        <h4 className="text-3xl font-bold text-white uppercase italic">{fighter1.name}</h4>
                        <p className="text-lnl-gold font-bold uppercase tracking-wider text-sm mb-4">{fighter1.nickname}</p>
                    </div>

                    {/* Stats Middle */}
                    <div className="flex flex-col gap-4 order-1 md:order-2 bg-black/50 p-6 rounded-xl border border-zinc-700 backdrop-blur-sm">
                        <StatRow label="Altura" value1={fighter1.height} value2={fighter2.height} />
                        <StatRow label="Peso" value1={fighter1.weight} value2={fighter2.weight} />
                        <StatRow label="Movimiento Final" value1={fighter1.finisher} value2={fighter2.finisher} isText />
                    </div>

                    {/* Fighter 2 */}
                    <div className="text-center md:text-left order-3">
                        <div className="relative w-48 h-48 mx-auto md:mr-auto md:ml-0 mb-4 rounded-full border-4 border-blue-600 overflow-hidden bg-zinc-800">
                            {fighter2.image ? (
                                <Image src={fighter2.image} alt={fighter2.name} fill sizes="192px" className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-700 animate-pulse" />
                            )}
                        </div>
                        <h4 className="text-3xl font-bold text-white uppercase italic">{fighter2.name}</h4>
                        <p className="text-blue-400 font-bold uppercase tracking-wider text-sm mb-4">{fighter2.nickname}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatRow({ label, value1, value2, isText = false }: { label: string, value1: string, value2: string, isText?: boolean }) {
    return (
        <div className="grid grid-cols-3 items-center text-center border-b border-zinc-800 pb-2 last:border-0 last:pb-0">
            <div className={cn("font-bold text-white", isText ? "text-xs md:text-sm" : "text-xl")}>{value1}</div>
            <div className="text-gray-500 uppercase text-xs tracking-widest font-bold">{label}</div>
            <div className={cn("font-bold text-white", isText ? "text-xs md:text-sm" : "text-xl")}>{value2}</div>
        </div>
    );
}
