"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, addDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Loader2, Save, Upload, X, ArrowLeft, Music, Video, Plus, Trophy, Trash2, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { compressImage } from "@/lib/image-compression";
import { removeBackground } from "@imgly/background-removal";
import { TourButton } from "@/components/admin/admin-tour";
import { wrestlerFormTour } from "@/lib/tour-definitions";

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface WrestlerFormProps {
    id?: string; // If present, edit mode
}

interface Championship {
    id: string;
    title: string;
    image?: string;
}

export function WrestlerForm({ id }: WrestlerFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    // Auto-save logic
    const [availableChampionships, setAvailableChampionships] = useState<Championship[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        nickname: "",
        alignment: "face",
        bio: "",
        entranceTheme: "", // YouTube URL
        videoHighlight: "", // YouTube URL
        stats: {
            height: "",
            weight: "",
            hometown: "",
            finisher: "",
            signatures: [] as string[] // Array of signature moves
        },
        socials: {
            instagram: "",
            twitter: ""
        },
        championships: [] as string[], // Array of Championship IDs
        // Ranking fields
        rankingPoints: 0,
        rankingMovement: "same" as "up" | "down" | "same",
        rankingReason: "",
        isFeatured: false
    });

    const [imageFile, setImageFile] = useState<File | null>(null);

    // Auto-save logic
    useEffect(() => {
        if (!id) {
            const savedData = localStorage.getItem("wrestlerFormBackup");
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    setFormData(prev => ({ ...prev, ...parsed }));
                    console.log("Restored backup from localStorage");
                } catch (e) {
                    console.error("Failed to parse backup", e);
                }
            }
        }
    }, [id]);

    useEffect(() => {
        if (!id && formData.name) {
            localStorage.setItem("wrestlerFormBackup", JSON.stringify(formData));
        }
    }, [formData, id]);

    const [imagePreview, setImagePreview] = useState<string>("");
    const [currentImageUrl, setCurrentImageUrl] = useState("");
    const [removingBg, setRemovingBg] = useState(false);

    // Auxiliary state for adding a signature move
    const [newSignature, setNewSignature] = useState("");

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // 1. Fetch available championships
                const champsSnapshot = await getDocs(collection(db, "campeonatos"));
                const champs = champsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    title: doc.data().title,
                    image: doc.data().image
                }));
                setAvailableChampionships(champs);

                // 2. If editing, fetch wrestler data
                if (id) {
                    const docRef = doc(db, "luchadores", id);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setFormData({
                            name: data.name || "",
                            slug: data.slug || "",
                            nickname: data.nickname || "",
                            alignment: data.alignment || "face",
                            bio: data.bio || "",
                            entranceTheme: data.entranceTheme || "",
                            videoHighlight: data.videoHighlight || "",
                            stats: {
                                height: data.stats?.height || "",
                                weight: data.stats?.weight || "",
                                hometown: data.stats?.hometown || "",
                                finisher: data.stats?.finisher || "",
                                signatures: data.stats?.signatures || []
                            },
                            socials: {
                                instagram: data.socials?.instagram || "",
                                twitter: data.socials?.twitter || ""
                            },
                            championships: data.championships || [],
                            // Ranking fields
                            rankingPoints: data.rankingPoints || 0,
                            rankingMovement: data.rankingMovement || "same",
                            rankingReason: data.rankingReason || "",
                            isFeatured: data.isFeatured || false
                        });
                        if (data.image) {
                            setCurrentImageUrl(data.image);
                            setImagePreview(data.image);
                        }
                    } else {
                        alert("Luchador no encontrado");
                        router.push("/admin/luchadores");
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setFetching(false);
            }
        };

        loadInitialData();
    }, [id, router]);

    // Helper: Auto-generate slug
    const generateSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-');
    };

    // Helper: Add Signature Move
    const addSignature = () => {
        if (!newSignature.trim()) return;
        setFormData({
            ...formData,
            stats: {
                ...formData.stats,
                signatures: [...formData.stats.signatures, newSignature.trim()]
            }
        });
        setNewSignature("");
    };

    // Helper: Remove Signature Move
    const removeSignature = (index: number) => {
        const newSignatures = [...formData.stats.signatures];
        newSignatures.splice(index, 1);
        setFormData({
            ...formData,
            stats: { ...formData.stats, signatures: newSignatures }
        });
    };

    // Helper: Toggle Championship
    const toggleChampionship = (champId: string) => {
        const currentChamps = [...formData.championships];
        if (currentChamps.includes(champId)) {
            setFormData({ ...formData, championships: currentChamps.filter(id => id !== champId) });
        } else {
            setFormData({ ...formData, championships: [...currentChamps, champId] });
        }
    };


    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const compressed = await compressImage(file);
                setImageFile(compressed);
                setImagePreview(URL.createObjectURL(compressed));
            } catch (err) {
                console.error("Error compressing image, using original:", err);
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
            }
        }
    };

    const handleRemoveBackground = async () => {
        if (!imageFile) return;
        setRemovingBg(true);
        try {
            // 1. Remove background -> returns Blob
            const blob = await removeBackground(imageFile);

            // 2. Convert Blob to File
            const processedFile = new File([blob], imageFile.name.replace(/\.[^/.]+$/, "") + "_nobg.png", { type: "image/png" });

            // 3. Compress/Convert to WebP (preserving transparency)
            const compressed = await compressImage(processedFile);

            // 4. Update State
            setImageFile(compressed);
            setImagePreview(URL.createObjectURL(compressed));
            alert("¡Fondo eliminado con éxito! ✨");
        } catch (error) {
            console.error("Error removing background:", error);
            alert("Error al eliminar el fondo. Intenta con otra imagen.");
        } finally {
            setRemovingBg(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = currentImageUrl;

            // Upload Image if changed
            if (imageFile) {
                // FORCE ORGANIZED PATH: roster/filename
                const storageRef = ref(storage, `roster/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            const wrestlerData = {
                ...formData,
                image: imageUrl,
                updatedAt: new Date()
            };

            if (id) {
                await updateDoc(doc(db, "luchadores", id), wrestlerData);
            } else {
                await addDoc(collection(db, "luchadores"), {
                    ...wrestlerData,
                    createdAt: new Date()
                });
            }

            router.push("/admin/luchadores");
            router.refresh();

        } catch (error) {
            console.error("Error saving wrestler:", error);
            alert("Error al guardar. Revisa la consola.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-white" /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/luchadores" className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors group">
                        <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">
                            {id ? "Editar Perfil" : "Nuevo Luchador"}
                        </h1>
                        <p className="text-sm text-gray-400">
                            {id ? "Actualiza las estadísticas y medios" : "Registra una nueva estrella"}
                        </p>
                    </div>
                    <TourButton tourId="wrestler-form" steps={wrestlerFormTour} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Image & Media (swapped for 3-col layout, put image on right or left? Task asked for standard layout: Left Content, Right Media. Let's stick to Layout: 2/3 Content, 1/3 Media) */}
                {/* Wait, standard layout is: 2/3 Content (Left), 1/3 Media/Actions (Right). 
                    The previous refactor of Product/Gallery used 2/3 Left = Content, 1/3 Right = Image. 
                    I will follow that consistency.
                */}

                {/* CENTER/LEFT: Content Columns */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Basic Info */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6">
                        <h3 className="font-bold text-white uppercase text-sm border-b border-zinc-800 pb-2">Información Principal</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div data-tour="wrestler-name">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de Ring</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            name,
                                            slug: !id ? generateSlug(name) : prev.slug
                                        }));
                                    }}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold focus:outline-none transition-colors"
                                />
                            </div>
                            <div data-tour="wrestler-nickname">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Apodo / Sobrenombre</label>
                                <input
                                    type="text"
                                    value={formData.nickname}
                                    onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div data-tour="wrestler-alignment">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bando / Alineación</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={cn(
                                    "cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all hover:bg-zinc-800",
                                    formData.alignment === 'face' ? "bg-blue-950/30 border-blue-500 text-blue-400" : "bg-black border-zinc-800 text-zinc-500"
                                )}>
                                    <input type="radio" name="alignment" value="face" checked={formData.alignment === 'face'} onChange={() => setFormData({ ...formData, alignment: 'face' })} className="hidden" />

                                    <span className="font-bold uppercase tracking-wider">Técnico</span>
                                </label>
                                <label className={cn(
                                    "cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all hover:bg-zinc-800",
                                    formData.alignment === 'heel' ? "bg-red-950/30 border-red-500 text-red-500" : "bg-black border-zinc-800 text-zinc-500"
                                )}>
                                    <input type="radio" name="alignment" value="heel" checked={formData.alignment === 'heel'} onChange={() => setFormData({ ...formData, alignment: 'heel' })} className="hidden" />

                                    <span className="font-bold uppercase tracking-wider">Rudo</span>
                                </label>
                            </div>
                        </div>

                        <div data-tour="wrestler-bio">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Biografía</label>
                            <textarea
                                rows={4}
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold focus:outline-none transition-colors"
                            ></textarea>
                        </div>
                    </div>

                    {/* Stats & Skills */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6">
                        <h3 className="font-bold text-white uppercase text-sm border-b border-zinc-800 pb-2">Habilidades y Estadísticas</h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-tour="wrestler-weight">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Altura</label>
                                <input type="text" placeholder="Ej. 1.80 m" value={formData.stats.height} onChange={e => setFormData({ ...formData, stats: { ...formData.stats, height: e.target.value } })} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white focus:border-lnl-gold focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Peso</label>
                                <input type="text" placeholder="Ej. 95 kg" value={formData.stats.weight} onChange={e => setFormData({ ...formData, stats: { ...formData.stats, weight: e.target.value } })} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white focus:border-lnl-gold focus:outline-none" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ciudad de Origen</label>
                                <input type="text" value={formData.stats.hometown} onChange={e => setFormData({ ...formData, stats: { ...formData.stats, hometown: e.target.value } })} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white focus:border-lnl-gold focus:outline-none" />
                            </div>
                        </div>

                        {/* Moveset */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Movimiento Final (Finisher)</label>
                                <input type="text" value={formData.stats.finisher} onChange={e => setFormData({ ...formData, stats: { ...formData.stats, finisher: e.target.value } })} className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold focus:outline-none border-l-4 border-l-lnl-red" placeholder="El movimiento más letal..." />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Movimientos Firma (Signatures)</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newSignature}
                                        onChange={(e) => setNewSignature(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSignature())}
                                        placeholder="Agrega otros movimientos..."
                                        className="flex-1 bg-black border border-zinc-700 rounded-lg p-2 text-white focus:border-lnl-gold focus:outline-none"
                                    />
                                    <button type="button" onClick={addSignature} className="bg-zinc-800 p-2 rounded-lg hover:bg-zinc-700 text-white"><Plus className="w-5 h-5" /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.stats.signatures.map((sig, idx) => (
                                        <span key={idx} className="bg-zinc-800 text-xs px-3 py-1 rounded-full flex items-center gap-2 group">
                                            {sig}
                                            <button type="button" onClick={() => removeSignature(idx)} className="text-zinc-500 group-hover:text-red-500"><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                    {formData.stats.signatures.length === 0 && <span className="text-zinc-600 text-xs italic">No hay movimientos firma agregados.</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Championships (New) */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6">
                        <h3 className="font-bold text-white uppercase text-sm border-b border-zinc-800 pb-2 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-lnl-gold" /> Historial de Campeonatos
                        </h3>
                        {availableChampionships.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {availableChampionships.map(champ => (
                                    <div
                                        key={champ.id}
                                        onClick={() => toggleChampionship(champ.id)}
                                        className={cn(
                                            "cursor-pointer p-3 rounded-lg border-2 flex flex-col items-center gap-2 text-center transition-all",
                                            formData.championships.includes(champ.id)
                                                ? "bg-lnl-gold/20 border-lnl-gold"
                                                : "bg-black border-zinc-800 grayscale hover:grayscale-0 hover:border-zinc-600"
                                        )}
                                    >
                                        {champ.image ? (
                                            <div className="relative w-12 h-12">
                                                <Image src={champ.image} alt={champ.title} fill className="object-contain" />
                                            </div>
                                        ) : <Trophy className="w-8 h-8 text-yellow-600" />}
                                        <span className={cn("text-[10px] font-bold uppercase leading-tight", formData.championships.includes(champ.id) ? "text-white" : "text-gray-500")}>
                                            {champ.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No hay campeonatos creados en el sistema.</p>
                        )}
                    </div>

                    {/* Opciones Especiales */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
                        <h3 className="font-bold text-white uppercase text-sm border-b border-zinc-800 pb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-lnl-gold" /> Opciones Especiales
                        </h3>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.isFeatured}
                                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                className="w-5 h-5 rounded bg-black border-2 border-zinc-700 checked:bg-lnl-gold checked:border-lnl-gold"
                            />
                            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                                ⭐ Luchador Destacado (aparece en la página principal)
                            </span>
                        </label>

                        <div className="pt-2 border-t border-zinc-800">
                            <p className="text-xs text-gray-500 mb-2">
                                Para gestionar el Power Ranking, usa la página dedicada:
                            </p>
                            <a
                                href="/admin/ranking"
                                className="inline-flex items-center gap-2 text-lnl-gold text-sm font-bold hover:text-yellow-400 transition-colors"
                            >
                                <Trophy className="w-4 h-4" /> Ir a Power Rankings →
                            </a>
                        </div>
                    </div>

                    {/* Multimedia */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6">
                        <h3 className="font-bold text-white uppercase text-sm border-b border-zinc-800 pb-2">Multimedia</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                    <Music className="w-3 h-3" /> Tema de Entrada (YouTube)
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={formData.entranceTheme}
                                    onChange={e => setFormData({ ...formData, entranceTheme: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white focus:border-lnl-gold focus:outline-none text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                    <Video className="w-3 h-3" /> Video Highlight (YouTube)
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={formData.videoHighlight}
                                    onChange={e => setFormData({ ...formData, videoHighlight: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white focus:border-lnl-gold focus:outline-none text-xs"
                                />
                            </div>
                        </div>

                        {/* Redes Sociales */}
                        <div className="pt-4 border-t border-zinc-800">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Redes Sociales</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        📸 Instagram
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="@usuario (sin https://)"
                                        value={formData.socials.instagram}
                                        onChange={e => setFormData({
                                            ...formData,
                                            socials: { ...formData.socials, instagram: e.target.value }
                                        })}
                                        className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white focus:border-lnl-gold focus:outline-none text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        🐦 Twitter / X
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="@usuario (sin https://)"
                                        value={formData.socials.twitter}
                                        onChange={e => setFormData({
                                            ...formData,
                                            socials: { ...formData.socials, twitter: e.target.value }
                                        })}
                                        className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white focus:border-lnl-gold focus:outline-none text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT: Media / Image / Sticky Actions */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Image Upload */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl sticky top-6" data-tour="wrestler-photo">
                        <label className="block text-sm font-bold text-gray-400 uppercase mb-4">
                            Foto de Perfil (PNG)
                        </label>

                        <div className={cn(
                            "relative aspect-[3/4] w-full bg-black rounded-lg border-2 border-dashed overflow-hidden group transition-colors",
                            imagePreview ? "border-lnl-gold" : "border-zinc-700 hover:border-lnl-gold cursor-pointer"
                        )}>
                            {imagePreview ? (
                                <>
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-contain z-10"
                                        sizes="(max-width: 768px) 100vw, 300px"
                                    />
                                    {/* Grid Background for transparency check - CSS Pattern */}
                                    <div className="absolute inset-0 bg-[radial-gradient(#4d4d4d_1px,transparent_1px)] [background-size:16px_16px] opacity-25 z-0"></div>

                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                                        <label className="p-2 bg-white text-black rounded-full cursor-pointer hover:bg-gray-200" title="Cambiar imagen">
                                            <Upload className="w-5 h-5" />
                                            <input type="file" accept="image/png, image/jpeg" onChange={handleImageChange} className="hidden" />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => { setImageFile(null); setImagePreview(""); setCurrentImageUrl(""); }}
                                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            title="Eliminar imagen"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
                                    <Upload className="w-10 h-10" />
                                    <span className="text-xs font-bold text-center px-4">Arrastra o Click para subir</span>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                </div>
                            )}
                        </div>

                        {/* Actions for Image */}
                        {(imageFile || currentImageUrl) && (
                            <div className="bg-zinc-800 p-3 rounded-lg mt-2">
                                <p className="text-[10px] text-gray-400 mb-2 uppercase font-bold text-center">Herramientas de IA</p>
                                <button
                                    type="button"
                                    onClick={handleRemoveBackground}
                                    disabled={removingBg}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {removingBg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-white" />}
                                    {removingBg ? "Eliminando fondo..." : "QUITAR FONDO DE IMAGEN"}
                                </button>
                                <p className="text-[10px] text-zinc-500 text-center mt-2 leading-tight">
                                    * La primera vez puede tardar unos segundos en cargar el modelo.
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-3 mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-lnl-gold text-black py-4 rounded-lg font-black uppercase tracking-widest hover:bg-yellow-500 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_0_rgba(180,120,0,1)] hover:shadow-[0_2px_0_0_rgba(180,120,0,1)] active:shadow-none active:translate-y-[4px]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {id ? "Guardar Cambios" : "Crear Luchador"}
                            </button>

                            <Link
                                href="/admin/luchadores"
                                className="w-full bg-zinc-800 text-zinc-400 py-3 rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-zinc-700 transition-colors text-center"
                            >
                                Cancelar
                            </Link>
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
}
