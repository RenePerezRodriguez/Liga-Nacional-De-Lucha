"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteImageFromStorage } from "@/lib/storage-utils";
import { useToast } from "@/components/ui/toast-provider";
import Link from "next/link";
import { Plus, Trash2, Pencil, Youtube, ExternalLink, Search } from "lucide-react";
import Image from "next/image";

interface Video extends DocumentData {
    id: string;
    title: string;
    youtubeUrl: string;
    thumbnail?: string;
    duration?: string;
    views?: string;
    date?: string;
}

export default function VideosAdminPage() {
    const [items, setItems] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const toast = useToast();

    useEffect(() => {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Video[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (confirm(`¿Eliminar video: ${title}?`)) {
            try {
                const item = items.find(v => v.id === id);
                if (item?.thumbnail) {
                    await deleteImageFromStorage(item.thumbnail);
                }
                await deleteDoc(doc(db, "videos", id));
                toast.success("Video eliminado correctamente");
            } catch (e) {
                console.error(e);
                toast.error("Error al eliminar el video");
            }
        }
    };

    const filteredItems = items.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">Gestión de Videos</h1>
                    <p className="text-gray-400 text-sm">Videos de YouTube para mostrar en el sitio.</p>
                </div>
                <Link href="/admin/videos/nuevo" className="bg-lnl-red text-white px-4 py-2 rounded font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-red-700 transition-colors">
                    <Plus className="w-5 h-5" /> Nuevo Video
                </Link>
            </div>

            {/* Search */}
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar videos por título..."
                        className="w-full bg-black border border-zinc-700 rounded-lg py-2 pl-9 pr-4 text-white focus:outline-none focus:border-lnl-red"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <p className="text-gray-500">Cargando...</p> : filteredItems.map((item) => (
                    <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group hover:border-lnl-red transition-colors">
                        <div className="relative aspect-video bg-zinc-800">
                            {item.thumbnail ? (
                                <Image src={item.thumbnail} alt={item.title} fill className="object-cover" unoptimized />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Youtube className="w-12 h-12 text-red-600" />
                                </div>
                            )}
                            {item.duration && (
                                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">{item.duration}</span>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">{item.title}</h3>
                            <div className="flex items-center justify-between">
                                <a href={item.youtubeUrl} target="_blank" rel="noreferrer" className="text-red-500 text-xs flex items-center gap-1 hover:text-red-400">
                                    <ExternalLink className="w-3 h-3" /> Ver en YouTube
                                </a>
                                <div className="flex gap-2">
                                    <Link href={`/admin/videos/editar/${item.id}`} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-white">
                                        <Pencil className="w-4 h-4" />
                                    </Link>
                                    <button onClick={() => handleDelete(item.id, item.title)} className="p-2 bg-zinc-800 rounded hover:bg-red-600 text-white">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && filteredItems.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <Youtube className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
                    <p>{searchTerm ? "No se encontraron videos." : "No hay videos. Agrega uno para empezar."}</p>
                </div>
            )}
        </div>
    );
}
