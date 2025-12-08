"use client";

import { useState } from "react";
import { WrestlerCard } from "@/components/wrestler-card";
import { cn } from "@/lib/utils";

const roster = [
    { name: "El Sombra", nickname: "El Rey de las Tinieblas", alignment: "heel", image: "/images/roster/el-sombra.png" },
    { name: "Furia Roja", nickname: "La Máquina de Dolor", alignment: "heel", image: "/images/roster/furia-roja.png" },
    { name: "Águila Dorada", nickname: "El Vuelo de la Victoria", alignment: "face", image: "/images/roster/aguila-dorada.png" },
    { name: "Titán", nickname: "El Gigante de los Andes", alignment: "face", image: "/images/roster/titan.png" },
    // Placeholders for others using generic roster images or just re-using for demo if user desires, but I'll leave them empty for now to show fallback or re-use existing if I want to make it look full.
    // User only uploaded 4 wrestler images. I will map the rest to NULL or maybe reuse for demo purposes?
    // User said "subi todas las imagenes", meaning maybe only these 4 are relevant?
    // I'll keep the others without images for now to be safe.
    { name: "Cobra", nickname: "El Veneno del Ring", alignment: "heel", image: undefined },
    { name: "Rayo", nickname: "Velocidad Pura", alignment: "face", image: undefined },
    { name: "La Pantera", nickname: "Cazadora Nocturna", alignment: "face", image: undefined },
    { name: "Toro", nickname: "Fuerza Bruta", alignment: "heel", image: undefined },
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
                    <FilterButton active={filter === "face"} onClick={() => setFilter("face")}>Técnicos (Favoritos)</FilterButton>
                    <FilterButton active={filter === "heel"} onClick={() => setFilter("heel")}>Rudos (Villanos)</FilterButton>
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
