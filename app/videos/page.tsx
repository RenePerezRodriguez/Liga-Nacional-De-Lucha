"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Youtube, Play, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Video extends DocumentData {
    id: string;
    title: string;
    youtubeUrl: string;
    thumbnail?: string;
    duration?: string;
    views?: string;
    date?: string;
}

function extractYoutubeId(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
}

export default function VideosPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

    useEffect(() => {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Video[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-black pb-20">
            {/* Hero */}
            <div className="py-10 md:py-16 text-center bg-gradient-to-b from-zinc-900 to-black">
                <h1 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-4">
                    <span className="text-red-600">Videos</span> LNL
                </h1>
                <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto px-4">
                    Revive los mejores momentos, luchas completas y contenido exclusivo de la Liga Nacional de Lucha.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-20">
                        <Youtube className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No hay videos disponibles.</p>
                    </div>
                ) : (
                    <>
                        {/* Featured Video (first one) */}
                        {videos.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-xl font-bold text-white uppercase mb-4 flex items-center gap-2">
                                    <Play className="w-5 h-5 text-red-600" /> Video Destacado
                                </h2>
                                <div
                                    className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 cursor-pointer group"
                                    onClick={() => setSelectedVideo(videos[0])}
                                >
                                    {videos[0].thumbnail ? (
                                        <Image
                                            src={videos[0].thumbnail}
                                            alt={videos[0].title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Youtube className="w-20 h-20 text-red-600" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                                        <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                                            <Play className="w-10 h-10 text-white ml-1" fill="white" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                                        <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic">{videos[0].title}</h3>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                            {videos[0].duration && <span>{videos[0].duration}</span>}
                                            {videos[0].views && <span>{videos[0].views}</span>}
                                            {videos[0].date && <span>{videos[0].date}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Video Grid */}
                        {videos.length > 1 && (
                            <>
                                <h2 className="text-xl font-bold text-white uppercase mb-4">Más Videos</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {videos.slice(1).map((video) => (
                                        <div
                                            key={video.id}
                                            className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-red-600 transition-colors cursor-pointer group"
                                            onClick={() => setSelectedVideo(video)}
                                        >
                                            <div className="relative aspect-video">
                                                {video.thumbnail ? (
                                                    <Image src={video.thumbnail} alt={video.title} fill className="object-cover" unoptimized />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                                                        <Youtube className="w-12 h-12 text-red-600" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center">
                                                        <Play className="w-7 h-7 text-white ml-0.5" fill="white" />
                                                    </div>
                                                </div>
                                                {video.duration && (
                                                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
                                                        {video.duration}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-white font-bold text-sm line-clamp-2 mb-2">{video.title}</h3>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    {video.views && <span>{video.views}</span>}
                                                    {video.date && <span>{video.date}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedVideo(null)}
                >
                    <div className="w-full max-w-5xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">{selectedVideo.title}</h3>
                            <div className="flex items-center gap-4">
                                <a
                                    href={selectedVideo.youtubeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-red-500 hover:text-red-400 flex items-center gap-1 text-sm"
                                >
                                    <ExternalLink className="w-4 h-4" /> Ver en YouTube
                                </a>
                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="text-gray-400 hover:text-white text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <div className="aspect-video bg-black rounded-xl overflow-hidden">
                            <iframe
                                src={`https://www.youtube.com/embed/${extractYoutubeId(selectedVideo.youtubeUrl)}?autoplay=1`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
