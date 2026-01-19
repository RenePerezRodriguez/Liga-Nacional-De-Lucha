"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteImageFromStorage } from "@/lib/storage-utils";
import Link from "next/link";
import { Plus, Trash2, Pencil, Trophy } from "lucide-react";
import Image from "next/image";

import { DocumentData } from "firebase/firestore";

interface Championship extends DocumentData {
    id: string;
    title: string;
    currentChampion: string;
    image?: string;
}

export default function ChampionshipsAdminPage() {
    const [items, setItems] = useState<Championship[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "campeonatos"), orderBy("title"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Championship[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (confirm(`¿Eliminar campeonato: ${title}?`)) {
            try {
                const champ = items.find(c => c.id === id);
                if (champ?.image) {
                    await deleteImageFromStorage(champ.image);
                }
                await deleteDoc(doc(db, "campeonatos", id));
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">Gestión de Campeonatos</h1>
                    <p className="text-gray-400 text-sm">Cinturones y actuales campeones.</p>
                </div>
                <Link href="/admin/campeonatos/nuevo" className="bg-lnl-red text-white px-4 py-2 rounded font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-red-700 transition-colors">
                    <Plus className="w-5 h-5" /> Nuevo Título
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <p className="text-gray-500">Cargando...</p> : items.map((champ) => (
                    <div key={champ.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex items-center p-4 gap-4 group hover:border-lnl-gold transition-colors">
                        <div className="w-20 h-20 bg-black rounded-full flex-shrink-0 flex items-center justify-center p-2 border border-zinc-700">
                            {champ.image ? <Image src={champ.image} alt={champ.title} width={80} height={80} className="object-contain" /> : <Trophy className="w-8 h-8 text-lnl-gold" />}
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-bold text-white uppercase italic leading-tight mb-1">{champ.title}</h3>
                            <p className="text-gray-400 text-xs uppercase font-bold">Campeón: <span className="text-lnl-gold">{champ.currentChampion}</span></p>
                        </div>
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/campeonatos/${champ.id}`}><Pencil className="w-4 h-4 text-gray-500 hover:text-white" /></Link>
                            <button onClick={() => handleDelete(champ.id, champ.title)}><Trash2 className="w-4 h-4 text-red-500 hover:text-red-400" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
