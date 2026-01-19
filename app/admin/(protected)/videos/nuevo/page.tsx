"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/toast-provider";
import { ArrowLeft, Youtube, Save, Link as LinkIcon, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { extractYoutubeId, getYoutubeThumbnail, fetchYoutubeMetadata } from "@/lib/youtube-utils";
import { TourButton } from "@/components/admin/admin-tour";
import { videoFormTour } from "@/lib/tour-definitions";

export default function NewVideoPage() {
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [form, setForm] = useState({
        title: "",
        youtubeUrl: "",
        duration: "",
        views: "",
        date: ""
    });

    const handleUrlChange = async (url: string) => {
        setForm(prev => ({ ...prev, youtubeUrl: url }));

        // Auto-fetch metadata when URL is valid
        const videoId = extractYoutubeId(url);
        if (videoId && url.length > 20) {
            setFetching(true);
            try {
                const metadata = await fetchYoutubeMetadata(url);
                if (metadata) {
                    setForm(prev => ({
                        ...prev,
                        title: prev.title || metadata.title,
                        date: metadata.uploadDate || prev.date
                    }));
                    if (metadata.title) {
                        toast.success("✨ Datos obtenidos de YouTube");
                    }
                }
            } catch (error) {
                console.error("Error fetching metadata:", error);
            } finally {
                setFetching(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const thumbnail = getYoutubeThumbnail(form.youtubeUrl);
            await addDoc(collection(db, "videos"), {
                ...form,
                thumbnail,
                createdAt: serverTimestamp()
            });
            toast.success("Video guardado correctamente");
            router.push("/admin/videos");
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar el video");
        }
        setLoading(false);
    };

    const thumbnail = getYoutubeThumbnail(form.youtubeUrl);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <Link href="/admin/videos" className="inline-flex items-center gap-2 text-gray-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4" /> Volver a Videos
                </Link>
                <TourButton tourId="video-form" steps={videoFormTour} />
            </div>

            <h1 className="text-3xl font-black text-white uppercase italic tracking-tight mb-8 flex items-center gap-3">
                <Youtube className="text-red-600" /> Nuevo Video
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                {/* YouTube URL - Primary Input */}
                <div data-tour="video-url">
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                        URL de YouTube <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="url"
                            required
                            value={form.youtubeUrl}
                            onChange={(e) => handleUrlChange(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 pl-10 text-white focus:border-lnl-red focus:outline-none"
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                        {fetching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-5 h-5 text-lnl-red animate-spin" />
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        El título se obtiene automáticamente al pegar la URL
                    </p>

                    {/* Thumbnail Preview */}
                    {thumbnail && (
                        <div className="mt-4 relative aspect-video bg-zinc-800 rounded-lg overflow-hidden">
                            <Image src={thumbnail} alt="Thumbnail" fill className="object-cover" unoptimized />
                            {fetching && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="text-center">
                                        <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                                        <span className="text-white text-sm">Obteniendo datos...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Title - Auto-filled but editable */}
                <div data-tour="video-title">
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Título del Video
                        {form.title && <span className="text-green-500 ml-2 text-xs normal-case">✓ Auto-detectado</span>}
                    </label>
                    <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-lnl-red focus:outline-none"
                        placeholder="Se auto-completa al pegar URL..."
                    />
                </div>

                {/* Optional Fields - Duration, Views, Date */}
                <div className="border-t border-zinc-800 pt-6">
                    <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider">
                        Campos opcionales (se muestran en la tarjeta del video)
                    </p>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Duración</label>
                            <input
                                type="text"
                                value={form.duration}
                                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-lnl-red focus:outline-none text-sm"
                                placeholder="2:15:30"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Vistas</label>
                            <input
                                type="text"
                                value={form.views}
                                onChange={(e) => setForm({ ...form, views: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-lnl-red focus:outline-none text-sm"
                                placeholder="15k"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Fecha</label>
                            <input
                                type="text"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-lnl-red focus:outline-none text-sm"
                                placeholder="Hace 2 sem"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !form.youtubeUrl}
                    className="w-full bg-lnl-red text-white font-bold uppercase tracking-wider py-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {loading ? "Guardando..." : "Guardar Video"}
                </button>
            </form>
        </div>
    );
}
