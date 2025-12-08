import { Calendar, Trophy, User } from "lucide-react";
import Image from "next/image";

const pastEvents = [
    {
        id: 1,
        name: "Caos en la Jaula",
        date: "02 Dic, 2024",
        location: "Coliseo Pittsburg",
        results: [
            { match: 1, winner: "Furia Roja", loser: "Titán", type: "Steel Cage Match por el Campeonato Peso Pesado", finish: "Pinfall tras Powerbomb desde la cima" },
            { match: 2, winner: "Águila Dorada", loser: "Cobra", type: "Mano a Mano", finish: "450 Splash" },
            { match: 3, winner: "Los Hermanos Trueno", loser: "La Legión Oscura", type: "Tag Team Match", finish: "Doble Suplex" }
        ]
    },
    {
        id: 2,
        name: "Golpe de Estado",
        date: "15 Nov, 2024",
        location: "Coliseo de la Coronilla",
        results: [
            { match: 1, winner: "El Sombra", loser: "Rayo", type: "Lucha de Escaleras", finish: "Descolgó el maletín" },
            { match: 2, winner: "La Pantera", loser: "Víbora", type: "Campeonato Femenino", finish: "Submission" }
        ]
    }
];

export default function ResultsPage() {
    return (
        <div className="min-h-screen bg-zinc-950 pb-20">
            <div className="bg-zinc-900 py-8 md:py-12 mb-8 md:mb-10 border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-2">Resultados</h1>
                    <p className="text-gray-400 text-sm md:text-base">Historial oficial de combates de la LNL.</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                {pastEvents.map((event) => (
                    <div key={event.id} className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="bg-zinc-900 p-6 flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800">
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-2">{event.name}</h2>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {event.date}</span>
                                    <span>|</span>
                                    <span>{event.location}</span>
                                </div>
                            </div>
                            {/* Placeholder for event poster if available */}
                        </div>
                        <div className="p-6 space-y-6">
                            {event.results.map((match, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row gap-4 md:items-center border-b border-zinc-900 last:border-0 pb-6 last:pb-0">
                                    <div className="w-8 h-8 bg-lnl-gold/10 text-lnl-gold font-bold flex items-center justify-center rounded-full text-xs">
                                        {match.match}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">{match.type}</p>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-white font-bold text-lg flex items-center gap-2">
                                                <Trophy className="w-4 h-4 text-lnl-gold" /> {match.winner}
                                            </span>
                                            <span className="text-gray-600 text-sm">derrotó a</span>
                                            <span className="text-gray-400">{match.loser}</span>
                                        </div>
                                        <p className="text-gray-500 text-sm italic">Final: {match.finish}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
