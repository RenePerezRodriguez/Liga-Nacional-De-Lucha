"use client";

import { useEffect, useState } from "react";
import { WrestlerCard } from "@/components/wrestler-card";
import { cn } from "@/lib/utils";
import { collection, onSnapshot, query, orderBy, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";

type FilterType = "all" | "face" | "heel";

interface Wrestler extends DocumentData {
    id: string;
    name: string;
    nickname?: string;
    alignment?: string;
    image?: string;
    slug?: string;
}

export default function RosterPage() {
    const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
    const [filter, setFilter] = useState<FilterType>("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "luchadores"), orderBy("name"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Wrestler[];
            setWrestlers(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredRoster = wrestlers.filter(wrestler => {
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
                {loading ? (
                    <div className="col-span-full text-center text-gray-500 py-20">Cargando luchadores...</div>
                ) : filteredRoster.length > 0 ? (
                    filteredRoster.map((wrestler) => (
                        <WrestlerCard
                            key={wrestler.id}
                            name={wrestler.name}
                            nickname={wrestler.nickname}
                            alignment={wrestler.alignment as "face" | "heel" | undefined}
                            imageUrl={wrestler.image}
                            slug={wrestler.slug}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-20">No se encontraron luchadores.</div>
                )}
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
