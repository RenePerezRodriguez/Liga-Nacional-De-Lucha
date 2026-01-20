"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, addDoc, updateDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Loader2, Save, Upload, ArrowLeft, Plus, Trash, Wand2, CalendarDays, MapPin, Building, Swords, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { compressImage } from "@/lib/image-compression";
import { removeBackground } from "@imgly/background-removal";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TourButton } from "@/components/admin/admin-tour";
import { eventFormTour } from "@/lib/tour-definitions";

// Dynamic import for map (SSR incompatible)
const LocationPicker = lazy(() => import("@/components/location-picker").then(mod => ({ default: mod.LocationPicker })));

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface EventFormProps {
    id?: string;
}

interface PriceTier {
    name: string;
    price: number;
}

interface Match {
    id: string;
    matchType: string; // "singles", "tag-team", "triple-threat"
    wrestler1Id: string;
    wrestler2Id: string;
    isMainEvent?: boolean;
    // Championship match fields
    isForTitle?: boolean;
    championshipId?: string;
    championshipName?: string;
    // Result fields (filled after event)
    winnerId?: string;
    winnerName?: string;
    result?: string;
    isResultRecorded?: boolean;
}

interface Championship {
    id: string;
    title: string;
    currentChampionId?: string;
    image?: string;
}

interface Wrestler {
    id: string;
    name: string;
    nickname?: string;
    image?: string;
    alignment?: string;
    stats?: {
        height?: string;
        weight?: string;
        finisher?: string;
    };
}

export function EventForm({ id }: EventFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [removingBg, setRemovingBg] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        date: "",
        time: "",
        venueName: "Coliseo Pittsburg",
        address: "Cochabamba, Bolivia",
        coordinates: { lat: -17.3935, lng: -66.1570 },
        isFeatured: false,
        whatsappLink: "https://wa.me/59170000000",
        description: "",
    });

    const [prices, setPrices] = useState<PriceTier[]>([
        { name: "General", price: 30 },
        { name: "Ringside", price: 50 },
        { name: "VIP", price: 80 }
    ]);

    const [matches, setMatches] = useState<Match[]>([]);
    const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
    const [championships, setChampionships] = useState<Championship[]>([]);

    const [ringsidePrices, setRingsidePrices] = useState({
        north: { alias: "Lado Norte", rowA: 100, rowB: 80, rowC: 60 },
        south: { alias: "Lado Sur", rowA: 100, rowB: 80, rowC: 60 },
        west: { alias: "Lado Oeste", rowA: 100, rowB: 80, rowC: 60 },
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [currentImageUrl, setCurrentImageUrl] = useState("");

    // Auto-save: Load from localStorage
    useEffect(() => {
        if (!id) {
            const savedData = localStorage.getItem("event-form-backup");
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    setFormData(prev => ({ ...prev, ...parsed.formData }));
                    if (parsed.prices) setPrices(parsed.prices);
                } catch (e) {
                    console.error("Error loading backup", e);
                }
            }
        }
    }, [id]);

    // Auto-save: Save to localStorage
    useEffect(() => {
        if (!id) {
            const timeout = setTimeout(() => {
                localStorage.setItem("event-form-backup", JSON.stringify({ formData, prices }));
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [formData, prices, id]);

    useEffect(() => {
        if (!id) return;

        async function fetchData() {
            try {
                const docRef = doc(db, "eventos", id!);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        title: data.title || "",
                        date: data.date || "",
                        time: data.time || "",
                        venueName: data.venueName || data.location || "",
                        address: data.address || "Cochabamba, Bolivia",
                        coordinates: data.coordinates || { lat: -17.3935, lng: -66.1570 },
                        isFeatured: data.isFeatured || false,
                        whatsappLink: data.whatsappLink || "",
                        description: data.description || ""
                    });
                    if (data.prices) setPrices(data.prices);
                    if (data.matches) setMatches(data.matches);
                    if (data.ringsidePrices) setRingsidePrices(data.ringsidePrices);
                    if (data.image) {
                        setCurrentImageUrl(data.image);
                        setImagePreview(data.image);
                    }
                } else {
                    alert("Evento no encontrado");
                    router.push("/admin/eventos");
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setFetching(false);
            }
        }

        fetchData();
    }, [id, router]);

    // Fetch all wrestlers for match selection
    useEffect(() => {
        async function fetchWrestlers() {
            try {
                const q = query(collection(db, "luchadores"), orderBy("name"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Wrestler[];
                setWrestlers(data);
            } catch (error) {
                console.error("Error fetching wrestlers:", error);
            }
        }
        fetchWrestlers();
    }, []);

    // Fetch all championships for title matches
    useEffect(() => {
        async function fetchChampionships() {
            try {
                const q = query(collection(db, "campeonatos"), orderBy("title"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Championship[];
                setChampionships(data);
            } catch (error) {
                console.error("Error fetching championships:", error);
            }
        }
        fetchChampionships();
    }, []);

    // Match management functions
    const addMatch = () => {
        const newMatch: Match = {
            id: Date.now().toString(),
            matchType: "singles",
            wrestler1Id: "",
            wrestler2Id: "",
            isMainEvent: matches.length === 0 // First match is main event by default
        };
        setMatches([...matches, newMatch]);
    };

    const updateMatch = (matchId: string, field: keyof Match, value: string | boolean) => {
        setMatches(matches.map(m => m.id === matchId ? { ...m, [field]: value } : m));
    };

    const removeMatch = (matchId: string) => {
        setMatches(matches.filter(m => m.id !== matchId));
    };

    const getWrestlerById = (id: string) => wrestlers.find(w => w.id === id);

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

    const handlePriceChange = (index: number, field: keyof PriceTier, value: string | number) => {
        const newPrices = [...prices];
        if (field === "price") {
            newPrices[index] = { ...newPrices[index], [field]: Number(value) };
        } else {
            newPrices[index] = { ...newPrices[index], [field]: value as string };
        }
        setPrices(newPrices);
    };

    const addPriceTier = () => {
        setPrices([...prices, { name: "", price: 0 }]);
    };

    const removePriceTier = (index: number) => {
        setPrices(prices.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = currentImageUrl;
            if (imageFile) {
                // Using 'events/' folder
                const storageRef = ref(storage, `events/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            // ISO string validation for event Schema
            const eventIsoDate = new Date(`${formData.date}T${formData.time}`).toISOString();

            const eventData = {
                ...formData,
                isoDate: eventIsoDate,
                prices,
                matches,
                ringsidePrices,
                image: imageUrl,
                updatedAt: new Date().toISOString()
            };

            if (id) {
                await updateDoc(doc(db, "eventos", id), eventData);
            } else {
                await addDoc(collection(db, "eventos"), {
                    ...eventData,
                    createdAt: new Date().toISOString()
                });
                localStorage.removeItem("event-form-backup");
            }

            router.push("/admin/eventos");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Error al guardar evento");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-lnl-red w-10 h-10" /></div>;

    return (
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/eventos" className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">
                            {id ? "Editar Evento" : "Nuevo Evento"}
                        </h1>
                        <p className="text-gray-400 text-sm">Organiza la próxima función.</p>
                    </div>
                </div>
                <TourButton tourId="event-form" steps={eventFormTour} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Image & Feature Toggle */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Image Upload */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-4 text-center">
                            Flyer / Poster del Evento
                        </label>
                        <div
                            className={cn(
                                "relative aspect-[9/16] bg-black rounded-lg overflow-hidden border-2 border-dashed group transition-colors cursor-pointer",
                                imagePreview ? "border-lnl-gold" : "border-zinc-700 hover:border-lnl-red"
                            )}
                        >
                            {imagePreview ? (
                                <>
                                    <Image src={imagePreview} alt="Preview" fill className="object-cover z-10" />
                                    {/* Edit Overlay */}
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
                                <label className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2 cursor-pointer z-20 hover:text-white transition-colors">
                                    <Upload className="w-10 h-10" />
                                    <span className="text-xs font-bold">Subir Poster</span>
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

                        {/* Magic Remove Background Button */}
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
                        <p className="text-[10px] text-gray-500 mt-2 text-center">Para posters estilo &quot;render&quot; o sin fondo.</p>
                    </div>

                    {/* Featured Toggle */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6" data-tour="event-featured">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div>
                                <span className="block text-sm font-bold text-white mb-1">Evento Destacado</span>
                                <span className="text-xs text-gray-500 block">Aparecerá la cuenta regresiva en Home.</span>
                            </div>
                            <div className={`w-14 h-8 flex items-center bg-zinc-800 rounded-full p-1 transition-colors ${formData.isFeatured ? 'bg-green-500' : ''}`}
                                onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${formData.isFeatured ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </label>
                    </div>

                    {/* Submit Button (Mobile/Desktop consistent) */}
                    <button
                        type="submit"
                        disabled={loading || !formData.date}
                        className="w-full bg-lnl-red text-white py-4 rounded-lg font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Publicar Cartelera
                    </button>
                </div>

                {/* Right Column: Event Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Data */}
                    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6">
                        <div className="pb-4 border-b border-zinc-800 mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-8 bg-lnl-gold rounded block"></span>
                                Información General
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div data-tour="event-title">
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Título del Evento <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ej: Amenaza Sísmica"
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4" data-tour="event-date">
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-400 block mb-1 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Fecha <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Hora <span className="text-red-500">*</span></label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Venue Section */}
                            <div className="border-t border-zinc-800 pt-4 mt-4" data-tour="event-location">
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-lnl-gold" /> Ubicación del Evento
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-400 block mb-1 flex items-center gap-1">
                                            <Building className="w-3 h-3" /> Nombre del Lugar
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.venueName}
                                            onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                                            placeholder="Ej: Coliseo Pittsburg"
                                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-400 block mb-1">
                                            Dirección
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Ej: Av. América #123, Cochabamba"
                                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold"
                                        />
                                    </div>
                                </div>

                                {/* Map Picker */}
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-400 block mb-2">
                                        📍 Selecciona ubicación en el mapa (clic para mover marcador)
                                    </label>
                                    <Suspense fallback={
                                        <div className="w-full h-64 rounded-lg bg-zinc-800 flex items-center justify-center text-gray-500">
                                            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando mapa...
                                        </div>
                                    }>
                                        <LocationPicker
                                            lat={formData.coordinates.lat}
                                            lng={formData.coordinates.lng}
                                            onLocationChange={(lat, lng) => setFormData({
                                                ...formData,
                                                coordinates: { lat, lng }
                                            })}
                                        />
                                    </Suspense>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Coordenadas: {formData.coordinates.lat.toFixed(5)}, {formData.coordinates.lng.toFixed(5)}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold"
                                    placeholder="Detalles importantes de la cartelera..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Fight Card / Cartelera */}
                    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6">
                        <div className="pb-4 border-b border-zinc-800 mb-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-8 bg-lnl-red rounded block"></span>
                                <Swords className="w-5 h-5 text-lnl-red" /> Cartelera de Luchas
                            </h3>
                            <button
                                type="button"
                                onClick={addMatch}
                                className="text-xs font-bold uppercase bg-zinc-800 text-white px-3 py-1 rounded hover:bg-zinc-700 flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Agregar Lucha
                            </button>
                        </div>

                        {matches.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No hay luchas programadas.</p>
                                <p className="text-xs">Haz clic en &quot;Agregar Lucha&quot; para crear la cartelera.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {matches.map((match, index) => (
                                    <div key={match.id} className={`p-4 rounded-xl border ${match.isMainEvent ? 'border-lnl-gold bg-yellow-900/10' : 'border-zinc-700 bg-zinc-800/50'}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-500">LUCHA #{index + 1}</span>
                                                {match.isMainEvent && (
                                                    <span className="text-xs font-bold text-lnl-gold bg-lnl-gold/20 px-2 py-0.5 rounded">⭐ EVENTO ESTELAR</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={match.isMainEvent || false}
                                                        onChange={(e) => updateMatch(match.id, "isMainEvent", e.target.checked)}
                                                        className="w-4 h-4 rounded bg-black border-zinc-700"
                                                    />
                                                    Evento Estelar
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMatch(match.id)}
                                                    className="p-1 text-red-500 hover:bg-red-500/20 rounded"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                            {/* Wrestler 1 */}
                                            <div>
                                                <label className="text-xs font-bold text-red-500 block mb-1">🔴 LUCHADOR 1</label>
                                                <select
                                                    value={match.wrestler1Id}
                                                    onChange={(e) => updateMatch(match.id, "wrestler1Id", e.target.value)}
                                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white focus:border-lnl-gold text-sm"
                                                >
                                                    <option value="">Seleccionar luchador...</option>
                                                    {wrestlers.map(w => (
                                                        <option key={w.id} value={w.id} disabled={w.id === match.wrestler2Id}>
                                                            {w.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {match.wrestler1Id && getWrestlerById(match.wrestler1Id) && (
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <div className="w-8 h-8 relative rounded-full overflow-hidden bg-zinc-700 flex-shrink-0">
                                                            {getWrestlerById(match.wrestler1Id)?.image && (
                                                                <Image src={getWrestlerById(match.wrestler1Id)!.image!} alt="" fill className="object-cover" sizes="32px" />
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-gray-400">{getWrestlerById(match.wrestler1Id)?.nickname}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* VS */}
                                            <div className="text-center">
                                                <span className="text-3xl font-black text-lnl-gold italic">VS</span>
                                            </div>

                                            {/* Wrestler 2 */}
                                            <div>
                                                <label className="text-xs font-bold text-blue-500 block mb-1">🔵 LUCHADOR 2</label>
                                                <select
                                                    value={match.wrestler2Id}
                                                    onChange={(e) => updateMatch(match.id, "wrestler2Id", e.target.value)}
                                                    className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white focus:border-lnl-gold text-sm"
                                                >
                                                    <option value="">Seleccionar luchador...</option>
                                                    {wrestlers.map(w => (
                                                        <option key={w.id} value={w.id} disabled={w.id === match.wrestler1Id}>
                                                            {w.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {match.wrestler2Id && getWrestlerById(match.wrestler2Id) && (
                                                    <div className="mt-2 flex items-center gap-2 justify-end">
                                                        <span className="text-xs text-gray-400">{getWrestlerById(match.wrestler2Id)?.nickname}</span>
                                                        <div className="w-8 h-8 relative rounded-full overflow-hidden bg-zinc-700 flex-shrink-0">
                                                            {getWrestlerById(match.wrestler2Id)?.image && (
                                                                <Image src={getWrestlerById(match.wrestler2Id)!.image!} alt="" fill className="object-cover" sizes="32px" />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Championship Match Option */}
                                        <div className="mt-4 pt-4 border-t border-zinc-700">
                                            <label className="flex items-center gap-2 cursor-pointer mb-3">
                                                <input
                                                    type="checkbox"
                                                    checked={match.isForTitle || false}
                                                    onChange={(e) => {
                                                        updateMatch(match.id, "isForTitle", e.target.checked);
                                                        if (!e.target.checked) {
                                                            updateMatch(match.id, "championshipId", "");
                                                            updateMatch(match.id, "championshipName", "");
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded bg-black border-zinc-700 text-lnl-gold focus:ring-lnl-gold"
                                                />
                                                <span className="text-sm text-gray-300 flex items-center gap-2">
                                                    <span className="text-lnl-gold">🏆</span> Lucha por Campeonato
                                                </span>
                                            </label>

                                            {match.isForTitle && (
                                                <div className="ml-6">
                                                    <select
                                                        value={match.championshipId || ""}
                                                        onChange={(e) => {
                                                            const champ = championships.find(c => c.id === e.target.value);
                                                            updateMatch(match.id, "championshipId", e.target.value);
                                                            updateMatch(match.id, "championshipName", champ?.title || "");
                                                        }}
                                                        className="w-full bg-black border border-lnl-gold rounded-lg p-2 text-white focus:border-lnl-gold text-sm"
                                                    >
                                                        <option value="">Seleccionar campeonato...</option>
                                                        {championships.map(c => (
                                                            <option key={c.id} value={c.id}>{c.title}</option>
                                                        ))}
                                                    </select>
                                                    {match.championshipId && (
                                                        <p className="text-xs text-lnl-gold mt-1">
                                                            El ganador de esta lucha será el nuevo campeón (o defenderá el título).
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Tickets */}
                    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6">
                        <div className="pb-4 border-b border-zinc-800 mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-8 bg-green-500 rounded block"></span>
                                Ventas y Contacto
                            </h3>
                        </div>

                        {/* WhatsApp */}
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400 block mb-1">WhatsApp de Ventas</label>
                            <div className="flex bg-black border border-zinc-700 rounded-lg overflow-hidden">
                                <div className="bg-green-900/30 px-3 flex items-center justify-center border-r border-zinc-700">
                                    <span className="text-green-500 text-xs font-bold">WHATSAPP</span>
                                </div>
                                <input
                                    type="text"
                                    value={formData.whatsappLink}
                                    onChange={(e) => setFormData({ ...formData, whatsappLink: e.target.value })}
                                    className="flex-1 bg-transparent p-3 text-white focus:outline-none"
                                    placeholder="https://wa.me/..."
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Enlace directo a WhatsApp para que los clientes consulten o compren.</p>
                        </div>

                        {/* Ringside Config */}
                        <div className="mt-6 pt-6 border-t border-zinc-800">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-4">
                                Configuracion Ringside
                            </h4>
                            <p className="text-xs text-gray-500 mb-4">Define el nombre y precio de cada fila para cada lado.</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Norte */}
                                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                                    <div>
                                        <label className="block text-lnl-red font-bold text-xs uppercase mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            value={ringsidePrices.north.alias}
                                            onChange={(e) => setRingsidePrices(p => ({ ...p, north: { ...p.north, alias: e.target.value } }))}
                                            className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white text-sm"
                                            placeholder="Lado Norte"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-gray-500 text-[10px] uppercase mb-1">Fila A</label>
                                            <input type="number" value={ringsidePrices.north.rowA}
                                                onChange={(e) => setRingsidePrices(p => ({ ...p, north: { ...p.north, rowA: parseInt(e.target.value) || 0 } }))}
                                                className="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-white text-sm text-center" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-[10px] uppercase mb-1">Fila B</label>
                                            <input type="number" value={ringsidePrices.north.rowB}
                                                onChange={(e) => setRingsidePrices(p => ({ ...p, north: { ...p.north, rowB: parseInt(e.target.value) || 0 } }))}
                                                className="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-white text-sm text-center" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-[10px] uppercase mb-1">Fila C</label>
                                            <input type="number" value={ringsidePrices.north.rowC}
                                                onChange={(e) => setRingsidePrices(p => ({ ...p, north: { ...p.north, rowC: parseInt(e.target.value) || 0 } }))}
                                                className="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-white text-sm text-center" />
                                        </div>
                                    </div>
                                </div>

                                {/* Sur */}
                                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                                    <div>
                                        <label className="block text-green-500 font-bold text-xs uppercase mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            value={ringsidePrices.south.alias}
                                            onChange={(e) => setRingsidePrices(p => ({ ...p, south: { ...p.south, alias: e.target.value } }))}
                                            className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white text-sm"
                                            placeholder="Lado Sur"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-gray-500 text-[10px] uppercase mb-1">Fila A</label>
                                            <input type="number" value={ringsidePrices.south.rowA}
                                                onChange={(e) => setRingsidePrices(p => ({ ...p, south: { ...p.south, rowA: parseInt(e.target.value) || 0 } }))}
                                                className="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-white text-sm text-center" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-[10px] uppercase mb-1">Fila B</label>
                                            <input type="number" value={ringsidePrices.south.rowB}
                                                onChange={(e) => setRingsidePrices(p => ({ ...p, south: { ...p.south, rowB: parseInt(e.target.value) || 0 } }))}
                                                className="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-white text-sm text-center" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-[10px] uppercase mb-1">Fila C</label>
                                            <input type="number" value={ringsidePrices.south.rowC}
                                                onChange={(e) => setRingsidePrices(p => ({ ...p, south: { ...p.south, rowC: parseInt(e.target.value) || 0 } }))}
                                                className="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-white text-sm text-center" />
                                        </div>
                                    </div>
                                </div>

                                {/* Oeste */}
                                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                                    <div>
                                        <label className="block text-blue-500 font-bold text-xs uppercase mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            value={ringsidePrices.west.alias}
                                            onChange={(e) => setRingsidePrices(p => ({ ...p, west: { ...p.west, alias: e.target.value } }))}
                                            className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white text-sm"
                                            placeholder="Lado Oeste"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-gray-500 text-[10px] uppercase mb-1">Fila A</label>
                                            <input type="number" value={ringsidePrices.west.rowA}
                                                onChange={(e) => setRingsidePrices(p => ({ ...p, west: { ...p.west, rowA: parseInt(e.target.value) || 0 } }))}
                                                className="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-white text-sm text-center" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-[10px] uppercase mb-1">Fila B</label>
                                            <input type="number" value={ringsidePrices.west.rowB}
                                                onChange={(e) => setRingsidePrices(p => ({ ...p, west: { ...p.west, rowB: parseInt(e.target.value) || 0 } }))}
                                                className="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-white text-sm text-center" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-[10px] uppercase mb-1">Fila C</label>
                                            <input type="number" value={ringsidePrices.west.rowC}
                                                onChange={(e) => setRingsidePrices(p => ({ ...p, west: { ...p.west, rowC: parseInt(e.target.value) || 0 } }))}
                                                className="w-full bg-black border border-zinc-700 rounded px-2 py-1.5 text-white text-sm text-center" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {id && (
                                <div className="mt-4 text-center">
                                    <Link
                                        href={`/admin/eventos/${id}/seats`}
                                        className="text-xs text-gray-500 hover:text-lnl-gold underline"
                                    >
                                        Gestionar asientos vendidos/reservados
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </form>
    );
}

function PencilIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
    )
}
