"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, addDoc, updateDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Loader2, Save, Upload, ArrowLeft, Trash, Shirt, Tag, Trophy, CircleDollarSign, Wand2, AlertTriangle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TourButton } from "@/components/admin/admin-tour";
import { productFormTour } from "@/lib/tour-definitions";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { compressImage } from "@/lib/image-compression";
import { removeBackground } from "@imgly/background-removal";

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface ProductFormProps {
    id?: string;
}

export function ProductForm({ id }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [removingBg, setRemovingBg] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        price: "",
        category: "Ropa",
        status: "active", // active, soldout, preorder
        description: "",
        sizes: [] as string[],
        features: [] as string[]
    });

    const [newSize, setNewSize] = useState("");
    const [newFeature, setNewFeature] = useState("");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [currentImageUrl, setCurrentImageUrl] = useState("");

    // Auto-save: Load from localStorage on mount (only for new products)
    useEffect(() => {
        if (!id) {
            const savedData = localStorage.getItem("product-form-backup");
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    setFormData(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error("Error loading backup", e);
                }
            }
        }
    }, [id]);

    // Auto-save: Save to localStorage on change
    useEffect(() => {
        if (!id) {
            const timeout = setTimeout(() => {
                localStorage.setItem("product-form-backup", JSON.stringify(formData));
            }, 1000); // Debounce 1s
            return () => clearTimeout(timeout);
        }
    }, [formData, id]);

    useEffect(() => {
        if (!id) return;

        async function fetchData() {
            try {
                const docRef = doc(db, "productos", id!);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        name: data.name || "",
                        slug: data.slug || "",
                        price: data.price || "",
                        category: data.category || "Ropa",
                        status: data.status || "active",
                        description: data.description || "",
                        sizes: data.sizes || [],
                        features: data.features || []
                    });
                    if (data.image) {
                        setCurrentImageUrl(data.image);
                        setImagePreview(data.image);
                    }
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setFetching(false);
            }
        }

        fetchData();
    }, [id]);

    // Helpers
    const generateSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\w-]+/g, '')  // Remove all non-word chars
            .replace(/--+/g, '-');    // Replace multiple - with single -
    };

    // Auto-generate slug when name changes
    useEffect(() => {
        if (!id && formData.name) {
            setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }));
        }
    }, [formData.name, id]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const compressed = await compressImage(file);
                setImageFile(compressed);
                setImagePreview(URL.createObjectURL(compressed));
            } catch (error) {
                console.error("Error processing image:", error);
                alert("Error al procesar la imagen");
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
            alert("Error al quitar el fondo. Intenta con otra imagen.");
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
                const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                image: imageUrl,
                updatedAt: new Date(),
            };

            if (id) {
                await updateDoc(doc(db, "productos", id), productData);
            } else {
                await addDoc(collection(db, "productos"), {
                    ...productData,
                    createdAt: new Date(),
                });
                localStorage.removeItem("product-form-backup");
            }

            router.push("/admin/tienda");
            router.refresh();
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Error al guardar producto");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-white" /></div>;

    const categories = [
        { id: "Ropa", label: "Ropa / Merch", icon: Shirt },
        { id: "Máscaras", label: "Máscaras", icon: Tag },
        { id: "Accesorios", label: "Accesorios", icon: CircleDollarSign },
        { id: "Coleccionables", label: "Coleccionables", icon: Trophy },
    ];

    const statuses = [
        { id: "active", label: "En Stock", color: "bg-emerald-500", border: "border-emerald-500" },
        { id: "preorder", label: "Pre-Venta", color: "bg-amber-500", border: "border-amber-500" },
        { id: "soldout", label: "Agotado", color: "bg-red-500", border: "border-red-500" },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/tienda" className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors group">
                        <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">
                            {id ? "Editar Producto" : "Nuevo Producto"}
                        </h1>
                        <p className="text-sm text-gray-400">
                            {id ? "Actualiza el inventario" : "Agrega swag a la tienda"}
                        </p>
                    </div>
                    <TourButton tourId="product-form" steps={productFormTour} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Form Fields */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Basic Info Card */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6">
                        <h2 className="text-lg font-black text-white uppercase italic border-b border-zinc-800 pb-2">Información Básica</h2>

                        <div className="space-y-4">
                            <div data-tour="product-name">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Producto</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej. Polera Oficial LNL 2024"
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div data-tour="product-slug">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slug (URL)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-gray-400 text-sm focus:border-zinc-600 focus:outline-none"
                                        />
                                        <span className="absolute right-3 top-3 text-xs text-zinc-600">Auto-generated</span>
                                    </div>
                                </div>
                                <div data-tour="product-price">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Precio (Bs.)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-500">Bs.</span>
                                        <input
                                            type="number" required
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 pl-10 text-white focus:border-lnl-gold focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                                <textarea
                                    rows={5}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detalles del producto, tallas disponibles, material..."
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold focus:outline-none transition-colors resize-none"
                                ></textarea>
                                <p className="text-xs text-zinc-500 mt-1 text-right">Se breve y atractivo.</p>
                            </div>
                        </div>
                    </div>

                    {/* Category & Status Card - Visually Rich Selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category */}
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                            <h2 className="text-sm font-bold text-gray-500 uppercase mb-4">Categoría</h2>
                            <div className="grid grid-cols-2 gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, category: cat.id })}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-lg border transition-all",
                                            formData.category === cat.id
                                                ? "bg-zinc-800 border-lnl-gold text-white shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                                                : "bg-black border-zinc-800 text-gray-500 hover:border-zinc-700 hover:bg-zinc-900"
                                        )}
                                    >
                                        <cat.icon className={cn("w-6 h-6 mb-2", formData.category === cat.id ? "text-lnl-gold" : "text-gray-600")} />
                                        <span className="text-xs font-bold uppercase">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl" data-tour="product-status">
                            <h2 className="text-sm font-bold text-gray-500 uppercase mb-4">Estado / Stock</h2>
                            <div className="space-y-2">
                                {statuses.map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: s.id })}
                                        className={cn(
                                            "w-full flex items-center p-3 rounded-lg border transition-all text-left",
                                            formData.status === s.id
                                                ? `bg-zinc-800 ${s.border} text-white`
                                                : "bg-black border-zinc-800 text-gray-500 hover:border-zinc-700 hover:bg-zinc-900"
                                        )}
                                    >
                                        <div className={cn("w-3 h-3 rounded-full mr-3", s.color)}></div>
                                        <span className="text-sm font-bold uppercase">{s.label}</span>
                                        {formData.status === s.id && <CheckCircle2 className="w-4 h-4 ml-auto text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sizes & Features Card */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6">
                        <h2 className="text-lg font-black text-white uppercase italic border-b border-zinc-800 pb-2">Tallas y Características</h2>

                        {/* Sizes */}
                        <div data-tour="product-sizes">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tallas Disponibles</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newSize}
                                    onChange={(e) => setNewSize(e.target.value.toUpperCase())}
                                    placeholder="Ej: M, L, XL"
                                    className="flex-1 bg-black border border-zinc-700 rounded-lg p-2 text-white text-sm focus:border-lnl-gold focus:outline-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
                                                setFormData({ ...formData, sizes: [...formData.sizes, newSize.trim()] });
                                                setNewSize("");
                                            }
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
                                            setFormData({ ...formData, sizes: [...formData.sizes, newSize.trim()] });
                                            setNewSize("");
                                        }
                                    }}
                                    className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 text-sm font-bold"
                                >
                                    +
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.sizes.map((size, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-800 text-white rounded-lg text-sm">
                                        {size}
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, sizes: formData.sizes.filter((_, i) => i !== idx) })}
                                            className="text-gray-500 hover:text-red-500 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                {formData.sizes.length === 0 && <span className="text-gray-600 text-sm">Sin tallas (opcional para ropa)</span>}
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Características</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    placeholder="Ej: 100% Algodón"
                                    className="flex-1 bg-black border border-zinc-700 rounded-lg p-2 text-white text-sm focus:border-lnl-gold focus:outline-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (newFeature.trim()) {
                                                setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
                                                setNewFeature("");
                                            }
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (newFeature.trim()) {
                                            setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
                                            setNewFeature("");
                                        }
                                    }}
                                    className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 text-sm font-bold"
                                >
                                    +
                                </button>
                            </div>
                            <ul className="space-y-1">
                                {formData.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center justify-between px-3 py-2 bg-zinc-800 rounded-lg text-sm text-white">
                                        <span className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-lnl-red rounded-full"></span>
                                            {feature}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== idx) })}
                                            className="text-gray-500 hover:text-red-500"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                                {formData.features.length === 0 && <li className="text-gray-600 text-sm">Sin características (opcional)</li>}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Column: Image & Actions */}
                <div className="space-y-6">
                    {/* Image Upload Card */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl md:sticky md:top-6" data-tour="product-image">
                        <h2 className="text-lg font-black text-white uppercase italic border-b border-zinc-800 pb-2 mb-4">Imagen del Producto</h2>

                        <div className="space-y-4">
                            <div
                                className={cn(
                                    "aspect-square rounded-xl overflow-hidden border-2 border-dashed relative group transition-colors",
                                    imagePreview ? "border-lnl-gold bg-black" : "border-zinc-700 bg-zinc-950 hover:border-gray-500"
                                )}
                            >
                                {imagePreview ? (
                                    <>
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-contain z-10"
                                            sizes="(max-width: 768px) 100vw, 300px"
                                        />
                                        {/* CSS Transparency Grid */}
                                        <div className="absolute inset-0 bg-[radial-gradient(#4d4d4d_1px,transparent_1px)] [background-size:16px_16px] opacity-25 z-0"></div>

                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
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
                                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                        <Upload className="w-8 h-8 text-gray-500 mb-2" />
                                        <span className="text-xs font-bold text-gray-400 uppercase">Subir Imagen</span>
                                        <span className="text-[10px] text-gray-600 mt-1">Click o arrastrar</span>
                                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                    </label>
                                )}

                                {removingBg && (
                                    <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center text-white">
                                        <Wand2 className="w-8 h-8 animate-pulse text-purple-400 mb-2" />
                                        <span className="text-xs font-bold uppercase animate-pulse">Quitando fondo...</span>
                                    </div>
                                )}
                            </div>

                            {/* Magic Remove Background Button */}
                            {imagePreview && (
                                <button
                                    type="button"
                                    onClick={handleRemoveBackground}
                                    disabled={removingBg}
                                    className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-900/20"
                                >
                                    <Wand2 className="w-3 h-3" />
                                    {removingBg ? "Procesando IA..." : "Quitar Fondo de Imagen"}
                                </button>
                            )}

                            <div className="p-3 bg-zinc-950 rounded-lg text-[10px] text-gray-500 space-y-1 border border-zinc-800">
                                <p className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500" /> Tips:</p>
                                <ul className="list-disc list-inside pl-1 space-y-1">
                                    <li>Usa fotos con buena luz.</li>
                                    <li>Fondo contrastado funciona mejor para la IA.</li>
                                    <li>Formato cuadrado recomendado (1:1).</li>
                                </ul>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 pt-6 border-t border-zinc-800 space-y-3">
                            <button
                                type="submit"
                                disabled={loading || removingBg}
                                className="w-full bg-lnl-red text-white py-3 rounded-lg font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg shadow-red-900/20 hover:scale-[1.02]"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                {id ? "Guardar Cambios" : "Publicar Producto"}
                            </button>

                            <Link
                                href="/admin/tienda"
                                className="w-full bg-transparent border border-zinc-700 text-gray-400 py-3 rounded-lg font-bold uppercase text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 hover:text-white transition-colors"
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

// Simple internal icon for readability
function PencilIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
    )
}
