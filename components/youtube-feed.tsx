"use client";

import { useEffect, useState } from "react";
import { PlayCircle, Youtube } from "lucide-react";
import { collection, onSnapshot, query, orderBy, limit, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Video extends DocumentData {
    id: string;
    title: string;
    youtubeUrl: string;
    thumbnail?: string;
    duration?: string;
    views?: string;
    date?: string;
}

// Extract YouTube video ID from URL
function getYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
}

export function YouTubeFeed() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"), limit(3));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Video[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <section className="bg-zinc-900 py-10 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                    Cargando videos...
                </div>
            </section>
        );
    }

    if (videos.length === 0) {
        return null;
    }

    return (
        <section className="bg-zinc-900 py-10 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <span className="text-red-600 font-bold uppercase tracking-widest text-sm block mb-2">LNL Network</span>
                        <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-white">Últimos Videos</h2>
                    </div>
                    <a href="https://youtube.com/@LNLBolivia" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold uppercase text-xs md:text-sm">
                        <Youtube className="w-4 h-4" /> Visitar Canal
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {videos.map((video) => {
                        const videoId = getYouTubeId(video.youtubeUrl);
                        const isPlaying = activeVideo === video.id;

                        return (
                            <div key={video.id} className="group">
                                <div className="relative aspect-video bg-zinc-800 rounded-xl overflow-hidden mb-3 border border-zinc-700 group-hover:border-lnl-red transition-all shadow-lg">
                                    {isPlaying && videoId ? (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                            className="absolute inset-0 w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <button
                                            onClick={() => setActiveVideo(video.id)}
                                            className="w-full h-full relative"
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                                <PlayCircle className="w-16 h-16 text-white/80 group-hover:text-lnl-red group-hover:scale-110 transition-all drop-shadow-lg" />
                                            </div>
                                            {video.thumbnail ? (
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.title}
                                                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-70 transition-opacity"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-zinc-800" />
                                            )}
                                            {video.duration && (
                                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded z-10">
                                                    {video.duration}
                                                </div>
                                            )}
                                        </button>
                                    )}
                                </div>
                                <h3 className="text-white font-bold leading-tight mb-1 group-hover:text-lnl-gold transition-colors">{video.title}</h3>
                                <div className="text-gray-500 text-xs flex gap-2">
                                    {video.views && <span>{video.views}</span>}
                                    {video.views && video.date && <span>•</span>}
                                    {video.date && <span>{video.date}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
