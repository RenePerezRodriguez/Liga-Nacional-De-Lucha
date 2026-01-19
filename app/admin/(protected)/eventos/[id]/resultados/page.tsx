"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc, getDocs, query, where, Timestamp, writeBatch, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, ArrowLeft, Trophy, Check, Swords, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { calculateEloChange, formatPointChange, getRankingTier, DEFAULT_ELO_RATING } from "@/lib/elo-ranking";
import { updateStatsAfterMatch, DEFAULT_WRESTLER_STATS, type WrestlerStats } from "@/lib/wrestling-stats";

interface Match {
    id: string;
    matchType: string;
    wrestler1Id: string;
    wrestler2Id: string;
    isMainEvent?: boolean;
    isForTitle?: boolean;
    championshipId?: string;
    championshipName?: string;
    winnerId?: string;
    winnerName?: string;
    result?: string;
    isResultRecorded?: boolean;
}

interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    matches: Match[];
}

interface Wrestler {
    id: string;
    name: string;
    nickname?: string;
    image?: string;
    rankingPoints?: number;
    // Stats fields
    stats?: WrestlerStats;
}

interface Championship {
    id: string;
    title: string;
    currentChampionId?: string;
}

interface EloPreview {
    matchId: string;
    winnerId: string;
    winnerChange: number;
    loserId: string;
    loserChange: number;
}

const RESULT_TYPES = [
    "Pinfall",
    "Submission",
    "Knockout",
    "Countout",
    "DQ (Descalificación)",
    "Rendición",
    "Interferencia",
    "Double Countout",
    "No Contest"
];

export default function EventResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [event, setEvent] = useState<Event | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [wrestlers, setWrestlers] = useState<Map<string, Wrestler>>(new Map());
    const [championships, setChampionships] = useState<Map<string, Championship>>(new Map());
    const [eloPreviews, setEloPreviews] = useState<Map<string, EloPreview>>(new Map());

    useEffect(() => {
        async function fetchData() {
            try {
                const eventDoc = await getDoc(doc(db, "eventos", id));
                if (!eventDoc.exists()) {
                    alert("Evento no encontrado");
                    router.push("/admin/eventos");
                    return;
                }

                const eventData = { id: eventDoc.id, ...eventDoc.data() } as Event;
                setEvent(eventData);
                setMatches(eventData.matches || []);

                const wrestlerIds = new Set<string>();
                eventData.matches?.forEach(m => {
                    if (m.wrestler1Id) wrestlerIds.add(m.wrestler1Id);
                    if (m.wrestler2Id) wrestlerIds.add(m.wrestler2Id);
                });

                const wrestlerMap = new Map<string, Wrestler>();
                for (const wId of wrestlerIds) {
                    const wDoc = await getDoc(doc(db, "luchadores", wId));
                    if (wDoc.exists()) {
                        wrestlerMap.set(wId, { id: wDoc.id, ...wDoc.data() } as Wrestler);
                    }
                }
                setWrestlers(wrestlerMap);

                const champIds = new Set<string>();
                eventData.matches?.forEach(m => {
                    if (m.isForTitle && m.championshipId) champIds.add(m.championshipId);
                });

                const champMap = new Map<string, Championship>();
                for (const cId of champIds) {
                    const cDoc = await getDoc(doc(db, "campeonatos", cId));
                    if (cDoc.exists()) {
                        champMap.set(cId, { id: cDoc.id, ...cDoc.data() } as Championship);
                    }
                }
                setChampionships(champMap);

            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, router]);

    // Calculate ELO preview when winner is selected
    const updateMatchResult = (matchId: string, field: keyof Match, value: string) => {
        setMatches(prev => {
            const updated = prev.map(m => {
                if (m.id === matchId) {
                    const updatedMatch = { ...m, [field]: value };
                    if (field === "winnerId" && value) {
                        const wrestler = wrestlers.get(value);
                        updatedMatch.winnerName = wrestler?.name || "";
                    }
                    return updatedMatch;
                }
                return m;
            });

            // Calculate ELO previews for all matches with winners
            const newPreviews = new Map<string, EloPreview>();
            updated.forEach(match => {
                if (match.winnerId) {
                    const loserId = match.winnerId === match.wrestler1Id ? match.wrestler2Id : match.wrestler1Id;
                    const winnerRating = wrestlers.get(match.winnerId)?.rankingPoints || DEFAULT_ELO_RATING;
                    const loserRating = wrestlers.get(loserId)?.rankingPoints || DEFAULT_ELO_RATING;

                    const result = calculateEloChange(winnerRating, loserRating, {
                        isForTitle: match.isForTitle,
                        isMainEvent: match.isMainEvent
                    });

                    newPreviews.set(match.id, {
                        matchId: match.id,
                        winnerId: match.winnerId,
                        winnerChange: result.winnerChange,
                        loserId,
                        loserChange: result.loserChange
                    });
                }
            });
            setEloPreviews(newPreviews);

            return updated;
        });
    };

    const handleSaveResults = async () => {
        const incompleteMatches = matches.filter(m => !m.winnerId || !m.result);
        if (incompleteMatches.length > 0) {
            alert(`Hay ${incompleteMatches.length} lucha(s) sin resultado completo.`);
            return;
        }

        setSaving(true);

        try {
            const batch = writeBatch(db);
            const newsToCreate: Array<{ title: string; content: string; category: string }> = [];

            // Track cumulative ELO changes per wrestler (wrestler can have multiple matches)
            const eloChanges = new Map<string, number>();

            // Process each match
            for (const match of matches) {
                match.isResultRecorded = true;

                if (match.winnerId) {
                    const loserId = match.winnerId === match.wrestler1Id ? match.wrestler2Id : match.wrestler1Id;
                    const winner = wrestlers.get(match.winnerId);
                    const loser = wrestlers.get(loserId);

                    const winnerCurrentRating = (winner?.rankingPoints || DEFAULT_ELO_RATING) + (eloChanges.get(match.winnerId) || 0);
                    const loserCurrentRating = (loser?.rankingPoints || DEFAULT_ELO_RATING) + (eloChanges.get(loserId) || 0);

                    const eloResult = calculateEloChange(winnerCurrentRating, loserCurrentRating, {
                        isForTitle: match.isForTitle,
                        isMainEvent: match.isMainEvent
                    });

                    // Accumulate changes
                    eloChanges.set(match.winnerId, (eloChanges.get(match.winnerId) || 0) + eloResult.winnerChange);
                    eloChanges.set(loserId, (eloChanges.get(loserId) || 0) + eloResult.loserChange);
                }

                // Handle championship matches
                if (match.isForTitle && match.championshipId && match.winnerId) {
                    const champ = championships.get(match.championshipId);
                    if (champ) {
                        const isNewChampion = champ.currentChampionId !== match.winnerId;
                        const loserId = match.winnerId === match.wrestler1Id ? match.wrestler2Id : match.wrestler1Id;
                        const loser = wrestlers.get(loserId);
                        const winner = wrestlers.get(match.winnerId);

                        if (isNewChampion) {
                            const champRef = doc(db, "campeonatos", match.championshipId);
                            batch.update(champRef, {
                                currentChampionId: match.winnerId,
                                currentDefenses: 0,
                                wonAt: Timestamp.now(),
                                updatedAt: Timestamp.now()
                            });

                            const reignRef = doc(collection(db, "campeonatos", match.championshipId, "reigns"));
                            batch.set(reignRef, {
                                wrestlerId: match.winnerId,
                                wrestlerName: winner?.name || "",
                                wonAt: Timestamp.now(),
                                lostAt: null,
                                wonAtEventId: id,
                                wonAtEventName: event?.title || "",
                                wonAgainstId: loser?.id || "",
                                wonAgainstName: loser?.name || "",
                                defenses: 0,
                                reignNumber: 1
                            });

                            if (champ.currentChampionId) {
                                const prevReignsQuery = query(
                                    collection(db, "campeonatos", match.championshipId, "reigns"),
                                    where("wrestlerId", "==", champ.currentChampionId),
                                    where("lostAt", "==", null)
                                );
                                const prevReigns = await getDocs(prevReignsQuery);
                                prevReigns.forEach(reignDoc => {
                                    batch.update(reignDoc.ref, {
                                        lostAt: Timestamp.now(),
                                        lostAtEventId: id,
                                        lostAtEventName: event?.title || "",
                                        lostToId: match.winnerId,
                                        lostToName: winner?.name || ""
                                    });
                                });
                            }

                            newsToCreate.push({
                                title: `¡${winner?.name?.toUpperCase()} ES EL NUEVO CAMPEÓN!`,
                                content: `<h2>🏆 ¡NUEVO CAMPEÓN!</h2><p><strong>${winner?.name}</strong> derrotó a <strong>${loser?.name}</strong> para convertirse en el nuevo <strong>${champ.title}</strong> en ${event?.title}.</p><p>El final llegó mediante <em>${match.result}</em>.</p>`,
                                category: "Resultados"
                            });

                            // Add championship to winner's championships array
                            const winnerRef = doc(db, "luchadores", match.winnerId);
                            batch.update(winnerRef, {
                                championships: arrayUnion(match.championshipId)
                            });
                        } else {
                            const champRef = doc(db, "campeonatos", match.championshipId);
                            batch.update(champRef, {
                                currentDefenses: (champ as Championship & { currentDefenses?: number }).currentDefenses ? ((champ as Championship & { currentDefenses?: number }).currentDefenses || 0) + 1 : 1,
                                updatedAt: Timestamp.now()
                            });
                        }
                    }
                }
            }

            // Apply ELO changes and W-L stats to wrestlers
            for (const [wrestlerId, change] of eloChanges) {
                const wrestler = wrestlers.get(wrestlerId);
                const currentRating = wrestler?.rankingPoints || DEFAULT_ELO_RATING;
                const newRating = Math.max(100, currentRating + change);

                const wrestlerRef = doc(db, "luchadores", wrestlerId);
                batch.update(wrestlerRef, {
                    rankingPoints: newRating,
                    rankingMovement: change > 0 ? "up" : change < 0 ? "down" : "same",
                    rankingReason: `${event?.title} (${formatPointChange(change)})`,
                    updatedAt: Timestamp.now()
                });
            }

            // Save match history and update wrestler W-L stats
            const wrestlerStatsUpdates = new Map<string, WrestlerStats>();

            for (const match of matches) {
                if (!match.winnerId) continue;

                const loserId = match.winnerId === match.wrestler1Id ? match.wrestler2Id : match.wrestler1Id;
                const winner = wrestlers.get(match.winnerId);
                const loser = wrestlers.get(loserId);
                const champ = match.championshipId ? championships.get(match.championshipId) : null;
                const isNewChampion = champ ? champ.currentChampionId !== match.winnerId : false;

                // Save to match_history collection
                const matchHistoryRef = doc(collection(db, "match_history"));
                batch.set(matchHistoryRef, {
                    eventId: id,
                    eventName: event?.title || "",
                    eventDate: event?.date || "",
                    matchId: match.id,
                    wrestler1Id: match.wrestler1Id,
                    wrestler1Name: wrestlers.get(match.wrestler1Id)?.name || "",
                    wrestler2Id: match.wrestler2Id,
                    wrestler2Name: wrestlers.get(match.wrestler2Id)?.name || "",
                    winnerId: match.winnerId,
                    winnerName: winner?.name || "",
                    loserId: loserId,
                    loserName: loser?.name || "",
                    result: match.result || "",
                    isForTitle: match.isForTitle || false,
                    championshipId: match.championshipId || null,
                    championshipName: match.championshipName || null,
                    isMainEvent: match.isMainEvent || false,
                    createdAt: Timestamp.now()
                });

                // Update winner stats
                const winnerCurrentStats = wrestlerStatsUpdates.get(match.winnerId) || winner?.stats || DEFAULT_WRESTLER_STATS;
                const winnerNewStats = updateStatsAfterMatch(
                    winnerCurrentStats,
                    true,
                    match.result || "",
                    match.isMainEvent || false,
                    match.isForTitle || false,
                    isNewChampion,
                    loser?.name || "",
                    event?.date || ""
                );
                wrestlerStatsUpdates.set(match.winnerId, winnerNewStats);

                // Update loser stats
                const loserCurrentStats = wrestlerStatsUpdates.get(loserId) || loser?.stats || DEFAULT_WRESTLER_STATS;
                const loserNewStats = updateStatsAfterMatch(
                    loserCurrentStats,
                    false,
                    match.result || "",
                    match.isMainEvent || false,
                    match.isForTitle || false,
                    false,
                    winner?.name || "",
                    event?.date || ""
                );
                wrestlerStatsUpdates.set(loserId, loserNewStats);
            }

            // Apply W-L stats updates
            for (const [wrestlerId, stats] of wrestlerStatsUpdates) {
                const wrestlerRef = doc(db, "luchadores", wrestlerId);
                batch.update(wrestlerRef, {
                    stats: stats
                });
            }

            // Update event
            const eventRef = doc(db, "eventos", id);
            batch.update(eventRef, {
                matches: matches,
                resultsRecorded: true,
                updatedAt: Timestamp.now()
            });

            await batch.commit();

            // Create news
            for (const news of newsToCreate) {
                await addDoc(collection(db, "noticias"), {
                    ...news,
                    slug: news.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-"),
                    date: new Date().toISOString().split("T")[0],
                    excerpt: news.content.replace(/<[^>]*>/g, "").substring(0, 150) + "...",
                    seoTitle: news.title,
                    seoDescription: news.content.replace(/<[^>]*>/g, "").substring(0, 150),
                    createdAt: Timestamp.now()
                });
            }

            const rankingUpdates = eloChanges.size;
            alert(`¡Resultados guardados!\n• ${rankingUpdates} luchadores actualizaron su ELO\n• ${newsToCreate.length} noticia(s) creada(s)`);
            router.push("/admin/eventos");
            router.refresh();

        } catch (error) {
            console.error("Error saving results:", error);
            alert("Error al guardar los resultados.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 animate-spin text-lnl-red" />
            </div>
        );
    }

    if (!event) {
        return <div className="text-center text-gray-500 py-20">Evento no encontrado</div>;
    }

    const allResultsComplete = matches.every(m => m.winnerId && m.result);

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/eventos" className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">
                        Registrar Resultados
                    </h1>
                    <p className="text-sm text-gray-400">{event.title} • {event.date}</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-purple-900/20 border border-purple-800 rounded-xl p-4 mb-8 flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-300">
                    <p className="font-bold mb-1">Sistema ELO Automático</p>
                    <p className="text-purple-400/80">
                        Los rankings se actualizan automáticamente al guardar. Victorias contra oponentes mejor rankeados = más puntos.
                        Las luchas por título y eventos estelares tienen mayor impacto.
                    </p>
                </div>
            </div>

            {/* Matches List */}
            <div className="space-y-6">
                {matches.map((match, index) => {
                    const wrestler1 = wrestlers.get(match.wrestler1Id);
                    const wrestler2 = wrestlers.get(match.wrestler2Id);
                    const isComplete = match.winnerId && match.result;
                    const eloPreview = eloPreviews.get(match.id);
                    const tier1 = getRankingTier(wrestler1?.rankingPoints || DEFAULT_ELO_RATING);
                    const tier2 = getRankingTier(wrestler2?.rankingPoints || DEFAULT_ELO_RATING);

                    return (
                        <div
                            key={match.id}
                            className={`bg-zinc-900 border rounded-xl p-6 ${match.isForTitle ? "border-lnl-gold" : isComplete ? "border-green-600" : "border-zinc-800"
                                }`}
                        >
                            {/* Match Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-500">LUCHA #{index + 1}</span>
                                    {match.isMainEvent && (
                                        <span className="text-xs font-bold text-lnl-gold bg-lnl-gold/20 px-2 py-0.5 rounded">
                                            ⭐ ESTELAR (+40 K)
                                        </span>
                                    )}
                                    {match.isForTitle && (
                                        <span className="text-xs font-bold text-lnl-gold bg-lnl-gold/20 px-2 py-0.5 rounded flex items-center gap-1">
                                            <Trophy className="w-3 h-3" /> TÍTULO (+48 K)
                                        </span>
                                    )}
                                </div>
                                {isComplete && (
                                    <span className="text-xs font-bold text-green-500 bg-green-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Completo
                                    </span>
                                )}
                            </div>

                            {/* Wrestlers Display */}
                            <div className="grid grid-cols-3 gap-4 items-center mb-6">
                                {/* Wrestler 1 */}
                                <div
                                    onClick={() => updateMatchResult(match.id, "winnerId", match.wrestler1Id)}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all text-center ${match.winnerId === match.wrestler1Id
                                        ? "border-green-500 bg-green-500/10"
                                        : "border-zinc-700 hover:border-zinc-500"
                                        }`}
                                >
                                    {wrestler1?.image && (
                                        <div className="w-16 h-16 relative rounded-full overflow-hidden mx-auto mb-2 border-2 border-zinc-700">
                                            <Image src={wrestler1.image} alt={wrestler1.name} fill className="object-cover" />
                                        </div>
                                    )}
                                    <p className="font-bold text-white text-sm">{wrestler1?.name || "TBD"}</p>
                                    <p className={`text-[10px] font-bold ${tier1.color}`}>
                                        {wrestler1?.rankingPoints || DEFAULT_ELO_RATING} pts • {tier1.name}
                                    </p>
                                    {match.winnerId === match.wrestler1Id && eloPreview && (
                                        <span className="text-xs text-green-400 font-bold mt-1 flex items-center justify-center gap-1">
                                            <TrendingUp className="w-3 h-3" /> {formatPointChange(eloPreview.winnerChange)}
                                        </span>
                                    )}
                                    {match.winnerId === match.wrestler2Id && eloPreview && (
                                        <span className="text-xs text-red-400 font-bold mt-1 flex items-center justify-center gap-1">
                                            <TrendingDown className="w-3 h-3" /> {formatPointChange(eloPreview.loserChange)}
                                        </span>
                                    )}
                                </div>

                                {/* VS */}
                                <div className="text-center">
                                    <Swords className="w-8 h-8 text-lnl-red mx-auto mb-1" />
                                    <span className="text-2xl font-black text-lnl-gold italic">VS</span>
                                </div>

                                {/* Wrestler 2 */}
                                <div
                                    onClick={() => updateMatchResult(match.id, "winnerId", match.wrestler2Id)}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all text-center ${match.winnerId === match.wrestler2Id
                                        ? "border-green-500 bg-green-500/10"
                                        : "border-zinc-700 hover:border-zinc-500"
                                        }`}
                                >
                                    {wrestler2?.image && (
                                        <div className="w-16 h-16 relative rounded-full overflow-hidden mx-auto mb-2 border-2 border-zinc-700">
                                            <Image src={wrestler2.image} alt={wrestler2.name} fill className="object-cover" />
                                        </div>
                                    )}
                                    <p className="font-bold text-white text-sm">{wrestler2?.name || "TBD"}</p>
                                    <p className={`text-[10px] font-bold ${tier2.color}`}>
                                        {wrestler2?.rankingPoints || DEFAULT_ELO_RATING} pts • {tier2.name}
                                    </p>
                                    {match.winnerId === match.wrestler2Id && eloPreview && (
                                        <span className="text-xs text-green-400 font-bold mt-1 flex items-center justify-center gap-1">
                                            <TrendingUp className="w-3 h-3" /> {formatPointChange(eloPreview.winnerChange)}
                                        </span>
                                    )}
                                    {match.winnerId === match.wrestler1Id && eloPreview && (
                                        <span className="text-xs text-red-400 font-bold mt-1 flex items-center justify-center gap-1">
                                            <TrendingDown className="w-3 h-3" /> {formatPointChange(eloPreview.loserChange)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Result Type */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de Victoria</label>
                                <select
                                    value={match.result || ""}
                                    onChange={(e) => updateMatchResult(match.id, "result", e.target.value)}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold"
                                >
                                    <option value="">Seleccionar...</option>
                                    {RESULT_TYPES.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Title Match Info */}
                            {match.isForTitle && match.winnerId && (
                                <div className="mt-4 p-3 bg-lnl-gold/10 border border-lnl-gold/30 rounded-lg">
                                    <p className="text-sm text-lnl-gold flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        {championships.get(match.championshipId || "")?.currentChampionId === match.winnerId
                                            ? "Defensa exitosa del título"
                                            : "🎉 ¡NUEVO CAMPEÓN! Se generará noticia automática."
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Save Button */}
            <div className="mt-8 sticky bottom-4">
                <button
                    onClick={handleSaveResults}
                    disabled={saving || !allResultsComplete}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-lg flex items-center justify-center gap-3 transition-all ${allResultsComplete
                        ? "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/30"
                        : "bg-zinc-800 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Check className="w-5 h-5" />
                    )}
                    {saving ? "Guardando..." : allResultsComplete ? "Guardar Resultados + Actualizar Rankings" : `Faltan ${matches.filter(m => !m.winnerId || !m.result).length} resultado(s)`}
                </button>
            </div>
        </div>
    );
}
