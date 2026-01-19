"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteImageFromStorage } from "@/lib/storage-utils";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";

interface NewsItem extends DocumentData {
    id: string;
    title: string;
    date: string;
    category: string;
    image?: string;
}

export default function NewsAdminPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "noticias"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NewsItem[];
            setNews(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (confirm(`¿Eliminar noticia: ${title}?`)) {
            try {
                const item = news.find(n => n.id === id);
                if (item?.image) {
                    await deleteImageFromStorage(item.image);
                }
                await deleteDoc(doc(db, "noticias", id));
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">Gestión de Noticias</h1>
                    <p className="text-gray-400 text-sm">Blog, Anuncios y Resultados.</p>
                </div>
                <Link href="/admin/noticias/nueva" className="bg-lnl-red text-white px-4 py-2 rounded font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-red-700 transition-colors">
                    <Plus className="w-5 h-5" /> Nueva Noticia
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? <p className="text-gray-500">Cargando...</p> : news.map((item) => (
                    <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-4 items-center group hover:border-zinc-700 transition-all">
                        <div className="w-24 h-16 bg-black rounded relative overflow-hidden flex-shrink-0">
                            {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
                        </div>
                        <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase text-lnl-gold px-2 py-0.5 bg-yellow-900/20 rounded border border-yellow-900/30">{item.category}</span>
                                <span className="text-xs text-gray-500">{item.date}</span>
                            </div>
                            <h3 className="font-bold text-white text-lg leading-tight">{item.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/noticias/${item.id}`} className="p-2 hover:bg-zinc-800 rounded text-gray-400 hover:text-white"><Pencil className="w-4 h-4" /></Link>
                            <button onClick={() => handleDelete(item.id, item.title)} className="p-2 hover:bg-zinc-800 rounded text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
                {!loading && news.length === 0 && <p className="text-gray-500">Sin noticias publicadas.</p>}
            </div>
        </div>
    );
}
