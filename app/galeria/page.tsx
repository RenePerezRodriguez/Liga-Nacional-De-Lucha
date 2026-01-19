"use client";

import Image from "next/image";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface GalleryItem extends DocumentData {
    id: string;
    title?: string;
    category?: string;
    image?: string;
    createdAt?: { seconds: number; nanoseconds: number } | Date; // Firestore Timestamp
}

export default function GalleryPage() {
    const [photos, setPhotos] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "galeria_items"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPhotos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryItem[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-black pb-20">
            <div className="py-10 md:py-12 mb-8 md:mb-10 text-center">
                <h1 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-4">
                    Galería <span className="text-lnl-red">HD</span>
                </h1>
                <p className="text-gray-400 text-sm md:text-base">Revive los mejores momentos de la LNL.</p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="text-center text-gray-500 py-20">Cargando fotos...</div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                        {photos.map((photo) => (
                            <div key={photo.id} className="relative group break-inside-avoid rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                                <div className="relative aspect-auto">
                                    {photo.image && (
                                        <Image
                                            src={photo.image}
                                            alt={photo.title || "Foto LNL"}
                                            width={600}
                                            height={400}
                                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        {photo.image && (
                                            <a href={photo.image} target="_blank" download className="p-3 bg-white text-black rounded-full hover:bg-lnl-gold transition-colors">
                                                <Download className="w-6 h-6" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white font-bold text-sm">{photo.title}</p>
                                        <p className="text-lnl-gold text-xs uppercase">{photo.category}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
