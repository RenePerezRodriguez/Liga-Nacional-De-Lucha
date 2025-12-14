import { ArrowLeft, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Roster completo de la Liga Nacional de Lucha
const wrestlerData: Record<string, {
    name: string,
    nickname: string,
    image: string,
    alignment: string,
    bio: string,
    stats: { height: string, weight: string, finisher: string, hometown: string },
}> = {
    "alberto-del-rio": {
        name: "Alberto Del Rio",
        nickname: "El Patrón",
        image: "/images/roster/sin-fondo/ALBERTO DEL RIO.png",
        alignment: "heel",
        bio: "Leyenda internacional de la lucha libre. Ex campeón de WWE y AAA, ahora trae su experiencia mundial a la Liga Nacional de Lucha de Bolivia.",
        stats: { height: "1.91m", weight: "108kg", finisher: "Cross Armbreaker", hometown: "San Luis Potosí, México" },
    },
    "ajayu": {
        name: "Ajayu",
        nickname: "El Espíritu Andino",
        image: "/images/roster/sin-fondo/AJAYU.png",
        alignment: "face",
        bio: "Representa el espíritu guerrero de los Andes. Su conexión con la cultura andina le da una fuerza interior inigualable.",
        stats: { height: "1.78m", weight: "88kg", finisher: "Espíritu Andino", hometown: "La Paz" },
    },
    "alexander-ruiz": {
        name: "Alexander Ruiz",
        nickname: "El Técnico",
        image: "/images/roster/sin-fondo/ALEXANDER RUIZ.png",
        alignment: "face",
        bio: "Un luchador técnico con años de experiencia. Su precisión en el ring es admirada por todos los fanáticos.",
        stats: { height: "1.75m", weight: "82kg", finisher: "Technical Submission", hometown: "Cochabamba" },
    },
    "amaru": {
        name: "Amaru",
        nickname: "La Serpiente",
        image: "/images/roster/sin-fondo/AMARU.png",
        alignment: "heel",
        bio: "Silencioso y letal como una serpiente. Amaru ataca cuando menos lo esperas y no muestra piedad.",
        stats: { height: "1.80m", weight: "90kg", finisher: "Veneno Mortal", hometown: "Oruro" },
    },
    "americo": {
        name: "Américo",
        nickname: "El Corazón de Bolivia",
        image: "/images/roster/sin-fondo/AMERICO.png",
        alignment: "face",
        bio: "El favorito del público. Américo representa los valores y la pasión del pueblo boliviano.",
        stats: { height: "1.82m", weight: "92kg", finisher: "Corazón Valiente", hometown: "Santa Cruz" },
    },
    "axatuq": {
        name: "Axatuq",
        nickname: "El Guerrero",
        image: "/images/roster/sin-fondo/AXATUQ.png",
        alignment: "face",
        bio: "Un guerrero ancestral que trae las tradiciones de combate de sus antepasados al cuadrilátero moderno.",
        stats: { height: "1.85m", weight: "95kg", finisher: "Golpe del Guerrero", hometown: "Potosí" },
    },
    "coyote": {
        name: "Coyote",
        nickname: "El Salvaje",
        image: "/images/roster/sin-fondo/coyote.png",
        alignment: "heel",
        bio: "Impredecible y salvaje. El Coyote es conocido por sus tácticas poco ortodoxas y su naturaleza salvaje.",
        stats: { height: "1.77m", weight: "85kg", finisher: "Mordida del Coyote", hometown: "Tarija" },
    },
    "elking-gemio": {
        name: "Elking Gemio",
        nickname: "El Rey del Ring",
        image: "/images/roster/sin-fondo/ELKING GEMIO.png",
        alignment: "heel",
        bio: "Se proclama el rey del ring y lucha para demostrar que nadie está a su nivel. Su arrogancia solo es igualada por su habilidad.",
        stats: { height: "1.83m", weight: "93kg", finisher: "Royal Decree", hometown: "La Paz" },
    },
    "enigma": {
        name: "Enigma",
        nickname: "El Misterioso",
        image: "/images/roster/sin-fondo/ENIGMA.png",
        alignment: "heel",
        bio: "Nadie conoce su verdadera identidad. Enigma mantiene su pasado en secreto mientras domina a sus oponentes.",
        stats: { height: "1.79m", weight: "87kg", finisher: "Puzzle Lock", hometown: "Desconocido" },
    },
    "hijo-de-dos-caras": {
        name: "Hijo de Dos Caras",
        nickname: "Legado de Leyenda",
        image: "/images/roster/sin-fondo/HIJO DE DOS CARAS.png",
        alignment: "face",
        bio: "Heredero del legado de una leyenda mexicana. Lleva con orgullo el nombre de su padre y lucha para honrar su memoria.",
        stats: { height: "1.88m", weight: "98kg", finisher: "Dos Caras Driver", hometown: "Ciudad de México" },
    },
    "ignacio-laurent": {
        name: "Ignacio Laurent",
        nickname: "El Elegante",
        image: "/images/roster/sin-fondo/IGNACIO LAURENT.png",
        alignment: "heel",
        bio: "Un aristócrata del ring. Laurent desprecia a la clase trabajadora y lucha solo por su propia gloria.",
        stats: { height: "1.80m", weight: "89kg", finisher: "Aristocrat's End", hometown: "Buenos Aires" },
    },
    "jhos-godley": {
        name: "Jhos Godley",
        nickname: "La Estrella",
        image: "/images/roster/sin-fondo/JHOS GODLEY.png",
        alignment: "face",
        bio: "Un talento natural que brilla en cada combate. Su carisma y habilidad lo hacen un favorito instantáneo.",
        stats: { height: "1.76m", weight: "84kg", finisher: "Starlight Slam", hometown: "Cochabamba" },
    },
    "kusi-ligerin": {
        name: "Kusi Ligerin",
        nickname: "El Ágil",
        image: "/images/roster/sin-fondo/KUSI LIGERIN.png",
        alignment: "face",
        bio: "Velocidad y agilidad sin igual. Kusi Ligerin vuela por el aire ejecutando maniobras que desafían la gravedad.",
        stats: { height: "1.70m", weight: "75kg", finisher: "Lightning Strike", hometown: "Sucre" },
    },
    "matty-camargo": {
        name: "Matty Camargo",
        nickname: "El Imparable",
        image: "/images/roster/sin-fondo/MATTY CAMARGO.png",
        alignment: "heel",
        bio: "Una fuerza imparable. Matty Camargo no se detiene ante nada ni nadie para conseguir la victoria.",
        stats: { height: "1.90m", weight: "105kg", finisher: "Camargo Slam", hometown: "Santa Cruz" },
    },
    "mr-alesso": {
        name: "Mr. Alesso",
        nickname: "El Showman",
        image: "/images/roster/sin-fondo/MR ALESSO.png",
        alignment: "face",
        bio: "El entretenedor por excelencia. Mr. Alesso combina habilidad de lucha con un carisma que electriza al público.",
        stats: { height: "1.78m", weight: "86kg", finisher: "Show Stopper", hometown: "Cochabamba" },
    },
    "paul-villa": {
        name: "Paul Villa",
        nickname: "El Gladiador",
        image: "/images/roster/sin-fondo/PAUL VILLA.png",
        alignment: "face",
        bio: "Un gladiador moderno. Paul Villa trae la disciplina y honor de los guerreros romanos al cuadrilátero.",
        stats: { height: "1.85m", weight: "97kg", finisher: "Gladiator's Wrath", hometown: "La Paz" },
    },
    "profe-guerras": {
        name: "Profe Guerras",
        nickname: "El Maestro",
        image: "/images/roster/sin-fondo/PROFE GUERRAS.png",
        alignment: "heel",
        bio: "El maestro del dolor. Profe Guerras enseña lecciones dolorosas a todos sus oponentes dentro del ring.",
        stats: { height: "1.82m", weight: "94kg", finisher: "Lesson Learned", hometown: "Oruro" },
    },
    "rey-soberano": {
        name: "Rey Soberano",
        nickname: "El Monarca",
        image: "/images/roster/sin-fondo/REY SOBERANO.png",
        alignment: "heel",
        bio: "Se considera el legítimo gobernante del ring. Rey Soberano exige que todos se arrodillen ante él.",
        stats: { height: "1.86m", weight: "100kg", finisher: "Royal Command", hometown: "Potosí" },
    },
    "sarah": {
        name: "Sarah",
        nickname: "La Diva del Ring",
        image: "/images/roster/sin-fondo/SARAH.png",
        alignment: "face",
        bio: "La primera mujer en el roster de la LNL. Sarah demuestra que el ring no tiene género y compite al máximo nivel.",
        stats: { height: "1.68m", weight: "62kg", finisher: "Diva Drop", hometown: "La Paz" },
    },
    "andres-rojas": {
        name: "Andrés Rojas",
        nickname: "El Luchador",
        image: "/images/roster/sin-fondo/andres rojas 2.jpg",
        alignment: "face",
        bio: "Un luchador de pura cepa. Andrés Rojas representa el espíritu de nunca rendirse sin importar las adversidades.",
        stats: { height: "1.80m", weight: "90kg", finisher: "Rojas Lock", hometown: "Cochabamba" },
    },
};

export default async function WrestlerProfile({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const wrestler = wrestlerData[slug];

    if (!wrestler) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-black uppercase italic mb-4">Luchador no encontrado</h1>
                    <Link href="/luchadores" className="text-lnl-red hover:underline">
                        ← Volver al Roster
                    </Link>
                </div>
            </div>
        );
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

            {/* Back Link */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Link href="/luchadores" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Volver al Roster
                </Link>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Bio */}
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl font-black text-white uppercase italic mb-6">Biografía</h2>
                        <p className="text-gray-300 text-lg leading-relaxed mb-8">
                            {wrestler.bio}
                        </p>
                    </div>

                    {/* Stats */}
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase italic mb-6">Estadísticas</h2>
                        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                                <span className="text-gray-400 font-bold uppercase text-sm">Altura</span>
                                <span className="text-white font-bold">{wrestler.stats.height}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                                <span className="text-gray-400 font-bold uppercase text-sm">Peso</span>
                                <span className="text-white font-bold">{wrestler.stats.weight}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                                <span className="text-gray-400 font-bold uppercase text-sm">Finisher</span>
                                <span className="text-lnl-red font-bold">{wrestler.stats.finisher}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold uppercase text-sm">Origen</span>
                                <span className="text-white font-bold">{wrestler.stats.hometown}</span>
                            </div>
                        </div>

                        {/* Championships placeholder */}
                        <div className="mt-6 bg-gradient-to-br from-lnl-gold/10 to-transparent rounded-xl p-6 border border-lnl-gold/30">
                            <div className="flex items-center gap-3 mb-3">
                                <Trophy className="w-6 h-6 text-lnl-gold" />
                                <h3 className="text-white font-bold uppercase">Títulos</h3>
                            </div>
                            <p className="text-gray-400 text-sm">Historial de campeonatos próximamente...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
