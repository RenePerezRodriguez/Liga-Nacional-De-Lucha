import Image from "next/image";
import { Trophy } from "lucide-react";

export function ChampionshipsSection() {
    const titles = [
        {
            name: "Campeonato Mundial Peso Completo LNL",
            holder: "El Sombra",
            image: "/images/titles/world-title.png", // Start with placeholder later
            color: "border-lnl-gold"
        },
        {
            name: "Campeonato en Parejas LNL",
            holder: "Los Destructores (Toro y Cobra)",
            image: "/images/titles/tag-title.png",
            color: "border-silver-500" // using tailwind color roughly
        }
    ];

    return (
        <section className="bg-gradient-to-b from-zinc-900 to-black py-10 md:py-16 border-t border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="mb-12">
                    <span className="text-lnl-gold font-bold uppercase tracking-widest text-sm block mb-2">Prestigio & Honor</span>
                    <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-white">Campeones Actuales</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 max-w-4xl mx-auto">
                    {titles.map((title, idx) => (
                        <div key={idx} className={`bg-zinc-800/50 p-6 md:p-8 rounded-xl border-2 ${title.color === 'border-lnl-gold' ? 'border-yellow-500' : 'border-zinc-500'} relative overflow-hidden group`}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0" />

                            {/* Placeholder for Title Belt Image */}
                            <div className="relative z-10 w-48 h-32 mx-auto bg-black/50 mb-6 flex items-center justify-center rounded-lg border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                {/* Replace with real image later */}
                                <Trophy className={`w-16 h-16 ${title.color === 'border-lnl-gold' ? 'text-yellow-500' : 'text-zinc-400'}`} />
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-white uppercase tracking-wide mb-2">{title.name}</h3>
                                <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Campeón Actual</p>
                                <p className="text-2xl font-black text-lnl-red italic">{title.holder}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
