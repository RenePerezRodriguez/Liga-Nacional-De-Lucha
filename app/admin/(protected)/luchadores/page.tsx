"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteImageFromStorage } from "@/lib/storage-utils";
import { useToast } from "@/components/ui/toast-provider";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

interface Wrestler extends DocumentData {
    id: string;
    name: string;
    nickname?: string;
    image?: string;
    alignment?: string;
}

export default function WrestlersAdminPage() {
    const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const toast = useToast();

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

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`¿Estás seguro de eliminar a ${name}? Esta acción no se puede deshacer.`)) {
            try {
                // Find the wrestler to get their image URL
                const wrestler = wrestlers.find(w => w.id === id);
                if (wrestler?.image) {
                    await deleteImageFromStorage(wrestler.image);
                }
                await deleteDoc(doc(db, "luchadores", id));
                toast.success(`${name} eliminado correctamente`);
            } catch (error) {
                console.error("Error deleting wrestler:", error);
                toast.error("Error al eliminar el luchador");
            }
        }
    };

    const filteredWrestlers = wrestlers.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">Gestión de Roster</h1>
                    <p className="text-gray-400 text-sm">Administra los perfiles de tus superestrellas.</p>
                </div>
                <Link
                    href="/admin/luchadores/nuevo"
                    className="bg-lnl-red text-white px-4 py-2 rounded font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-red-700 transition-colors self-start md:self-auto"
                >
                    <Plus className="w-5 h-5" /> Nuevo Luchador
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o apodo..."
                        className="w-full bg-black border border-zinc-700 rounded-lg py-2 pl-9 pr-4 text-white focus:outline-none focus:border-lnl-gold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/50 border-b border-zinc-800 text-xs text-gray-400 font-bold uppercase tracking-wider">
                                <th className="p-4">Avatar</th>
                                <th className="p-4">Nombre / Apodo</th>
                                <th className="p-4">Bando</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">Cargando roster...</td>
                                </tr>
                            ) : filteredWrestlers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">No se encontraron luchadores.</td>
                                </tr>
                            ) : (
                                filteredWrestlers.map((wrestler, index) => (
                                    <tr key={wrestler.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="w-12 h-12 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700 relative">
                                                {wrestler.image ? (
                                                    <Image
                                                        src={wrestler.image}
                                                        alt={wrestler.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="48px"
                                                        priority={index < 10}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-bold">Sin Foto</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <h3 className="text-white font-bold">{wrestler.name}</h3>
                                            <p className="text-gray-500 text-xs italic">{wrestler.nickname}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${wrestler.alignment === 'face'
                                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}>
                                                {wrestler.alignment === 'face' ? 'Técnico' : 'Rudo'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/admin/luchadores/${wrestler.id}`} className="p-2 bg-zinc-800 rounded hover:bg-white hover:text-black transition-colors">
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(wrestler.id, wrestler.name)} className="p-2 bg-zinc-800 rounded hover:bg-red-600 hover:text-white transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
