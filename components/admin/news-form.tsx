"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, addDoc, updateDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Loader2, Save, Upload, ArrowLeft, Wand2, FileText, Search, Eye, ChevronDown, ChevronUp, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { compressImage } from "@/lib/image-compression";
import { removeBackground } from "@imgly/background-removal";
import { SeoPreview } from "./seo-preview";
import { SeoScore } from "./seo-score";
import { TourButton } from "@/components/admin/admin-tour";
import { newsFormTour } from "@/lib/tour-definitions";

// Lazy load rich editor (heavy component)
const RichTextEditor = lazy(() => import("./rich-text-editor").then(mod => ({ default: mod.RichTextEditor })));

interface NewsFormProps {
    id?: string;
}

interface Wrestler {
    id: string;
    name: string;
    nickname?: string;
    image?: string;
}

const CATEGORIES = ["Anuncio", "Resultado", "Entrevista", "Cobertura", "Exclusiva", "Actualización"];

export function NewsForm({ id }: NewsFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [removingBg, setRemovingBg] = useState(false);

    // Basic fields
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        date: new Date().toISOString().split('T')[0],
        category: "Anuncio"
    });

    // SEO fields
    const [seoData, setSeoData] = useState({
        seoTitle: "",
        seoDescription: "",
        keywords: ""
    });

    // Image states
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [currentImageUrl, setCurrentImageUrl] = useState("");

    // UI states
    const [showSeoSection, setShowSeoSection] = useState(true);
    const [autoGenerateSeo, setAutoGenerateSeo] = useState(true);
    const [autoGenerateExcerpt, setAutoGenerateExcerpt] = useState(true);
    const [autoGenerateKeywords, setAutoGenerateKeywords] = useState(true);

    // Wrestler tagging
    const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
    const [relatedWrestlers, setRelatedWrestlers] = useState<string[]>([]);
    const [wrestlerSearch, setWrestlerSearch] = useState("");

    // Auto-save: Load logic
    useEffect(() => {
        if (!id) {
            const savedData = localStorage.getItem("news-form-backup-v2");
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    if (parsed.formData) setFormData(prev => ({ ...prev, ...parsed.formData }));
                    if (parsed.seoData) setSeoData(prev => ({ ...prev, ...parsed.seoData }));
                } catch (e) { console.error(e); }
            }
        }
    }, [id]);

    // Auto-save: Save logic
    useEffect(() => {
        if (!id) {
            const timeout = setTimeout(() => {
                localStorage.setItem("news-form-backup-v2", JSON.stringify({ formData, seoData }));
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [formData, seoData, id]);

    // Fetch existing data
    useEffect(() => {
        if (!id) return;

        async function fetchData() {
            try {
                const docRef = doc(db, "noticias", id!);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        title: data.title || "",
                        slug: data.slug || "",
                        excerpt: data.excerpt || "",
                        content: data.content || "",
                        date: data.date || "",
                        category: data.category || "Anuncio"
                    });
                    setSeoData({
                        seoTitle: data.seoTitle || "",
                        seoDescription: data.seoDescription || "",
                        keywords: data.keywords || ""
                    });
                    if (data.image) {
                        setCurrentImageUrl(data.image);
                        setImagePreview(data.image);
                    }
                    // If SEO data exists, don't auto-generate
                    if (data.seoTitle || data.seoDescription) {
                        setAutoGenerateSeo(false);
                    }
                    // If excerpt exists, don't auto-generate
                    if (data.excerpt) {
                        setAutoGenerateExcerpt(false);
                    }
                    // If keywords exist, don't auto-generate
                    if (data.keywords) {
                        setAutoGenerateKeywords(false);
                    }
                    // Load related wrestlers
                    if (data.relatedWrestlers) {
                        setRelatedWrestlers(data.relatedWrestlers);
                    }
                }
            } catch (error) {
                console.error("Error fetching news:", error);
            } finally {
                setFetching(false);
            }
        }

        fetchData();
    }, [id]);

    // Fetch all wrestlers for tagging
    useEffect(() => {
        async function fetchWrestlers() {
            try {
                const q = query(collection(db, "luchadores"), orderBy("name"));
                const snap = await getDocs(q);
                const data = snap.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || "",
                    nickname: doc.data().nickname || "",
                    image: doc.data().image || ""
                })) as Wrestler[];
                setWrestlers(data);
            } catch (error) {
                console.error("Error fetching wrestlers:", error);
            }
        }
        fetchWrestlers();
    }, []);

    // Auto-generate SEO fields
    useEffect(() => {
        if (!autoGenerateSeo) return;

        setSeoData(prev => ({
            ...prev,
            seoTitle: formData.title.substring(0, 60),
            seoDescription: formData.excerpt || stripHtml(formData.content).substring(0, 155)
        }));
    }, [formData.title, formData.excerpt, formData.content, autoGenerateSeo]);

    // Auto-generate excerpt from content
    useEffect(() => {
        if (!autoGenerateExcerpt || !formData.content) return;

        const plainText = stripHtml(formData.content);
        const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? "..." : "");

        setFormData(prev => ({
            ...prev,
            excerpt
        }));
    }, [formData.content, autoGenerateExcerpt]);

    // Auto-generate keywords from content
    useEffect(() => {
        if (!autoGenerateKeywords || !formData.content) return;

        const keywords = extractKeywords(stripHtml(formData.content), formData.title);
        setSeoData(prev => ({
            ...prev,
            keywords
        }));
    }, [formData.content, formData.title, autoGenerateKeywords]);

    // Helpers
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .substring(0, 80);
    };

    const stripHtml = (html: string) => {
        return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    };

    // Extract keywords from text using frequency analysis
    const extractKeywords = (text: string, title: string): string => {
        const stopWords = new Set([
            "el", "la", "los", "las", "un", "una", "de", "del", "en", "con", "por", "para", "que",
            "se", "su", "sus", "al", "es", "y", "a", "o", "como", "más", "pero", "este", "esta",
            "esto", "ese", "esa", "eso", "ha", "han", "sido", "ser", "será", "desde", "entre",
            "cuando", "sobre", "todo", "también", "nos", "ya", "muy", "sin", "fue", "son", "está",
            "hay", "tiene", "tienen", "hacer", "hace", "cada", "donde", "parte", "después", "bien"
        ]);

        const words = (text + " " + title)
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z\s]/g, "")
            .split(/\s+/)
            .filter(w => w.length > 3 && !stopWords.has(w));

        const freq: Record<string, number> = {};
        words.forEach(w => freq[w] = (freq[w] || 0) + 1);

        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word)
            .join(", ");
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setFormData(prev => ({
            ...prev,
            title: newTitle,
            slug: prev.slug === generateSlug(prev.title) || !prev.slug
                ? generateSlug(newTitle)
                : prev.slug
        }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const compressed = await compressImage(file);
            setImageFile(compressed);
            setImagePreview(URL.createObjectURL(compressed));
        }
    };

    const handleRemoveBackground = async () => {
        if (!imagePreview) return;
        setRemovingBg(true);
        try {
            const response = await fetch(imagePreview);
            const blob = await response.blob();
            const result = await removeBackground(blob);
            const newFile = new File([result], "bg-removed.png", { type: "image/png" });
            setImageFile(newFile);
            setImagePreview(URL.createObjectURL(result));
        } catch (error) {
            console.error("BG Removal error:", error);
            alert("Error al quitar fondo.");
        } finally {
            setRemovingBg(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = currentImageUrl;
            if (imageFile) {
                const storageRef = ref(storage, `news/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            const newsData = {
                ...formData,
                ...seoData,
                relatedWrestlers,
                image: imageUrl,
                updatedAt: new Date()
            };

            if (id) {
                await updateDoc(doc(db, "noticias", id), newsData);
            } else {
                await addDoc(collection(db, "noticias"), {
                    ...newsData,
                    createdAt: new Date()
                });
            }

            // Always clear cache after successful save
            localStorage.removeItem("news-form-backup-v2");

            router.push("/admin/noticias");
            router.refresh();

        } catch (error) {
            console.error("Error saving news:", error);
            alert("Error al guardar noticia.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-white" /></div>;

    const siteUrl = "luchalibrebolivia.com/noticias/" + (formData.slug || "mi-noticia");

    return (
        <form onSubmit={handleSubmit} className="pb-20">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/admin/noticias" className="text-gray-500 hover:text-white flex items-center gap-1 mb-4 text-sm">
                            <ArrowLeft className="w-4 h-4" /> Volver a Noticias
                        </Link>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                            {id ? "Editar Noticia" : "Nueva Noticia"}
                        </h1>
                    </div>
                    <TourButton tourId="news-form" steps={newsFormTour} />
                </div>
            </div>

            {/* Main Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Image & SEO Score */}
                    <div className="space-y-6">
                        {/* Image Upload */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6" data-tour="news-image">
                            <h3 className="text-sm font-bold text-white mb-4 uppercase flex items-center gap-2">
                                <FileText className="w-4 h-4 text-lnl-gold" /> Imagen Destacada
                            </h3>
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800 group">
                                {imagePreview ? (
                                    <>
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover z-10" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                                            <label className="p-2 bg-white text-black rounded-full cursor-pointer hover:bg-gray-200">
                                                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                                <Upload className="w-4 h-4" />
                                            </label>
                                        </div>
                                    </>
                                ) : (
                                    <label className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2 cursor-pointer hover:text-white transition-colors">
                                        <Upload className="w-10 h-10" />
                                        <span className="text-xs font-bold">Subir Imagen</span>
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                )}

                                {removingBg && (
                                    <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center text-white">
                                        <Wand2 className="w-8 h-8 animate-pulse text-purple-400 mb-2" />
                                        <span className="text-xs font-bold uppercase animate-pulse">Quitando fondo...</span>
                                    </div>
                                )}
                            </div>

                            {imagePreview && (
                                <button
                                    type="button"
                                    onClick={handleRemoveBackground}
                                    disabled={removingBg}
                                    className="w-full mt-4 py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50"
                                >
                                    <Wand2 className="w-3 h-3" />
                                    {removingBg ? "Procesando..." : "Quitar Fondo (IA)"}
                                </button>
                            )}
                        </div>

                        {/* SEO Score */}
                        <SeoScore
                            title={formData.title}
                            seoTitle={seoData.seoTitle}
                            seoDescription={seoData.seoDescription}
                            content={formData.content}
                            keywords={seoData.keywords}
                            hasImage={!!imagePreview}
                            slug={formData.slug}
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !formData.title}
                            className="w-full bg-lnl-red text-white py-4 rounded-lg font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {id ? "Guardar Cambios" : "Publicar Noticia"}
                        </button>
                    </div>

                    {/* Right Column: Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-6 bg-lnl-gold rounded"></span>
                                Información Básica
                            </h3>

                            <div data-tour="news-title">
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">
                                    Título <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    placeholder="Título de la noticia"
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold text-lg font-bold"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Slug (URL)</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="mi-noticia"
                                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold font-mono text-sm"
                                    />
                                </div>
                                <div data-tour="news-category">
                                    <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Categoría</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Fecha</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-bold uppercase text-gray-400">
                                        Extracto / Resumen <span className="text-gray-600">({formData.excerpt.length}/150)</span>
                                    </label>
                                    <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={autoGenerateExcerpt}
                                            onChange={(e) => setAutoGenerateExcerpt(e.target.checked)}
                                            className="w-3 h-3 rounded bg-black border-zinc-700"
                                        />
                                        Auto
                                    </label>
                                </div>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => {
                                        setAutoGenerateExcerpt(false);
                                        setFormData({ ...formData, excerpt: e.target.value });
                                    }}
                                    rows={2}
                                    placeholder="Breve resumen de la noticia (aparece en listados y redes)"
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold"
                                />
                            </div>
                        </section>

                        {/* Related Wrestlers */}
                        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-6 bg-purple-500 rounded"></span>
                                <Users className="w-5 h-5 text-purple-500" /> Luchadores Mencionados
                            </h3>

                            {/* Selected wrestlers */}
                            {relatedWrestlers.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {relatedWrestlers.map(wrestlerId => {
                                        const wrestler = wrestlers.find(w => w.id === wrestlerId);
                                        if (!wrestler) return null;
                                        return (
                                            <div
                                                key={wrestlerId}
                                                className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/50 rounded-full pl-1 pr-2 py-1"
                                            >
                                                <div className="w-6 h-6 relative rounded-full overflow-hidden bg-zinc-700">
                                                    {wrestler.image && (
                                                        <Image src={wrestler.image} alt="" fill className="object-cover" sizes="24px" />
                                                    )}
                                                </div>
                                                <span className="text-sm text-white">{wrestler.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setRelatedWrestlers(relatedWrestlers.filter(id => id !== wrestlerId))}
                                                    className="text-purple-300 hover:text-white"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Search input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={wrestlerSearch}
                                    onChange={(e) => setWrestlerSearch(e.target.value)}
                                    placeholder="Buscar luchadores para etiquetar..."
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-purple-500"
                                />
                            </div>

                            {/* Wrestler list */}
                            {wrestlerSearch && (
                                <div className="max-h-48 overflow-y-auto bg-black border border-zinc-700 rounded-lg divide-y divide-zinc-800">
                                    {wrestlers
                                        .filter(w =>
                                            w.name.toLowerCase().includes(wrestlerSearch.toLowerCase()) &&
                                            !relatedWrestlers.includes(w.id)
                                        )
                                        .slice(0, 8)
                                        .map(wrestler => (
                                            <button
                                                key={wrestler.id}
                                                type="button"
                                                onClick={() => {
                                                    setRelatedWrestlers([...relatedWrestlers, wrestler.id]);
                                                    setWrestlerSearch("");
                                                }}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800 transition-colors text-left"
                                            >
                                                <div className="w-8 h-8 relative rounded-full overflow-hidden bg-zinc-700 flex-shrink-0">
                                                    {wrestler.image && (
                                                        <Image src={wrestler.image} alt="" fill className="object-cover" sizes="32px" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{wrestler.name}</p>
                                                    {wrestler.nickname && (
                                                        <p className="text-xs text-gray-500">{wrestler.nickname}</p>
                                                    )}
                                                </div>
                                            </button>
                                        ))
                                    }
                                    {wrestlers.filter(w =>
                                        w.name.toLowerCase().includes(wrestlerSearch.toLowerCase()) &&
                                        !relatedWrestlers.includes(w.id)
                                    ).length === 0 && (
                                            <p className="p-3 text-gray-500 text-sm">No se encontraron luchadores</p>
                                        )}
                                </div>
                            )}

                            {relatedWrestlers.length === 0 && !wrestlerSearch && (
                                <p className="text-sm text-gray-500">Escribe para buscar y etiquetar luchadores mencionados en esta noticia.</p>
                            )}
                        </section>

                        {/* Content Editor */}
                        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4" data-tour="news-content">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-6 bg-lnl-red rounded"></span>
                                Contenido
                            </h3>

                            <Suspense fallback={
                                <div className="bg-black rounded-lg p-4 min-h-[300px] flex items-center justify-center text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando editor...
                                </div>
                            }>
                                <RichTextEditor
                                    content={formData.content}
                                    onChange={(html) => setFormData({ ...formData, content: html })}
                                    placeholder="Escribe el contenido de la noticia..."
                                />
                            </Suspense>
                        </section>

                        {/* SEO Section */}
                        <section className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setShowSeoSection(!showSeoSection)}
                                className="w-full p-4 flex items-center justify-between text-white hover:bg-zinc-800/50 transition-colors"
                            >
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Search className="w-5 h-5 text-lnl-gold" /> SEO y Redes Sociales
                                </h3>
                                {showSeoSection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>

                            {showSeoSection && (
                                <div className="p-6 pt-0 space-y-6">
                                    {/* Auto-generate toggle */}
                                    <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={autoGenerateSeo}
                                            onChange={(e) => setAutoGenerateSeo(e.target.checked)}
                                            className="w-4 h-4 rounded bg-black border-zinc-700"
                                        />
                                        Auto-generar desde el contenido
                                    </label>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-400 block mb-1">
                                                Título SEO <span className="text-gray-600">({seoData.seoTitle.length}/60)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={seoData.seoTitle}
                                                onChange={(e) => {
                                                    setAutoGenerateSeo(false);
                                                    setSeoData({ ...seoData, seoTitle: e.target.value });
                                                }}
                                                maxLength={70}
                                                placeholder="Título optimizado para Google"
                                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-400 block mb-1">
                                                Meta Descripción <span className="text-gray-600">({seoData.seoDescription.length}/155)</span>
                                            </label>
                                            <textarea
                                                value={seoData.seoDescription}
                                                onChange={(e) => {
                                                    setAutoGenerateSeo(false);
                                                    setSeoData({ ...seoData, seoDescription: e.target.value });
                                                }}
                                                maxLength={160}
                                                rows={2}
                                                placeholder="Descripción que aparece en Google"
                                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-xs font-bold uppercase text-gray-400">
                                                    Palabras Clave
                                                </label>
                                                <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={autoGenerateKeywords}
                                                        onChange={(e) => setAutoGenerateKeywords(e.target.checked)}
                                                        className="w-3 h-3 rounded bg-black border-zinc-700"
                                                    />
                                                    Auto
                                                </label>
                                            </div>
                                            <input
                                                type="text"
                                                value={seoData.keywords}
                                                onChange={(e) => {
                                                    setAutoGenerateKeywords(false);
                                                    setSeoData({ ...seoData, keywords: e.target.value });
                                                }}
                                                placeholder="lucha libre, bolivia, evento (separadas por comas)"
                                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold"
                                            />
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                            <Eye className="w-4 h-4" /> Vista Previa
                                        </h4>
                                        <SeoPreview
                                            title={seoData.seoTitle || formData.title}
                                            description={seoData.seoDescription || formData.excerpt}
                                            url={siteUrl}
                                            image={imagePreview}
                                        />
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </form>
    );
}
