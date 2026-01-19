"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, addDoc, updateDoc, collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Loader2, Save, ArrowLeft, Trash, Wand2, Trophy, Crown, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { compressImage } from "@/lib/image-compression";
import { removeBackground } from "@imgly/background-removal";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TourButton } from "@/components/admin/admin-tour";
import { championshipFormTour } from "@/lib/tour-definitions";

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface ChampionshipFormProps {
    id?: string;
}

interface Wrestler {
    id: string;
    name: string;
    nickname?: string;
    image?: string;
}

interface Reign {
    id: string;
    wrestlerId: string;
    wrestlerName: string;
    wonAt: Timestamp;
    lostAt: Timestamp | null;
    defenses: number;
    reignNumber: number;
}

// Generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

export function ChampionshipForm({ id }: ChampionshipFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [removingBg, setRemovingBg] = useState(false);

    // Wrestlers for selector
    const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
    const [reigns, setReigns] = useState<Reign[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        division: "masculino" as "masculino" | "femenino" | "parejas",
        isActive: true,
        currentChampionId: "" as string,
        currentDefenses: 0,
        wonAt: null as Date | null,
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [currentImageUrl, setCurrentImageUrl] = useState("");

    // Fetch wrestlers on mount
    useEffect(() => {
        async function fetchWrestlers() {
            try {
                const q = query(collection(db, "luchadores"), orderBy("name"));
                const snap = await getDocs(q);
                setWrestlers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Wrestler[]);
            } catch (error) {
                console.error("Error fetching wrestlers:", error);
            }
        }
        fetchWrestlers();
    }, []);

    // Auto-generate slug from title
    useEffect(() => {
        if (!id && formData.title) {
            setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }));
        }
    }, [formData.title, id]);

    // Auto-save: Load
    useEffect(() => {
        if (!id) {
            const savedData = localStorage.getItem("championship-form-backup");
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
                localStorage.setItem("championship-form-backup", JSON.stringify(formData));
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [formData, id]);

    // Fetch existing championship data
    useEffect(() => {
        if (!id) return;

        async function fetchData() {
            try {
                const docRef = doc(db, "campeonatos", id!);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        title: data.title || "",
                        slug: data.slug || generateSlug(data.title || ""),
                        description: data.description || "",
                        division: data.division || "masculino",
                        isActive: data.isActive !== false,
                        currentChampionId: data.currentChampionId || "",
                        currentDefenses: data.currentDefenses || 0,
                        wonAt: data.wonAt?.toDate() || null,
                    });
                    if (data.image) {
                        setCurrentImageUrl(data.image);
                        setImagePreview(data.image);
                    }
                }

                // Fetch reigns history
                const reignsSnap = await getDocs(
                    query(collection(db, "campeonatos", id!, "reigns"), orderBy("reignNumber", "desc"))
                );
                setReigns(reignsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reign[]);

            } catch (error) {
                console.error("Error fetching championship:", error);
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
                const storageRef = ref(storage, `belts/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            const champData = {
                title: formData.title,
                slug: formData.slug,
                description: formData.description,
                division: formData.division,
                isActive: formData.isActive,
                currentChampionId: formData.currentChampionId || null,
                currentDefenses: formData.currentDefenses,
                wonAt: formData.wonAt ? Timestamp.fromDate(formData.wonAt) : null,
                image: imageUrl,
                updatedAt: Timestamp.now()
            };

            if (id) {
                await updateDoc(doc(db, "campeonatos", id), champData);
            } else {
                await addDoc(collection(db, "campeonatos"), {
                    ...champData,
                    createdAt: Timestamp.now()
                });
                localStorage.removeItem("championship-form-backup");
            }

            router.push("/admin/campeonatos");
            router.refresh();

        } catch (error) {
            console.error("Error saving championship:", error);
            alert("Error al guardar campeonato.");
        } finally {
            setLoading(false);
        }
    };

    // Get current champion wrestler object
    const currentChampion = wrestlers.find(w => w.id === formData.currentChampionId);

    // Calculate reign days
    const calculateReignDays = (wonAt: Date | null): number => {
        if (!wonAt) return 0;
        const now = new Date();
        return Math.floor((now.getTime() - wonAt.getTime()) / (1000 * 60 * 60 * 24));
    };

    if (fetching) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-white" /></div>;

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/campeonatos" className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">
                            {id ? "Editar Título" : "Nuevo Campeonato"}
                        </h1>
                        <p className="text-sm text-gray-400">Gestiona los cinturones de la LNL</p>
                    </div>
                </div>
                <TourButton tourId="championship-form" steps={championshipFormTour} />
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Image */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl sticky top-6" data-tour="championship-image">
                        <label className="block text-sm font-bold text-gray-400 uppercase mb-4 text-center">
                            Foto del Cinturón
                        </label>

                        <div className={cn(
                            "relative aspect-square w-full bg-black rounded-lg border-2 border-dashed overflow-hidden group transition-colors",
                            imagePreview ? "border-lnl-gold" : "border-zinc-700 hover:border-lnl-gold cursor-pointer"
                        )}>
                            {imagePreview ? (
                                <>
                                    <Image src={imagePreview} alt="Preview" fill className="object-contain z-10" />
                                    {/* Transparency Grid */}
                                    <div className="absolute inset-0 bg-[radial-gradient(#4d4d4d_1px,transparent_1px)] [background-size:16px_16px] opacity-25 z-0"></div>

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
                                    <Trophy className="w-10 h-10 mb-3 text-zinc-700 group-hover:text-lnl-gold transition-colors" />
                                    <span className="text-xs font-bold uppercase">Subir Foto</span>
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

                        {/* Current Champion Preview */}
                        {currentChampion && (
                            <div className="mt-6 pt-6 border-t border-zinc-800">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-3 text-center">Campeón Actual</label>
                                <div className="flex flex-col items-center">
                                    {currentChampion.image && (
                                        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-lnl-gold mb-2">
                                            <Image src={currentChampion.image} alt={currentChampion.name} fill className="object-cover" />
                                        </div>
                                    )}
                                    <span className="font-black text-white uppercase text-sm">{currentChampion.name}</span>
                                    {formData.wonAt && (
                                        <span className="text-xs text-lnl-gold mt-1">
                                            {calculateReignDays(formData.wonAt)} días de reinado
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6">
                        <h2 className="text-lg font-black text-white uppercase italic border-b border-zinc-800 pb-2 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-lnl-gold" /> Información del Título
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div data-tour="championship-name">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Campeonato <span className="text-red-500">*</span></label>
                                <input
                                    type="text" required
                                    placeholder="Ej. Campeonato Peso Pesado LNL"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slug (URL)</label>
                                <input
                                    type="text"
                                    placeholder="peso-pesado-lnl"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold focus:outline-none font-mono text-sm"
                                />
                                <p className="text-xs text-zinc-500 mt-1">/campeonatos/{formData.slug || "..."}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div data-tour="championship-division">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">División</label>
                                <select
                                    value={formData.division}
                                    onChange={(e) => setFormData({ ...formData, division: e.target.value as "masculino" | "femenino" | "parejas" })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold focus:outline-none"
                                >
                                    <option value="masculino">Masculino</option>
                                    <option value="femenino">Femenino</option>
                                    <option value="parejas">Parejas (Tag Team)</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded border-zinc-700 bg-black text-lnl-gold focus:ring-lnl-gold"
                                    />
                                    <span className="text-sm text-gray-300">Título Activo</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción / Historia</label>
                            <textarea
                                rows={3}
                                placeholder="Breve historia o prestigio del título..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold focus:outline-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Current Champion Section */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6" data-tour="championship-champion">
                        <h2 className="text-lg font-black text-white uppercase italic border-b border-zinc-800 pb-2 flex items-center gap-2">
                            <Crown className="w-5 h-5 text-lnl-gold" /> Campeón Actual
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Seleccionar Campeón</label>
                                <select
                                    value={formData.currentChampionId}
                                    onChange={(e) => setFormData({ ...formData, currentChampionId: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold focus:outline-none"
                                >
                                    <option value="">— Título Vacante —</option>
                                    {wrestlers.map(w => (
                                        <option key={w.id} value={w.id}>{w.name} {w.nickname ? `"${w.nickname}"` : ""}</option>
                                    ))}
                                </select>
                            </div>

                            {formData.currentChampionId && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha de Obtención</label>
                                        <input
                                            type="date"
                                            value={formData.wonAt ? formData.wonAt.toISOString().split('T')[0] : ""}
                                            onChange={(e) => setFormData({ ...formData, wonAt: e.target.value ? new Date(e.target.value) : null })}
                                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Defensas Exitosas</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.currentDefenses}
                                            onChange={(e) => setFormData({ ...formData, currentDefenses: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold focus:outline-none"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Reigns History (only when editing) */}
                    {id && reigns.length > 0 && (
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
                            <h2 className="text-lg font-black text-white uppercase italic border-b border-zinc-800 pb-2 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-lnl-gold" /> Historial de Reinados
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 uppercase text-xs">
                                            <th className="p-2">#</th>
                                            <th className="p-2">Campeón</th>
                                            <th className="p-2">Ganó</th>
                                            <th className="p-2">Perdió</th>
                                            <th className="p-2">Defensas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reigns.map(reign => (
                                            <tr key={reign.id} className="border-t border-zinc-800">
                                                <td className="p-2 text-lnl-gold font-bold">{reign.reignNumber}</td>
                                                <td className="p-2 text-white font-bold">{reign.wrestlerName}</td>
                                                <td className="p-2 text-gray-400">{reign.wonAt?.toDate().toLocaleDateString()}</td>
                                                <td className="p-2 text-gray-400">{reign.lostAt ? reign.lostAt.toDate().toLocaleDateString() : <span className="text-green-500 font-bold">ACTUAL</span>}</td>
                                                <td className="p-2 text-gray-400">{reign.defenses}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                        <div className="flex gap-4">
                            <button
                                type="submit" disabled={loading || removingBg}
                                className="flex-1 bg-lnl-red text-white py-4 rounded-lg font-black uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-900/20"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Guardar Campeonato
                            </button>
                            <Link
                                href="/admin/campeonatos"
                                className="flex-1 bg-zinc-800 text-zinc-400 py-4 rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-zinc-700 transition-colors text-center flex items-center justify-center"
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
