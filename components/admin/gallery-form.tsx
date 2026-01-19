"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, addDoc, updateDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Loader2, Save, Upload, ArrowLeft, Trash, Image as ImageIcon, Users, Camera, Zap, Wand2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { compressImage } from "@/lib/image-compression";
import { removeBackground } from "@imgly/background-removal";
import { TourButton } from "@/components/admin/admin-tour";
import { galleryFormTour } from "@/lib/tour-definitions";

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface GalleryFormProps {
    id?: string;
}

export function GalleryForm({ id }: GalleryFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [removingBg, setRemovingBg] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        category: "Eventos"
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [currentImageUrl, setCurrentImageUrl] = useState("");

    // Auto-save: Load
    useEffect(() => {
        if (!id) {
            const savedData = localStorage.getItem("gallery-form-backup");
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    setFormData(prev => ({ ...prev, ...parsed }));
                } catch (e) { console.error(e); }
            }
        }
    }, [id]);

    // Auto-save: Save
    useEffect(() => {
        if (!id) {
            const timeout = setTimeout(() => {
                localStorage.setItem("gallery-form-backup", JSON.stringify(formData));
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [formData, id]);

    useEffect(() => {
        if (!id) return;

        async function fetchData() {
            try {
                const docRef = doc(db, "galeria_items", id!);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        title: data.title || "",
                        category: data.category || "Eventos"
                    });
                    if (data.image) {
                        setCurrentImageUrl(data.image);
                        setImagePreview(data.image);
                    }
                }
            } catch (error) {
                console.error("Error fetching gallery item:", error);
            } finally {
                setFetching(false);
            }
        }

        fetchData();
    }, [id]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const compressed = await compressImage(file);
                setImageFile(compressed);
                setImagePreview(URL.createObjectURL(compressed));
            } catch (err) {
                console.error("Error compressing image:", err);
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
            }
        }
    };

    const handleRemoveBackground = async () => {
        if (!imageFile && !imagePreview) return;

        try {
            setRemovingBg(true);
            const source = imageFile ? imageFile : imagePreview;
            const blob = await removeBackground(source);
            const processedFile = new File([blob], imageFile?.name || "processed.png", { type: "image/png" });
            const finalFile = await compressImage(processedFile);

            setImageFile(finalFile);
            setImagePreview(URL.createObjectURL(finalFile));

        } catch (error) {
            console.error("Error removing background:", error);
            alert("Error al quitar el fondo.");
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
                // Using 'gallery/' folder
                const storageRef = ref(storage, `gallery/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            if (!imageUrl) {
                alert("Debes subir una imagen");
                setLoading(false);
                return;
            }

            const itemData = {
                ...formData,
                image: imageUrl,
                updatedAt: new Date()
            };

            if (id) {
                await updateDoc(doc(db, "galeria_items", id), itemData);
            } else {
                await addDoc(collection(db, "galeria_items"), {
                    ...itemData,
                    createdAt: new Date()
                });
                localStorage.removeItem("gallery-form-backup");
            }

            router.push("/admin/galeria");
            router.refresh();

        } catch (error) {
            console.error("Error saving gallery item:", error);
            alert("Error al guardar imagen.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-white" /></div>;

    const categories = [
        { id: "Eventos", label: "Eventos en Vivo", icon: ImageIcon },
        { id: "Luchadores", label: "Luchadores", icon: Users },
        { id: "Fans", label: "Fanáticos", icon: Camera },
        { id: "Acción", label: "Acción en el Ring", icon: Zap },
    ];

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/galeria" className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors group">
                        <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">
                            {id ? "Editar Foto" : "Nueva Foto"}
                        </h1>
                        <p className="text-sm text-gray-400">
                            {id ? "Actualiza los detalles" : "Sube nuevos momentos épicos"}
                        </p>
                    </div>
                    <TourButton tourId="gallery-form" steps={galleryFormTour} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Form Fields */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Basic Info */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6">
                        <h2 className="text-lg font-black text-white uppercase italic border-b border-zinc-800 pb-2">Detalles</h2>
                        <div data-tour="gallery-title">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título / Descripción</label>
                            <input
                                type="text" required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ej. Gran vuelo de Sombra Jr."
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold focus:outline-none transition-colors"
                            />
                            <p className="text-xs text-zinc-500 mt-1">Una breve descripción de la foto.</p>
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6" data-tour="gallery-event">
                        <h2 className="text-lg font-black text-white uppercase italic border-b border-zinc-800 pb-2">Categoría</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all",
                                        formData.category === cat.id
                                            ? "bg-lnl-gold/10 border-lnl-gold text-lnl-gold"
                                            : "bg-black border-zinc-800 text-gray-400 hover:border-zinc-600 hover:text-gray-300"
                                    )}
                                >
                                    <cat.icon className="w-8 h-8" />
                                    <span className="font-bold uppercase tracking-wider">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Image & Actions */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Image Upload */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl sticky top-6" data-tour="gallery-image">
                        <label className="block text-sm font-bold text-gray-400 uppercase mb-4">
                            Imagen
                        </label>

                        <div className={cn(
                            "relative aspect-video w-full bg-black rounded-lg border-2 border-dashed overflow-hidden group transition-colors",
                            imagePreview ? "border-lnl-gold" : "border-zinc-700 hover:border-lnl-gold cursor-pointer"
                        )}>
                            {imagePreview ? (
                                <>
                                    <Image src={imagePreview} alt="Preview" fill className="object-cover z-10" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-20">
                                        <label className="p-2 bg-white text-black rounded-full cursor-pointer hover:bg-gray-200" title="Cambiar imagen">
                                            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                            <PencilIcon />
                                        </label>
                                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); setCurrentImageUrl(""); }} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700" title="Eliminar imagen">
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <label className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 pointer-events-none z-10">
                                    <Upload className="w-10 h-10 mb-3 text-zinc-700 group-hover:text-lnl-gold transition-colors" />
                                    <span className="text-xs font-bold uppercase">Click para subir</span>
                                    <span className="text-[10px] text-zinc-700 mt-1">Alta Resolución</span>
                                </label>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />

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
                                className="w-full mt-4 py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-900/20"
                            >
                                <Wand2 className="w-3 h-3" />
                                {removingBg ? "Procesando..." : "Quitar Fondo (IA)"}
                            </button>
                        )}

                        <div className="mt-6 pt-6 border-t border-zinc-800 flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={loading || removingBg}
                                className="w-full bg-lnl-gold text-black py-4 rounded-lg font-black uppercase tracking-widest hover:bg-yellow-500 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_0_rgba(180,120,0,1)] hover:shadow-[0_2px_0_0_rgba(180,120,0,1)] active:shadow-none active:translate-y-[4px]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {id ? "Guardar Cambios" : "Agregar a Galería"}
                            </button>

                            <Link
                                href="/admin/galeria"
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

function PencilIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
    )
}
