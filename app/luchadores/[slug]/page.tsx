import { ArrowLeft, Play, Pause, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// Simulation of a database
const wrestlerData: Record<string, { name: string, nickname: string, image: string, alignment: string, bio: string, stats: any, music: string }> = {
    "el-sombra": {
        name: "El Sombra",
        nickname: "El Rey de las Tinieblas",
        image: "/images/roster/el-sombra.png",
        alignment: "heel",
        bio: "Un misterioso enmascarado que ha dominado la escena oscura de la lucha libre boliviana. Nadie conoce su verdadero origen.",
        stats: { height: "1.80m", weight: "95kg", finisher: "Shadow Driver" },
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Placeholder MP3
    },
    "furia-roja": {
        name: "Furia Roja",
        nickname: "La Máquina de Dolor",
        image: "/images/roster/furia-roja.png",
        alignment: "heel",
        bio: "Una fuerza imparable de la naturaleza. Furia Roja no busca ganar, busca destruir a cualquier oponente que se interponga en su camino.",
        stats: { height: "1.85m", weight: "110kg", finisher: "Powerbomb Infernal" },
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    "aguila-dorada": {
        name: "Águila Dorada",
        nickname: "El Vuelo de la Victoria",
        image: "/images/roster/aguila-dorada.png",
        alignment: "face",
        bio: "El técnico favorito de la afición. Con su estilo aéreo y carisma inigualable, representa la esperanza y el honor.",
        stats: { height: "1.75m", weight: "85kg", finisher: "450 Splash" },
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },
    "titan": {
        name: "Titán",
        nickname: "El Gigante de los Andes",
        image: "/images/roster/titan.png",
        alignment: "face",
        bio: "Un coloso de puro músculo. Titán es la defensa inquebrantable contra los rudos que intentan tomar el control de la liga.",
        stats: { height: "1.95m", weight: "130kg", finisher: "Chokeslam" },
        music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    }
};

export default function WrestlerProfile({ params }: { params: { slug: string } }) {
    const wrestler = wrestlerData[params.slug];

    if (!wrestler) {
        // In a real app we'd use notFound(), but for static export safety just showing a fallback
        return <div className="p-20 text-center text-white">Luchador no encontrado</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-950 pb-20">
            {/* Hero/Header */}
            <div className="relative h-[60vh] overflow-hidden">
                <Image
                    src={wrestler.image}
                    alt={wrestler.name}
                    fill
                    className="object-cover opacity-40 blur-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 text-center md:text-left">
                    <div className="relative w-40 h-52 md:w-64 md:h-80 rounded-lg overflow-hidden border-4 border-lnl-gold shadow-2xl flex-shrink-0 bg-black mx-auto md:mx-0">
                        <Image
                            src={wrestler.image}
                            alt={wrestler.name}
                            fill
                            className="object-cover object-top"
                        />
                    </div>
                    <div className="mb-4">
                        <span className="text-lnl-gold font-bold uppercase tracking-widest text-sm md:text-xl block mb-2">{wrestler.nickname}</span>
                        <h1 className="text-4xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">{wrestler.name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <span className={`px-4 py-1 rounded-full font-bold uppercase text-sm ${wrestler.alignment === 'face' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
                                {wrestler.alignment === 'face' ? 'Técnico' : 'Rudo'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-black text-white uppercase italic mb-4 border-b border-zinc-800 pb-2">Biografía</h2>
                        <p className="text-gray-300 text-lg leading-relaxed">{wrestler.bio}</p>
                    </section>

                    {/* Audio Player */}
                    <section className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                        <h2 className="text-xl font-bold text-white uppercase mb-4 flex items-center gap-2">
                            <Play className="w-5 h-5 text-lnl-gold" /> Tema de Entrada
                        </h2>
                        <audio controls className="w-full">
                            <source src={wrestler.music} type="audio/mpeg" />
                            Tu navegador no soporta el elemento de audio.
                        </audio>
                    </section>
                </div>

                <div className="space-y-6">
                    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                        <h3 className="text-white font-bold uppercase mb-4">Estadísticas</h3>
                        <ul className="space-y-4">
                            <li className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-gray-500">Altura</span>
                                <span className="text-white font-bold">{wrestler.stats.height}</span>
                            </li>
                            <li className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-gray-500">Peso</span>
                                <span className="text-white font-bold">{wrestler.stats.weight}</span>
                            </li>
                            <li className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-gray-500">Remate</span>
                                <span className="text-white font-bold text-lnl-red">{wrestler.stats.finisher}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
