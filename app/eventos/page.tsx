import { EventCard } from "@/components/event-card";
import { TaleOfTheTape } from "@/components/tale-of-the-tape";
import { Calendar, Swords } from "lucide-react";
import { collection, getDocs, query, orderBy, where, limit, DocumentData, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Match {
    id: string;
    matchType: string;
    wrestler1Id: string;
    wrestler2Id: string;
    isMainEvent?: boolean;
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

interface Event extends DocumentData {
    id: string;
    title: string;
    date: string;
    time: string;
    location?: string;
    venueName?: string;
    description?: string;
    image?: string;
    isFeatured?: boolean;
    isoDate?: string;
    matches?: Match[];
}

async function getEvents() {
    const now = new Date().toISOString().split('T')[0];

    // Fetch upcoming events
    const eventsQuery = query(
        collection(db, "eventos"),
        orderBy("date", "asc"),
        where("date", ">=", now)
    );
    const eventsSnap = await getDocs(eventsQuery);
    const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];

    // Get featured event for Tale of the Tape (if exists)
    const featuredQuery = query(
        collection(db, "eventos"),
        where("isFeatured", "==", true),
        limit(1)
    );
    const featuredSnap = await getDocs(featuredQuery);
    const featuredEvent = featuredSnap.empty ? null : { id: featuredSnap.docs[0].id, ...featuredSnap.docs[0].data() } as Event;

    // If featured event has matches, get the main event wrestlers
    const mainEventWrestlers: { wrestler1: Wrestler | null, wrestler2: Wrestler | null } = { wrestler1: null, wrestler2: null };

    if (featuredEvent?.matches && featuredEvent.matches.length > 0) {
        const mainEvent = featuredEvent.matches.find(m => m.isMainEvent) || featuredEvent.matches[0];

        if (mainEvent.wrestler1Id) {
            const w1Doc = await getDoc(doc(db, "luchadores", mainEvent.wrestler1Id));
            if (w1Doc.exists()) {
                mainEventWrestlers.wrestler1 = { id: w1Doc.id, ...w1Doc.data() } as Wrestler;
            }
        }

        if (mainEvent.wrestler2Id) {
            const w2Doc = await getDoc(doc(db, "luchadores", mainEvent.wrestler2Id));
            if (w2Doc.exists()) {
                mainEventWrestlers.wrestler2 = { id: w2Doc.id, ...w2Doc.data() } as Wrestler;
            }
        }
    }

    return { events, featuredEvent, mainEventWrestlers };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EventsPage() {
    const { events, featuredEvent, mainEventWrestlers } = await getEvents();

    const showTaleOfTape = featuredEvent && mainEventWrestlers.wrestler1 && mainEventWrestlers.wrestler2;

    return (
        <div className="pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8 md:mb-12">
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4 flex items-center gap-2 md:gap-4">
                        <Calendar className="w-8 h-8 md:w-12 md:h-12 text-lnl-red" />
                        Calendario
                    </h1>
                    <p className="text-gray-400 max-w-xl text-sm md:text-base">
                        No te pierdas ningún evento. Consulta las próximas fechas y asegura tu lugar en la historia.
                    </p>
                </div>
            </div>

            {/* Featured Match Preview (Tale of the Tape) */}
            {showTaleOfTape && (
                <section className="mb-20">
                    <div className="max-w-7xl mx-auto px-4 mb-4 flex items-center gap-2">
                        <Swords className="text-lnl-gold w-6 h-6" />
                        <h2 className="text-2xl font-black uppercase italic text-white">Evento Estelar: {featuredEvent.title}</h2>
                    </div>
                    <TaleOfTheTape
                        fighter1={{
                            name: mainEventWrestlers.wrestler1!.name,
                            nickname: mainEventWrestlers.wrestler1!.nickname || "",
                            height: mainEventWrestlers.wrestler1!.stats?.height || "N/A",
                            weight: mainEventWrestlers.wrestler1!.stats?.weight || "N/A",
                            finisher: mainEventWrestlers.wrestler1!.stats?.finisher || "N/A",
                            image: mainEventWrestlers.wrestler1!.image || "",
                            alignment: (mainEventWrestlers.wrestler1!.alignment as "face" | "heel") || "face"
                        }}
                        fighter2={{
                            name: mainEventWrestlers.wrestler2!.name,
                            nickname: mainEventWrestlers.wrestler2!.nickname || "",
                            height: mainEventWrestlers.wrestler2!.stats?.height || "N/A",
                            weight: mainEventWrestlers.wrestler2!.stats?.weight || "N/A",
                            finisher: mainEventWrestlers.wrestler2!.stats?.finisher || "N/A",
                            image: mainEventWrestlers.wrestler2!.image || "",
                            alignment: (mainEventWrestlers.wrestler2!.alignment as "face" | "heel") || "face"
                        }}
                    />
                </section>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => (
                            <EventCard
                                key={event.id}
                                id={event.id}
                                title={event.title}
                                date={event.date}
                                time={event.time}
                                location={event.venueName || event.location}
                                isFeatured={event.isFeatured}
                                imageUrl={event.image || "/images/event-placeholder.jpg"}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Calendar className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No hay eventos próximos programados.</p>
                        <p className="text-gray-600 text-sm mt-2">Vuelve pronto para ver nuevas fechas.</p>
                    </div>
                )}
            </div>

            {events.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(events.map(event => ({
                            "@context": "https://schema.org",
                            "@type": "Event",
                            "name": event.title,
                            "startDate": event.isoDate || event.date,
                            "location": event.venueName || event.location ? {
                                "@type": "Place",
                                "name": event.venueName || event.location?.split(',')[0],
                                "address": {
                                    "@type": "PostalAddress",
                                    "addressLocality": event.location?.split(',')[1]?.trim() || "Bolivia"
                                }
                            } : undefined,
                            "image": event.image ? event.image : undefined,
                            "description": event.description,
                            "organizer": {
                                "@type": "Organization",
                                "name": "Liga Nacional de Lucha",
                                "url": "https://luchalibrebolivia.com"
                            }
                        })))
                    }}
                />
            )}
        </div>
    );
}
