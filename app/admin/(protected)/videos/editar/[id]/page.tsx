"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/toast-provider";
import { ArrowLeft, Youtube, Save, Link as LinkIcon, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { extractYoutubeId, getYoutubeThumbnail, fetchYoutubeMetadata } from "@/lib/youtube-utils";

export default function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [form, setForm] = useState({
        title: "",
        youtubeUrl: "",
        duration: "",
        views: "",
        date: ""
    });

    useEffect(() => {
        async function fetchVideo() {
            try {
                const docRef = doc(db, "videos", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setForm({
                        title: data.title || "",
                        youtubeUrl: data.youtubeUrl || "",
                        duration: data.duration || "",
                        views: data.views || "",
                        date: data.date || ""
                    });
                } else {
                    toast.error("Video no encontrado");
                    router.push("/admin/videos");
                }
            } catch (error) {
                console.error("Error fetching video:", error);
                toast.error("Error al cargar el video");
            } finally {
                setLoading(false);
            }
        }
        fetchVideo();
    }, [id, router, toast]);

    const handleUrlChange = async (url: string) => {
        setForm(prev => ({ ...prev, youtubeUrl: url }));

        const videoId = extractYoutubeId(url);
        if (videoId && url.length > 20) {
            setFetching(true);
            try {
                const metadata = await fetchYoutubeMetadata(url);
                if (metadata && metadata.title) {
                    setForm(prev => ({
                        ...prev,
                        title: metadata.title,
                        date: metadata.uploadDate || prev.date
                    }));
                    toast.success("✨ Datos actualizados de YouTube");
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
        setSaving(true);
        try {
            const thumbnail = getYoutubeThumbnail(form.youtubeUrl);
            await updateDoc(doc(db, "videos", id), {
                ...form,
                thumbnail,
                updatedAt: serverTimestamp()
            });
            toast.success("Video actualizado correctamente");
            router.push("/admin/videos");
        } catch (error) {
            console.error("Error updating video:", error);
            toast.error("Error al actualizar el video");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 animate-spin text-lnl-red" />
            </div>
        );
    }

    const thumbnail = getYoutubeThumbnail(form.youtubeUrl);

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/admin/videos" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4" /> Volver a Videos
            </Link>

            <h1 className="text-3xl font-black text-white uppercase italic tracking-tight mb-8 flex items-center gap-3">
                <Youtube className="text-red-600" /> Editar Video
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                {/* YouTube URL */}
                <div>
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
                        Cambia la URL para actualizar automáticamente el título
                    </p>

                    {thumbnail && (
                        <div className="mt-4 relative aspect-video bg-zinc-800 rounded-lg overflow-hidden">
                            <Image src={thumbnail} alt="Thumbnail" fill className="object-cover" unoptimized />
                            {fetching && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Título del Video</label>
                    <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-lnl-red focus:outline-none"
                        placeholder="Título del video"
                    />
                </div>

                {/* Optional Fields */}
                <div className="border-t border-zinc-800 pt-6">
                    <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider">
                        Campos opcionales
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
                    disabled={saving}
                    className="w-full bg-lnl-red text-white font-bold uppercase tracking-wider py-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
            </form>
        </div>
    );
}
