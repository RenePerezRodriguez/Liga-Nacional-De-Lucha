import { ArrowLeft, Trophy, MapPin, Ruler, Weight, Zap, Music, Video, Instagram, Twitter, TrendingUp, TrendingDown, Swords, Calendar, BarChart3, Target, Award, Facebook, Youtube, Twitch, Globe, Link as LinkIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs, query, where, orderBy, limit, DocumentData, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatRecord, formatStreak, calculateWinPercentage, type WrestlerStats, DEFAULT_WRESTLER_STATS } from "@/lib/wrestling-stats";
import { getRankingTier, DEFAULT_ELO_RATING } from "@/lib/elo-ranking";

interface Wrestler extends DocumentData {
    id: string;
    name: string;
    nickname?: string;
    slug?: string;
    image?: string;
    bio?: string;
    alignment?: string;
    rankingPoints?: number;
    wrestlerStats?: WrestlerStats;
    stats?: {
        height?: string;
        weight?: string;
        hometown?: string;
        finisher?: string;
        signatures?: string[];
    };
    socials?: {
        instagram?: string;
        twitter?: string;
        tiktok?: string;
        others?: { platform: string; url: string }[];
    };
    entranceTheme?: string;
    videoHighlight?: string;
    championships?: string[];
}

interface MatchRecord {
    id: string;
    eventId: string;
    eventName: string;
    eventDate: string;
    wrestler1Id: string;
    wrestler1Name: string;
    wrestler2Id: string;
    wrestler2Name: string;
    winnerId: string;
    winnerName: string;
    loserId: string;
    loserName: string;
    result: string;
    isForTitle: boolean;
    championshipName?: string;
    isMainEvent: boolean;
}

const getSocialIcon = (platform: string) => {
    switch (platform) {
        case "facebook": return Facebook;
        case "youtube": return Youtube;
        case "twitch": return Twitch;
        case "twitter": return Twitter;
        case "website": return Globe;
        default: return LinkIcon;
    }
};

const getSocialColor = (platform: string) => {
    switch (platform) {
        case "facebook": return "bg-blue-600";
        case "youtube": return "bg-red-600";
        case "twitch": return "bg-purple-600";
        case "twitter": return "bg-sky-500";
        default: return "bg-zinc-700";
    }
};

async function getWrestlerBySlug(slug: string): Promise<Wrestler | null> {
    const wrestlersQuery = query(
        collection(db, "luchadores"),
        where("slug", "==", slug)
    );
    const snap = await getDocs(wrestlersQuery);

    if (snap.empty) return null;

    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as Wrestler;
}

async function getMatchHistory(wrestlerId: string): Promise<MatchRecord[]> {
    try {
        const q1 = query(
            collection(db, "match_history"),
            where("wrestler1Id", "==", wrestlerId),
            orderBy("eventDate", "desc"),
            limit(10)
        );
        const q2 = query(
            collection(db, "match_history"),
            where("wrestler2Id", "==", wrestlerId),
            orderBy("eventDate", "desc"),
            limit(10)
        );

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

        const matches: MatchRecord[] = [];
        snap1.forEach(doc => matches.push({ id: doc.id, ...doc.data() } as MatchRecord));
        snap2.forEach(doc => matches.push({ id: doc.id, ...doc.data() } as MatchRecord));

        return matches
            .filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i)
            .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
            .slice(0, 10);
    } catch {
        return [];
    }
}

async function getChampionshipNames(championshipIds: string[]): Promise<string[]> {
    if (!championshipIds || championshipIds.length === 0) return [];

    const names: string[] = [];
    for (const id of championshipIds) {
        try {
            const champDoc = await getDoc(doc(db, "campeonatos", id));
            if (champDoc.exists()) {
                names.push(champDoc.data().title);
            } else {
                // If it's not an ID, it might already be a name (legacy data)
                names.push(id);
            }
        } catch {
            names.push(id); // Fallback to ID if error
        }
    }
    return names;
}

function getYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const wrestler = await getWrestlerBySlug(slug);

    if (!wrestler) {
        return { title: "Luchador no encontrado | LNL Bolivia" };
    }

    return {
        title: `${wrestler.name}${wrestler.nickname ? ` ("${wrestler.nickname}")` : ""} | Roster LNL`,
        description: wrestler.bio?.substring(0, 160) || `Perfil de ${wrestler.name} en la Liga Nacional de Lucha Bolivia`,
        openGraph: {
            title: `${wrestler.name}${wrestler.nickname ? ` - ${wrestler.nickname}` : ""}`,
            description: wrestler.bio,
            images: wrestler.image ? [wrestler.image] : [],
            type: "profile",
        }
    };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WrestlerProfile({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const wrestler = await getWrestlerBySlug(slug);

    if (!wrestler) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-black uppercase italic mb-4">Luchador no encontrado</h1>
                    <Link href="/luchadores" className="text-lnl-red hover:underline">
                        ← Volver al Roster
                    </Link>
                </div>
            </div>
        );
    }

    const matchHistory = await getMatchHistory(wrestler.id);
    const physicalStats = wrestler.stats || {};
    const socials = wrestler.socials || {};
    const wrestlerStats = wrestler.wrestlerStats || DEFAULT_WRESTLER_STATS;
    const rankingTier = getRankingTier(wrestler.rankingPoints || DEFAULT_ELO_RATING);
    const winPercentage = calculateWinPercentage(wrestlerStats.wins, wrestlerStats.losses, wrestlerStats.draws);
    const streak = formatStreak(wrestlerStats.currentStreak);
    const championshipNames = await getChampionshipNames(wrestler.championships || []);

    return (
        <div className="min-h-screen bg-zinc-950 pb-20">
            {/* Hero/Header */}
            <div className="relative h-[60vh] overflow-hidden">
                {wrestler.image && (
                    <Image
                        src={wrestler.image}
                        alt={wrestler.name}
                        fill
                        sizes="100vw"
                        className="object-cover opacity-40 blur-sm"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Athlete",
                            "name": wrestler.name,
                            "alternateName": wrestler.nickname,
                            "description": wrestler.bio,
                            "image": wrestler.image,
                            "url": `https://luchalibrebolivia.com/luchadores/${slug}`,
                            "sport": "Pro Wrestling"
                        })
                    }}
                />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 text-center md:text-left">
                    <div className="relative w-40 h-52 md:w-64 md:h-80 rounded-lg overflow-hidden border-4 border-lnl-gold shadow-2xl flex-shrink-0 bg-black mx-auto md:mx-0">
                        {wrestler.image ? (
                            <Image
                                src={wrestler.image}
                                alt={wrestler.name}
                                fill
                                sizes="(max-width: 768px) 160px, 256px"
                                className="object-cover object-top"
                            />
                        ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                <span className="text-6xl text-zinc-600">{wrestler.name.charAt(0)}</span>
                            </div>
                        )}
                    </div>
                    <div className="mb-4">
                        {wrestler.nickname && (
                            <span className="text-lnl-gold font-bold uppercase tracking-widest text-sm md:text-xl block mb-2">{wrestler.nickname}</span>
                        )}
                        <h1 className="text-4xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">{wrestler.name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <span className={`px-4 py-1 rounded-full font-bold uppercase text-sm ${wrestler.alignment === 'face' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
                                {wrestler.alignment === 'face' ? 'Técnico' : 'Rudo'}
                            </span>

                            {/* W-L Record Badge */}
                            <span className="px-4 py-1 rounded-full font-bold uppercase text-sm bg-zinc-800 text-white">
                                {formatRecord(wrestlerStats.wins, wrestlerStats.losses, wrestlerStats.draws)}
                            </span>

                            {/* Ranking Tier */}
                            <span className={`px-4 py-1 rounded-full font-bold uppercase text-sm ${rankingTier.bgColor} ${rankingTier.color}`}>
                                {wrestler.rankingPoints || DEFAULT_ELO_RATING} pts • {rankingTier.name}
                            </span>

                            {/* Instagram */}
                            {socials.instagram && (
                                <a href={`https://instagram.com/${socials.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-2 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full hover:scale-110 transition-transform" aria-label="Instagram">
                                    <Instagram className="w-4 h-4 text-white" />
                                </a>
                            )}

                            {/* TikTok (Main Replacement) */}
                            {socials.tiktok && (
                                <a href={`https://tiktok.com/@${socials.tiktok.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-2 bg-black border border-zinc-700 rounded-full hover:scale-110 transition-transform hover:border-cyan-400 group" aria-label="TikTok">
                                    {/* Using Music icon as TikTok proxy or just Video. Let's use Music for 'Make Your Day' vibe */}
                                    <Music className="w-4 h-4 text-white group-hover:text-cyan-400" />
                                </a>
                            )}

                            {/* Twitter (Legacy) */}
                            {socials.twitter && (
                                <a href={`https://twitter.com/${socials.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-2 bg-sky-500 rounded-full hover:scale-110 transition-transform" aria-label="Twitter">
                                    <Twitter className="w-4 h-4 text-white" />
                                </a>
                            )}

                            {/* Other Socials */}
                            {socials.others && socials.others.map((social, idx) => {
                                const Icon = getSocialIcon(social.platform);
                                const colorClass = getSocialColor(social.platform);
                                return (
                                    <a key={idx} href={social.url} target="_blank" rel="noreferrer" className={`p-2 ${colorClass} rounded-full hover:scale-110 transition-transform`} aria-label={social.platform}>
                                        <Icon className="w-4 h-4 text-white" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Back Link */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Link href="/luchadores" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Volver al Roster
                </Link>
            </div>

            {/* Stats Overview Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                        <p className="text-3xl font-black text-white">{wrestlerStats.wins}</p>
                        <p className="text-xs text-green-500 font-bold uppercase">Victorias</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                        <p className="text-3xl font-black text-white">{wrestlerStats.losses}</p>
                        <p className="text-xs text-red-500 font-bold uppercase">Derrotas</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                        <p className="text-3xl font-black text-white">{winPercentage}%</p>
                        <p className="text-xs text-gray-400 font-bold uppercase">% Victoria</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                        <p className={`text-3xl font-black ${streak.color}`}>{streak.text}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase">Racha</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Match History */}
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase italic mb-6 flex items-center gap-3">
                                <Calendar className="w-8 h-8 text-lnl-red" /> Historial de Combates
                            </h2>
                            {matchHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {matchHistory.map((match) => {
                                        const isWinner = match.winnerId === wrestler.id;
                                        const opponent = match.wrestler1Id === wrestler.id ? match.wrestler2Name : match.wrestler1Name;

                                        return (
                                            <div key={match.id} className={`bg-zinc-900 border rounded-lg p-4 flex items-center gap-4 ${isWinner ? "border-green-600/30" : "border-red-600/30"}`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isWinner ? "bg-green-500/20" : "bg-red-500/20"}`}>
                                                    {isWinner ? (
                                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <TrendingDown className="w-5 h-5 text-red-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`font-bold ${isWinner ? "text-green-500" : "text-red-500"}`}>
                                                            {isWinner ? "VICTORIA" : "DERROTA"}
                                                        </span>
                                                        <span className="text-gray-500">vs</span>
                                                        <span className="font-bold text-white truncate">{opponent}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{match.eventName}</span>
                                                        <span>•</span>
                                                        <span>{match.eventDate}</span>
                                                        <span>•</span>
                                                        <span className="text-gray-400">{match.result}</span>
                                                    </div>
                                                </div>
                                                {match.isForTitle && (
                                                    <Trophy className="w-5 h-5 text-lnl-gold flex-shrink-0" />
                                                )}
                                                {match.isMainEvent && (
                                                    <span className="text-xs bg-lnl-gold/20 text-lnl-gold px-2 py-0.5 rounded font-bold">⭐</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-gray-500">
                                    <Swords className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p>Sin historial de combates registrados</p>
                                </div>
                            )}
                        </div>

                        {/* Biography */}
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase italic mb-6">Biografía</h2>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                {wrestler.bio || "Biografía no disponible."}
                            </p>
                        </div>

                        {/* Finisher & Signature Moves */}
                        {(physicalStats.finisher || (physicalStats.signatures && physicalStats.signatures.length > 0)) && (
                            <div className="bg-gradient-to-br from-red-900/30 to-transparent border border-red-500/30 rounded-xl p-6">
                                <h3 className="text-xl font-black text-white uppercase italic mb-4 flex items-center gap-2">
                                    <Zap className="text-lnl-red" /> Movimientos
                                </h3>

                                {physicalStats.finisher && (
                                    <div className="mb-4">
                                        <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Finisher</span>
                                        <p className="text-2xl font-black text-lnl-red italic">{physicalStats.finisher}</p>
                                    </div>
                                )}

                                {physicalStats.signatures && physicalStats.signatures.length > 0 && (
                                    <div>
                                        <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Movimientos Firma</span>
                                        <ul className="mt-2 space-y-1">
                                            {physicalStats.signatures.map((move: string, idx: number) => (
                                                <li key={idx} className="text-gray-300 flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-lnl-gold rounded-full"></span>
                                                    {move}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Video Highlight */}
                        {wrestler.videoHighlight && getYouTubeId(wrestler.videoHighlight) && (
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic mb-4 flex items-center gap-2">
                                    <Video className="text-red-500" /> Video Destacado
                                </h3>
                                <div className="aspect-video rounded-xl overflow-hidden border border-zinc-800">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${getYouTubeId(wrestler.videoHighlight)}`}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                        {/* Advanced Stats */}
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase italic mb-6 flex items-center gap-3">
                                <BarChart3 className="w-8 h-8 text-purple-500" /> Estadísticas
                            </h2>
                            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4">
                                {/* Win Types */}
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Tipo de Victorias</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Pinfall</span>
                                            <span className="text-white font-bold">{wrestlerStats.winsByPinfall}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Submission</span>
                                            <span className="text-white font-bold">{wrestlerStats.winsBySubmission}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">KO</span>
                                            <span className="text-white font-bold">{wrestlerStats.winsByKO}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">DQ</span>
                                            <span className="text-white font-bold">{wrestlerStats.winsByDQ}</span>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-zinc-800" />

                                {/* Special Stats */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-lnl-gold" /> Títulos Ganados
                                        </span>
                                        <span className="text-white font-bold">{wrestlerStats.titlesWon}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 flex items-center gap-2">
                                            <Trophy className="w-4 h-4 text-lnl-gold" /> Defensas
                                        </span>
                                        <span className="text-white font-bold">{wrestlerStats.titleDefenses}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 flex items-center gap-2">
                                            <Target className="w-4 h-4 text-lnl-red" /> Main Events Ganados
                                        </span>
                                        <span className="text-white font-bold">{wrestlerStats.mainEventWins}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-green-500" /> Mejor Racha
                                        </span>
                                        <span className="text-green-500 font-bold">{wrestlerStats.bestStreak}W</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Physical Stats Card */}
                        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4">
                            <h3 className="text-lg font-black text-white uppercase">Datos Físicos</h3>
                            {physicalStats.height && (
                                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                                    <span className="text-gray-400 font-bold uppercase text-sm flex items-center gap-2">
                                        <Ruler className="w-4 h-4" /> Altura
                                    </span>
                                    <span className="text-white font-bold">{physicalStats.height}</span>
                                </div>
                            )}
                            {physicalStats.weight && (
                                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                                    <span className="text-gray-400 font-bold uppercase text-sm flex items-center gap-2">
                                        <Weight className="w-4 h-4" /> Peso
                                    </span>
                                    <span className="text-white font-bold">{physicalStats.weight}</span>
                                </div>
                            )}
                            {physicalStats.hometown && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 font-bold uppercase text-sm flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Origen
                                    </span>
                                    <span className="text-white font-bold">{physicalStats.hometown}</span>
                                </div>
                            )}

                            {!physicalStats.height && !physicalStats.weight && !physicalStats.hometown && (
                                <p className="text-gray-500 text-sm text-center py-4">Sin datos físicos registrados</p>
                            )}
                        </div>

                        {/* Entrance Theme */}
                        {wrestler.entranceTheme && getYouTubeId(wrestler.entranceTheme) && (
                            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                                <h3 className="text-white font-bold uppercase text-sm mb-3 flex items-center gap-2">
                                    <Music className="w-4 h-4 text-lnl-gold" /> Tema de Entrada
                                </h3>
                                <div className="aspect-video rounded-lg overflow-hidden border border-zinc-700">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${getYouTubeId(wrestler.entranceTheme)}`}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        )}

                        {/* Championships */}
                        {championshipNames.length > 0 && (
                            <div className="bg-gradient-to-br from-lnl-gold/10 to-transparent rounded-xl p-6 border border-lnl-gold/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <Trophy className="w-6 h-6 text-lnl-gold" />
                                    <h3 className="text-white font-bold uppercase">Títulos Ganados</h3>
                                </div>
                                <ul className="space-y-2">
                                    {championshipNames.map((title: string, idx: number) => (
                                        <li key={idx} className="text-gray-300 text-sm">🏆 {title}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
