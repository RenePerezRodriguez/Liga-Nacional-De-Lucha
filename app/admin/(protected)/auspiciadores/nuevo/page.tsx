"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { ArrowLeft, Handshake, Save, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { compressImage } from "@/lib/image-compression";
import { TourButton } from "@/components/admin/admin-tour";
import { sponsorFormTour } from "@/lib/tour-definitions";

export default function NewSponsorPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [form, setForm] = useState({
        name: "",
        type: "partner",
        description: "",
        website: ""
    });

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const compressed = await compressImage(file, 0.9, 400);
            setImageFile(compressed);
            setImagePreview(URL.createObjectURL(compressed));
        } catch (error) {
            console.error(error);
            // Use original if compression fails
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let logoUrl = "";
            if (imageFile) {
                const timestamp = Date.now();
                const filename = `${timestamp}_${imageFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
                const storageRef = ref(storage, `sponsors/${filename}`);
                await uploadBytes(storageRef, imageFile);
                logoUrl = await getDownloadURL(storageRef);
            }

            await addDoc(collection(db, "auspiciadores"), {
                ...form,
                logo: logoUrl,
                createdAt: serverTimestamp()
            });
            alert("Auspiciador guardado correctamente");
            router.push("/admin/auspiciadores");
        } catch (error) {
            console.error(error);
            alert("Error al guardar");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <Link href="/admin/auspiciadores" className="inline-flex items-center gap-2 text-gray-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4" /> Volver a Auspiciadores
                </Link>
                <TourButton tourId="sponsor-form" steps={sponsorFormTour} />
            </div>

            <h1 className="text-3xl font-black text-white uppercase italic tracking-tight mb-8 flex items-center gap-3">
                <Handshake className="text-lnl-gold" /> Nuevo Auspiciador
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                {/* Logo Upload */}
                <div data-tour="sponsor-logo">
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Logo</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-40 h-40 bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-full cursor-pointer hover:border-lnl-gold transition-colors flex items-center justify-center mx-auto relative overflow-hidden"
                    >
                        {imagePreview ? (
                            <>
                                <Image src={imagePreview} alt="Preview" fill className="object-contain p-2" />
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); }}
                                    className="absolute top-0 right-0 bg-red-600 p-1 rounded-full"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </>
                        ) : (
                            <div className="text-center">
                                <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                                <span className="text-xs text-zinc-500">Subir Logo</span>
                            </div>
                        )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>

                <div data-tour="sponsor-name">
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre</label>
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-lnl-gold focus:outline-none"
                        placeholder="ej: Cerveza Paceña"
                    />
                </div>

                <div data-tour="sponsor-type">
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Tipo de Patrocinio</label>
                    <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-lnl-gold focus:outline-none"
                    >
                        <option value="principal">Patrocinador Principal</option>
                        <option value="partner">Partner Oficial</option>
                        <option value="media">Media Partner</option>
                        <option value="colaborador">Colaborador</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-lnl-gold focus:outline-none h-24"
                        placeholder="Breve descripción del auspiciador..."
                    />
                </div>

                <div data-tour="sponsor-website">
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Sitio Web</label>
                    <input
                        type="url"
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-lnl-gold focus:outline-none"
                        placeholder="https://www.ejemplo.com"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-lnl-gold text-black font-bold uppercase tracking-wider py-4 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Save className="w-5 h-5" />
                    {loading ? "Guardando..." : "Guardar Auspiciador"}
                </button>
            </form>
        </div>
    );
}
