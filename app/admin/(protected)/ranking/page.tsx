"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, updateDoc, doc, DocumentData, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/toast-provider";
import Link from "next/link";
import Image from "next/image";
import {
    Trophy,
    GripVertical,
    TrendingUp,
    TrendingDown,
    Minus,
    Save,
    ArrowLeft,
    Info,
    Plus,
    X,
    UserPlus,
    Edit,
    MessageSquare
} from "lucide-react";

interface WrestlerRanking extends DocumentData {
    id: string;
    name: string;
    nickname?: string;
    image?: string;
    rankingPoints?: number;
    rankingMovement?: "up" | "down" | "same";
    rankingReason?: string;
}

export default function RankingAdminPage() {
    const [rankedWrestlers, setRankedWrestlers] = useState<WrestlerRanking[]>([]);
    const [allWrestlers, setAllWrestlers] = useState<WrestlerRanking[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingWrestler, setEditingWrestler] = useState<WrestlerRanking | null>(null);
    const [editReason, setEditReason] = useState("");
    const toast = useToast();

    useEffect(() => {
        const q = query(collection(db, "luchadores"), orderBy("name"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WrestlerRanking[];
            setAllWrestlers(data);

            // Filter and sort wrestlers with ranking points
            const ranked = data
                .filter(w => w.rankingPoints && w.rankingPoints > 0)
                .sort((a, b) => (b.rankingPoints || 0) - (a.rankingPoints || 0));
            setRankedWrestlers(ranked);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const availableWrestlers = allWrestlers.filter(
        w => !rankedWrestlers.find(r => r.id === w.id)
    );

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newWrestlers = [...rankedWrestlers];
        const draggedItem = newWrestlers[draggedIndex];
        newWrestlers.splice(draggedIndex, 1);
        newWrestlers.splice(index, 0, draggedItem);

        setRankedWrestlers(newWrestlers);
        setDraggedIndex(index);
        setHasChanges(true);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const addToRanking = (wrestler: WrestlerRanking) => {
        setRankedWrestlers([...rankedWrestlers, { ...wrestler, rankingMovement: "up" }]);
        setHasChanges(true);
        setShowAddModal(false);
        toast.info(`${wrestler.name} añadido al ranking`);
    };

    const removeFromRanking = async (wrestler: WrestlerRanking) => {
        if (confirm(`¿Quitar a ${wrestler.name} del ranking?`)) {
            setRankedWrestlers(rankedWrestlers.filter(w => w.id !== wrestler.id));
            try {
                await updateDoc(doc(db, "luchadores", wrestler.id), {
                    rankingPoints: 0,
                    rankingMovement: "same",
                    rankingReason: ""
                });
                setHasChanges(true);
                toast.success(`${wrestler.name} removido del ranking`);
            } catch (error) {
                console.error(error);
                toast.error("Error al remover del ranking");
            }
        }
    };

    const openEditModal = (wrestler: WrestlerRanking) => {
        setEditingWrestler(wrestler);
        setEditReason(wrestler.rankingReason || "");
    };

    const saveReasonLocally = () => {
        if (!editingWrestler) return;

        // Update locally
        setRankedWrestlers(rankedWrestlers.map(w =>
            w.id === editingWrestler.id
                ? { ...w, rankingReason: editReason }
                : w
        ));
        setHasChanges(true);
        setEditingWrestler(null);
        toast.info("Razón actualizada. No olvides guardar los cambios.");
    };

    const saveRanking = async () => {
        setSaving(true);
        try {
            const batch = writeBatch(db);

            rankedWrestlers.forEach((wrestler, index) => {
                const points = (rankedWrestlers.length - index) * 100;
                const ref = doc(db, "luchadores", wrestler.id);
                batch.update(ref, {
                    rankingPoints: points,
                    rankingMovement: wrestler.rankingMovement || "same",
                    rankingReason: wrestler.rankingReason || ""
                });
            });

            await batch.commit();
            toast.success("Ranking guardado correctamente");
            setHasChanges(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar el ranking");
        }
        setSaving(false);
    };

    const setMovement = (index: number, movement: "up" | "down" | "same") => {
        const newWrestlers = [...rankedWrestlers];
        newWrestlers[index] = { ...newWrestlers[index], rankingMovement: movement };
        setRankedWrestlers(newWrestlers);
        setHasChanges(true);
    };

    const getMovementIcon = (movement?: string) => {
        switch (movement) {
            case "up": return <TrendingUp className="w-5 h-5 text-green-500" />;
            case "down": return <TrendingDown className="w-5 h-5 text-red-500" />;
            default: return <Minus className="w-5 h-5 text-gray-600" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <Trophy className="text-lnl-gold" /> Power Rankings
                        </h1>
                        <p className="text-gray-400 text-sm">Arrastra para reordenar. Clic en ✏️ para editar razón.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-3 rounded font-bold uppercase tracking-wider flex items-center gap-2 bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                    >
                        <UserPlus className="w-5 h-5" /> Añadir
                    </button>
                    <button
                        onClick={saveRanking}
                        disabled={saving || !hasChanges}
                        className={`px-6 py-3 rounded font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${hasChanges
                            ? "bg-lnl-gold text-black hover:bg-yellow-500"
                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            }`}
                    >
                        <Save className="w-5 h-5" />
                        {saving ? "Guardando..." : hasChanges ? "Guardar" : "Sin Cambios"}
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-300">
                    <strong>Cómo funciona:</strong> Arrastra para cambiar posición. Usa ✏️ para añadir la razón del ranking (ej: Campeón reinante). Los botones ↑ — ↓ indican movimiento semanal.
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Cargando ranking...</div>
            ) : rankedWrestlers.length === 0 ? (
                <div className="text-center py-20">
                    <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-4">No hay luchadores en el ranking.</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-lnl-gold text-black font-bold uppercase rounded hover:bg-yellow-500 transition-colors inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Añadir Luchadores
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {rankedWrestlers.map((wrestler, index) => (
                        <div
                            key={wrestler.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center gap-3 bg-zinc-900 p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${draggedIndex === index
                                ? "border-lnl-gold scale-[1.02] shadow-lg"
                                : "border-zinc-800 hover:border-zinc-700"
                                }`}
                        >
                            {/* Drag Handle */}
                            <div className="text-zinc-600 hover:text-white transition-colors">
                                <GripVertical className="w-5 h-5" />
                            </div>

                            {/* Rank Number */}
                            <div className="w-10 text-center flex-shrink-0">
                                <span className="text-2xl font-black text-lnl-gold">#{index + 1}</span>
                            </div>

                            {/* Avatar */}
                            <div className="w-12 h-12 relative rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 flex-shrink-0">
                                {wrestler.image ? (
                                    <Image src={wrestler.image} alt={wrestler.name} fill className="object-cover" sizes="48px" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold">?</div>
                                )}
                            </div>

                            {/* Name + Reason */}
                            <div className="flex-grow min-w-0">
                                <h3 className="text-lg font-bold text-white uppercase italic truncate">{wrestler.name}</h3>
                                {wrestler.rankingReason ? (
                                    <p className="text-xs text-gray-500 truncate">{wrestler.rankingReason}</p>
                                ) : (
                                    <p className="text-xs text-gray-600 italic">Sin razón - clic en ✏️</p>
                                )}
                            </div>

                            {/* Edit Reason Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); openEditModal(wrestler); }}
                                className="p-2 text-zinc-500 hover:text-lnl-gold hover:bg-zinc-800 rounded transition-colors flex-shrink-0"
                                title="Editar razón"
                            >
                                <Edit className="w-4 h-4" />
                            </button>

                            {/* Movement Buttons */}
                            <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1 flex-shrink-0">
                                <button
                                    onClick={() => setMovement(index, "up")}
                                    className={`p-2 rounded ${wrestler.rankingMovement === "up" ? "bg-green-600" : "hover:bg-zinc-700"}`}
                                    title="Subió"
                                >
                                    <TrendingUp className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setMovement(index, "same")}
                                    className={`p-2 rounded ${!wrestler.rankingMovement || wrestler.rankingMovement === "same" ? "bg-zinc-600" : "hover:bg-zinc-700"}`}
                                    title="Sin cambio"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setMovement(index, "down")}
                                    className={`p-2 rounded ${wrestler.rankingMovement === "down" ? "bg-red-600" : "hover:bg-zinc-700"}`}
                                    title="Bajó"
                                >
                                    <TrendingDown className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Movement Indicator */}
                            <div className="w-6 flex justify-center flex-shrink-0">
                                {getMovementIcon(wrestler.rankingMovement)}
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={() => removeFromRanking(wrestler)}
                                className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors flex-shrink-0"
                                title="Quitar del ranking"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Añadir al Ranking</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-zinc-800 rounded-full">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            {availableWrestlers.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Todos los luchadores ya están en el ranking.</p>
                            ) : (
                                <div className="space-y-2">
                                    {availableWrestlers.map(wrestler => (
                                        <button
                                            key={wrestler.id}
                                            onClick={() => addToRanking(wrestler)}
                                            className="w-full flex items-center gap-4 p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 relative rounded-full overflow-hidden bg-zinc-700 flex-shrink-0">
                                                {wrestler.image ? (
                                                    <Image src={wrestler.image} alt={wrestler.name} fill className="object-cover" sizes="40px" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">?</div>
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="text-white font-bold">{wrestler.name}</h4>
                                                {wrestler.nickname && <p className="text-xs text-gray-500">{wrestler.nickname}</p>}
                                            </div>
                                            <Plus className="w-5 h-5 text-lnl-gold" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Reason Modal */}
            {editingWrestler && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setEditingWrestler(null)}>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-lnl-gold" /> Razón del Ranking
                            </h2>
                            <button onClick={() => setEditingWrestler(null)} className="p-2 hover:bg-zinc-800 rounded-full">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 relative rounded-full overflow-hidden bg-zinc-700 flex-shrink-0">
                                    {editingWrestler.image ? (
                                        <Image src={editingWrestler.image} alt={editingWrestler.name} fill className="object-cover" sizes="48px" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-500">?</div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold uppercase italic">{editingWrestler.name}</h3>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                    ¿Por qué está en esta posición?
                                </label>
                                <textarea
                                    value={editReason}
                                    onChange={(e) => setEditReason(e.target.value)}
                                    placeholder="ej: Campeón reinante con 5 defensas exitosas. Victoria sobre El Gigante en el último evento."
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-600 focus:border-lnl-gold focus:outline-none h-28 resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditingWrestler(null)}
                                    className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded font-bold hover:bg-zinc-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={saveReasonLocally}
                                    className="flex-1 px-4 py-2 bg-lnl-gold text-black rounded font-bold hover:bg-yellow-500 transition-colors"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
