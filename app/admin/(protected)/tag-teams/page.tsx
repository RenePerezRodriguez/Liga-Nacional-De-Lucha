"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, addDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { Plus, Users, Edit, Trash, X, Loader2, Trophy } from "lucide-react";

interface Wrestler {
    id: string;
    name: string;
    nickname?: string;
    image?: string;
}

interface TagTeam {
    id: string;
    name: string;
    slug: string;
    wrestler1Id: string;
    wrestler2Id: string;
    wrestler1Name?: string;
    wrestler2Name?: string;
    teamName?: string;
    image?: string;
    isActive: boolean;
    wins: number;
    losses: number;
    currentChampions?: boolean;
    createdAt?: Timestamp;
}

export default function TagTeamsPage() {
    const [teams, setTeams] = useState<TagTeam[]>([]);
    const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState<TagTeam | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        wrestler1Id: "",
        wrestler2Id: "",
        isActive: true
    });

    useEffect(() => {
        // Fetch wrestlers
        const wrestlersQuery = query(collection(db, "luchadores"), orderBy("name"));
        const unsubWrestlers = onSnapshot(wrestlersQuery, (snapshot) => {
            setWrestlers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Wrestler[]);
        });

        // Fetch tag teams
        const teamsQuery = query(collection(db, "tag_teams"), orderBy("name"));
        const unsubTeams = onSnapshot(teamsQuery, (snapshot) => {
            setTeams(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as TagTeam[]);
            setLoading(false);
        });

        return () => {
            unsubWrestlers();
            unsubTeams();
        };
    }, []);

    const getWrestlerById = (id: string) => wrestlers.find(w => w.id === id);

    const openAddModal = () => {
        setEditingTeam(null);
        setFormData({ name: "", wrestler1Id: "", wrestler2Id: "", isActive: true });
        setShowModal(true);
    };

    const openEditModal = (team: TagTeam) => {
        setEditingTeam(team);
        setFormData({
            name: team.name,
            wrestler1Id: team.wrestler1Id,
            wrestler2Id: team.wrestler2Id,
            isActive: team.isActive
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.wrestler1Id || !formData.wrestler2Id) {
            alert("Completa todos los campos");
            return;
        }

        if (formData.wrestler1Id === formData.wrestler2Id) {
            alert("Los luchadores deben ser diferentes");
            return;
        }

        const w1 = getWrestlerById(formData.wrestler1Id);
        const w2 = getWrestlerById(formData.wrestler2Id);

        const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        const teamData = {
            name: formData.name,
            slug,
            wrestler1Id: formData.wrestler1Id,
            wrestler2Id: formData.wrestler2Id,
            wrestler1Name: w1?.name || "",
            wrestler2Name: w2?.name || "",
            isActive: formData.isActive,
            updatedAt: Timestamp.now()
        };

        try {
            if (editingTeam) {
                await updateDoc(doc(db, "tag_teams", editingTeam.id), teamData);
            } else {
                await addDoc(collection(db, "tag_teams"), {
                    ...teamData,
                    wins: 0,
                    losses: 0,
                    createdAt: Timestamp.now()
                });
            }
            setShowModal(false);
        } catch (error) {
            console.error("Error saving tag team:", error);
            alert("Error al guardar");
        }
    };

    const handleDelete = async (team: TagTeam) => {
        if (confirm(`¿Eliminar equipo "${team.name}"?`)) {
            try {
                await deleteDoc(doc(db, "tag_teams", team.id));
            } catch (error) {
                console.error("Error deleting:", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-lnl-gold" />
                        Tag Teams
                    </h1>
                    <p className="text-gray-400 text-sm">Gestión de equipos de parejas</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-lnl-red text-white px-4 py-2 rounded font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-red-700"
                >
                    <Plus className="w-5 h-5" /> Nuevo Equipo
                </button>
            </div>

            {/* Teams Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-lnl-red" />
                </div>
            ) : teams.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No hay equipos registrados</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map(team => {
                        const w1 = getWrestlerById(team.wrestler1Id);
                        const w2 = getWrestlerById(team.wrestler2Id);

                        return (
                            <div
                                key={team.id}
                                className={`bg-zinc-900 border rounded-xl overflow-hidden ${team.currentChampions ? "border-lnl-gold" : "border-zinc-800"
                                    }`}
                            >
                                {/* Team Members */}
                                <div className="p-6">
                                    <div className="flex items-center justify-center gap-4 mb-4">
                                        {/* Wrestler 1 */}
                                        <div className="text-center">
                                            <div className="w-16 h-16 relative rounded-full overflow-hidden bg-zinc-700 mx-auto border-2 border-zinc-600">
                                                {w1?.image && (
                                                    <Image src={w1.image} alt={w1.name} fill className="object-cover" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1 truncate max-w-[80px]">{w1?.name}</p>
                                        </div>

                                        {/* & */}
                                        <span className="text-2xl font-black text-lnl-gold">&</span>

                                        {/* Wrestler 2 */}
                                        <div className="text-center">
                                            <div className="w-16 h-16 relative rounded-full overflow-hidden bg-zinc-700 mx-auto border-2 border-zinc-600">
                                                {w2?.image && (
                                                    <Image src={w2.image} alt={w2.name} fill className="object-cover" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1 truncate max-w-[80px]">{w2?.name}</p>
                                        </div>
                                    </div>

                                    {/* Team Name */}
                                    <h3 className="text-xl font-black text-white text-center uppercase italic mb-2">
                                        {team.name}
                                    </h3>

                                    {/* Stats */}
                                    <div className="flex justify-center gap-4 text-sm">
                                        <span className="text-green-500 font-bold">{team.wins}W</span>
                                        <span className="text-gray-500">-</span>
                                        <span className="text-red-500 font-bold">{team.losses}L</span>
                                    </div>

                                    {team.currentChampions && (
                                        <div className="flex items-center justify-center gap-1 text-lnl-gold text-xs font-bold mt-2">
                                            <Trophy className="w-3 h-3" /> Campeones
                                        </div>
                                    )}

                                    {!team.isActive && (
                                        <p className="text-center text-xs text-gray-500 mt-2">Inactivo</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="p-3 border-t border-zinc-800 bg-black/20 flex justify-end gap-2">
                                    <button
                                        onClick={() => openEditModal(team)}
                                        className="text-xs text-gray-300 hover:text-white font-bold uppercase px-3 py-1 bg-zinc-800 rounded flex items-center gap-1"
                                    >
                                        <Edit className="w-3 h-3" /> Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(team)}
                                        className="text-xs text-red-500 hover:text-red-400 font-bold uppercase px-3 py-1 bg-zinc-800 rounded flex items-center gap-1"
                                    >
                                        <Trash className="w-3 h-3" /> Eliminar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-white uppercase">
                                {editingTeam ? "Editar Equipo" : "Nuevo Equipo"}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Team Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre del Equipo</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white"
                                    placeholder="Los Destructores"
                                />
                            </div>

                            {/* Wrestler 1 */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Luchador 1</label>
                                <select
                                    value={formData.wrestler1Id}
                                    onChange={(e) => setFormData({ ...formData, wrestler1Id: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white"
                                >
                                    <option value="">Seleccionar...</option>
                                    {wrestlers.filter(w => w.id !== formData.wrestler2Id).map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Wrestler 2 */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Luchador 2</label>
                                <select
                                    value={formData.wrestler2Id}
                                    onChange={(e) => setFormData({ ...formData, wrestler2Id: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white"
                                >
                                    <option value="">Seleccionar...</option>
                                    {wrestlers.filter(w => w.id !== formData.wrestler1Id).map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Active Toggle */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded bg-black border-zinc-700"
                                />
                                <span className="text-sm text-gray-300">Equipo Activo</span>
                            </label>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 bg-zinc-800 text-white rounded-lg font-bold uppercase"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 bg-lnl-red text-white rounded-lg font-bold uppercase hover:bg-red-700"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
