"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteImageFromStorage } from "@/lib/storage-utils";
import { useToast } from "@/components/ui/toast-provider";
import Link from "next/link";
import { Plus, Trash2, Pencil, Handshake, Search } from "lucide-react";
import Image from "next/image";

interface Sponsor extends DocumentData {
    id: string;
    name: string;
    type?: string;
    logo?: string;
    description?: string;
    website?: string;
}

export default function SponsorsAdminPage() {
    const [items, setItems] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const toast = useToast();

    useEffect(() => {
        const q = query(collection(db, "auspiciadores"), orderBy("name"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Sponsor[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`¿Eliminar auspiciador: ${name}?`)) {
            try {
                const item = items.find(s => s.id === id);
                if (item?.logo) {
                    await deleteImageFromStorage(item.logo);
                }
                await deleteDoc(doc(db, "auspiciadores", id));
                toast.success("Auspiciador eliminado correctamente");
            } catch (e) {
                console.error(e);
                toast.error("Error al eliminar el auspiciador");
            }
        }
    };

    const filteredItems = items.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">Gestión de Auspiciadores</h1>
                    <p className="text-gray-400 text-sm">Patrocinadores y aliados oficiales.</p>
                </div>
                <Link href="/admin/auspiciadores/nuevo" className="bg-lnl-red text-white px-4 py-2 rounded font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-red-700 transition-colors">
                    <Plus className="w-5 h-5" /> Nuevo Auspiciador
                </Link>
            </div>

            {/* Search */}
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o tipo..."
                        className="w-full bg-black border border-zinc-700 rounded-lg py-2 pl-9 pr-4 text-white focus:outline-none focus:border-lnl-gold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <p className="text-gray-500">Cargando...</p> : filteredItems.map((item) => (
                    <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-6 flex flex-col items-center text-center group hover:border-lnl-gold transition-colors">
                        <div className="w-24 h-24 relative mb-4 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700">
                            {item.logo ? (
                                <Image src={item.logo} alt={item.name} fill className="object-contain p-2" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Handshake className="w-8 h-8 text-zinc-600" />
                                </div>
                            )}
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1">{item.name}</h3>
                        <span className="text-lnl-gold text-xs uppercase tracking-wider font-bold mb-4">{item.type || "Partner"}</span>
                        <div className="flex gap-2">
                            <Link href={`/admin/auspiciadores/editar/${item.id}`} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-white">
                                <Pencil className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleDelete(item.id, item.name)} className="p-2 bg-zinc-800 rounded hover:bg-red-600 text-white">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && filteredItems.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <Handshake className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
                    <p>{searchTerm ? "No se encontraron auspiciadores." : "No hay auspiciadores. Agrega uno para empezar."}</p>
                </div>
            )}
        </div>
    );
}
