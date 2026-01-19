"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteImageFromStorage } from "@/lib/storage-utils";
import Link from "next/link";
import { Plus, Trash2, Pencil } from "lucide-react";
import Image from "next/image";

import { DocumentData } from "firebase/firestore";

interface GalleryItem extends DocumentData {
    id: string;
    title: string;
    category: string;
    image?: string;
}

export default function GalleryAdminPage() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "galeria_items"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryItem[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("¿Eliminar imagen?")) {
            try {
                const item = items.find(i => i.id === id);
                if (item?.image) {
                    await deleteImageFromStorage(item.image);
                }
                await deleteDoc(doc(db, "galeria_items", id));
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">Gestión Multimedia</h1>
                    <p className="text-gray-400 text-sm">Galería de fotos HD.</p>
                </div>
                <Link href="/admin/galeria/nueva" className="bg-lnl-red text-white px-4 py-2 rounded font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-red-700 transition-colors">
                    <Plus className="w-5 h-5" /> Nueva Imagen
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {loading ? <p className="text-gray-500">Cargando...</p> : items.map((item) => (
                    <div key={item.id} className="group relative aspect-square bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-lnl-gold transition-all">
                        {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                            <p className="text-white font-bold text-xs truncate">{item.title}</p>
                            <p className="text-lnl-gold text-[10px] uppercase font-bold mb-2">{item.category}</p>
                            <div className="flex justify-end gap-2">
                                <Link href={`/admin/galeria/${item.id}`} className="text-gray-300 hover:text-white p-1"><Pencil className="w-4 h-4" /></Link>
                                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
