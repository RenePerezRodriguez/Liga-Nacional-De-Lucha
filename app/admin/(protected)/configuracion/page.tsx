"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Save, MessageCircle, Share2, DollarSign } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";

export default function ConfigPage() {
    const router = useRouter();
    const { role, loading: roleLoading, isAdmin } = useUserRole();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [config, setConfig] = useState({
        whatsappVentas: "59170000000",
        whatsappAcademia: "59176900000",
        social: {
            facebook: "",
            instagram: "",
            tiktok: "",
            youtube: ""
        },
        basePrices: {
            general: "30",
            vip: "50",
            ringside: "80"
        }
    });

    useEffect(() => {
        if (!roleLoading && !isAdmin) {
            router.push("/admin");
            return;
        }

        async function fetchConfig() {
            try {
                const docRef = doc(db, "configuracion", "general");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setConfig(docSnap.data() as typeof config);
                }
            } catch (error) {
                console.error("Error fetching config:", error);
            } finally {
                setFetching(false);
            }
        }

        if (isAdmin) {
            fetchConfig();
        }
    }, [isAdmin, roleLoading, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await setDoc(doc(db, "configuracion", "general"), config);
            alert("Configuración guardada correctamente.");
        } catch (error) {
            console.error("Error saving config:", error);
            alert("Error al guardar.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-white" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">Configuración Global</h1>
                <p className="text-gray-400 text-sm">Ajustes generales del sitio web.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">

                {/* Contacto / WhatsApp */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white uppercase italic mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-green-500" /> Contacto (WhatsApp)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Entradas / Reservas</label>
                            <input
                                type="text"
                                value={config.whatsappVentas}
                                onChange={(e) => setConfig({ ...config, whatsappVentas: e.target.value })}
                                className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-lnl-gold focus:outline-none"
                            />
                            <p className="text-xs text-gray-600 mt-1">Número al que llegan los mensajes de compra de entradas.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Inscripción Academia</label>
                            <input
                                type="text"
                                value={config.whatsappAcademia}
                                onChange={(e) => setConfig({ ...config, whatsappAcademia: e.target.value })}
                                className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-lnl-gold focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Redes Sociales */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white uppercase italic mb-4 flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-blue-500" /> Redes Sociales
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Facebook URL</label>
                            <input
                                type="text"
                                value={config.social.facebook}
                                onChange={(e) => setConfig({ ...config, social: { ...config.social, facebook: e.target.value } })}
                                className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-lnl-gold focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instagram URL</label>
                            <input
                                type="text"
                                value={config.social.instagram}
                                onChange={(e) => setConfig({ ...config, social: { ...config.social, instagram: e.target.value } })}
                                className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-lnl-gold focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">TikTok URL</label>
                            <input
                                type="text"
                                value={config.social.tiktok}
                                onChange={(e) => setConfig({ ...config, social: { ...config.social, tiktok: e.target.value } })}
                                className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-lnl-gold focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">YouTube Channel URL</label>
                            <input
                                type="text"
                                value={config.social.youtube}
                                onChange={(e) => setConfig({ ...config, social: { ...config.social, youtube: e.target.value } })}
                                className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-lnl-gold focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Precios Base */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white uppercase italic mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-lnl-gold" /> Precios Base (Sugeridos)
                    </h2>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">General</label>
                            <input
                                type="number"
                                value={config.basePrices.general}
                                onChange={(e) => setConfig({ ...config, basePrices: { ...config.basePrices, general: e.target.value } })}
                                className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-lnl-gold focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">VIP</label>
                            <input
                                type="number"
                                value={config.basePrices.vip}
                                onChange={(e) => setConfig({ ...config, basePrices: { ...config.basePrices, vip: e.target.value } })}
                                className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-lnl-gold focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ringside</label>
                            <input
                                type="number"
                                value={config.basePrices.ringside}
                                onChange={(e) => setConfig({ ...config, basePrices: { ...config.basePrices, ringside: e.target.value } })}
                                className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-lnl-gold focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end sticky bottom-4 bg-black/80 backdrop-blur p-4 border border-zinc-800 rounded-xl">
                    <button
                        type="submit" disabled={loading}
                        className="bg-lnl-red text-white py-3 px-8 rounded font-black uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-red-900/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Guardar Configuración Total
                    </button>
                </div>

            </form>
        </div>
    );
}
