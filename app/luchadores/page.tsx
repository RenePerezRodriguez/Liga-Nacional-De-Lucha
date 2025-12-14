"use client";

import { useState } from "react";
import { WrestlerCard } from "@/components/wrestler-card";
import { cn } from "@/lib/utils";

// Roster completo de la Liga Nacional de Lucha
const roster = [
    // Luchadores con fotos reales
    { name: "Alberto Del Rio", nickname: "El Patrón", alignment: "heel", image: "/images/roster/sin-fondo/ALBERTO DEL RIO.png" },
    { name: "Ajayu", nickname: "El Espíritu Andino", alignment: "face", image: "/images/roster/sin-fondo/AJAYU.png" },
    { name: "Alexander Ruiz", nickname: "El Técnico", alignment: "face", image: "/images/roster/sin-fondo/ALEXANDER RUIZ.png" },
    { name: "Amaru", nickname: "La Serpiente", alignment: "heel", image: "/images/roster/sin-fondo/AMARU.png" },
    { name: "Américo", nickname: "El Corazón de Bolivia", alignment: "face", image: "/images/roster/sin-fondo/AMERICO.png" },
    { name: "Axatuq", nickname: "El Guerrero", alignment: "face", image: "/images/roster/sin-fondo/AXATUQ.png" },
    { name: "Coyote", nickname: "El Salvaje", alignment: "heel", image: "/images/roster/sin-fondo/coyote.png" },
    { name: "Elking Gemio", nickname: "El Rey del Ring", alignment: "heel", image: "/images/roster/sin-fondo/ELKING GEMIO.png" },
    { name: "Enigma", nickname: "El Misterioso", alignment: "heel", image: "/images/roster/sin-fondo/ENIGMA.png" },
    { name: "Hijo de Dos Caras", nickname: "Legado de Leyenda", alignment: "face", image: "/images/roster/sin-fondo/HIJO DE DOS CARAS.png" },
    { name: "Ignacio Laurent", nickname: "El Elegante", alignment: "heel", image: "/images/roster/sin-fondo/IGNACIO LAURENT.png" },
    { name: "Jhos Godley", nickname: "La Estrella", alignment: "face", image: "/images/roster/sin-fondo/JHOS GODLEY.png" },
    { name: "Kusi Ligerin", nickname: "El Ágil", alignment: "face", image: "/images/roster/sin-fondo/KUSI LIGERIN.png" },
    { name: "Matty Camargo", nickname: "El Imparable", alignment: "heel", image: "/images/roster/sin-fondo/MATTY CAMARGO.png" },
    { name: "Mr. Alesso", nickname: "El Showman", alignment: "face", image: "/images/roster/sin-fondo/MR ALESSO.png" },
    { name: "Paul Villa", nickname: "El Gladiador", alignment: "face", image: "/images/roster/sin-fondo/PAUL VILLA.png" },
    { name: "Profe Guerras", nickname: "El Maestro", alignment: "heel", image: "/images/roster/sin-fondo/PROFE GUERRAS.png" },
    { name: "Rey Soberano", nickname: "El Monarca", alignment: "heel", image: "/images/roster/sin-fondo/REY SOBERANO.png" },
    { name: "Sarah", nickname: "La Diva del Ring", alignment: "face", image: "/images/roster/sin-fondo/SARAH.png" },
    { name: "Andrés Rojas", nickname: "El Luchador", alignment: "face", image: "/images/roster/sin-fondo/andres rojas 2.jpg" },
] as const;

type FilterType = "all" | "face" | "heel";

export default function RosterPage() {
    const [filter, setFilter] = useState<FilterType>("all");

    const filteredRoster = roster.filter(wrestler => {
        if (filter === "all") return true;
        return wrestler.alignment === filter;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8 md:mb-12 text-center">
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4">
                    Nuestro Roster
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto mb-6 md:mb-8 text-sm md:text-base">
                    Conoce a los atletas que dejan el alma en el cuadrilátero. Héroes y villanos, leyendas y nuevas promesas de la Liga Nacional de Lucha.
                </p>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-4">
                    <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>Todos</FilterButton>
                    <FilterButton active={filter === "face"} onClick={() => setFilter("face")}>Técnicos</FilterButton>
                    <FilterButton active={filter === "heel"} onClick={() => setFilter("heel")}>Rudos</FilterButton>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[400px]">
                {filteredRoster.map((wrestler) => (
                    <WrestlerCard
                        key={wrestler.name}
                        name={wrestler.name}
                        nickname={wrestler.nickname}
                        alignment={wrestler.alignment}
                        imageUrl={wrestler.image}
                    />
                ))}
            </div>
        </div>
    );
}

function FilterButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm transition-all",
                active
                    ? "bg-lnl-red text-white shadow-lg scale-105"
                    : "bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-white"
            )}
        >
            {children}
        </button>
    );
}
