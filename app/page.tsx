import { EventCard } from "@/components/event-card";
import { WrestlerCard } from "@/components/wrestler-card";
import { NewsCard } from "@/components/news-card";
import { ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { ChampionshipsSection } from "@/components/championships";
import { YouTubeFeed } from "@/components/youtube-feed";
import { Newsletter } from "@/components/newsletter";
import Image from "next/image";
import { collection, getDocs, query, where, orderBy, limit, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Event extends DocumentData {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  description?: string;
  image?: string;
  isFeatured?: boolean;
  whatsappLink?: string;
}

interface NewsItem extends DocumentData {
  id: string;
  title: string;
  date: string;
  category?: string;
  description?: string;
  image?: string;
}

interface Wrestler extends DocumentData {
  id: string;
  name: string;
  nickname?: string;
  slug?: string;
  image?: string;
  alignment?: string;
  isFeatured?: boolean;
}

// Helper helper to fetch data
async function getHomeData() {
  const now = new Date().toISOString().split('T')[0]; // simple date comparison YYYY-MM-DD

  // 1. Fetch Featured Event
  const featuredQuery = query(
    collection(db, "eventos"),
    where("isFeatured", "==", true),
    limit(1)
  );
  const featuredSnap = await getDocs(featuredQuery);
  const featuredEvent = featuredSnap.empty ? null : { id: featuredSnap.docs[0].id, ...featuredSnap.docs[0].data() } as Event;

  // 2. Fetch Upcoming Events (excluding featured if we want, but simpler to just fetch next few)
  // Note: Filtering by date string works if format is YYYY-MM-DD
  const eventsQuery = query(
    collection(db, "eventos"),
    orderBy("date", "asc"),
    where("date", ">=", now),
    limit(3)
  );
  const eventsSnap = await getDocs(eventsQuery);
  const upcomingEvents = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];

  // 3. Fetch Latest News
  const newsQuery = query(
    collection(db, "noticias"),
    orderBy("date", "desc"),
    limit(2)
  );
  const newsSnap = await getDocs(newsQuery);
  const latestNews = newsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NewsItem[];

  // 4. Fetch Featured Wrestlers (limit 4)
  const wrestlersQuery = query(
    collection(db, "luchadores"),
    where("isFeatured", "==", true),
    limit(4)
  );
  const wrestlersSnap = await getDocs(wrestlersQuery);
  let featuredWrestlers = wrestlersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Wrestler[];

  // If less than 4 featured, just get the first 4 wrestlers
  if (featuredWrestlers.length < 4) {
    const allWrestlersQuery = query(
      collection(db, "luchadores"),
      limit(4)
    );
    const allWrestlersSnap = await getDocs(allWrestlersQuery);
    featuredWrestlers = allWrestlersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Wrestler[];
  }

  return { featuredEvent, upcomingEvents, latestNews, featuredWrestlers };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const { featuredEvent, upcomingEvents, latestNews, featuredWrestlers } = await getHomeData();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col pt-16 md:pt-20 pb-44 md:pb-32 overflow-hidden">
        {/* Hero Background Video */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero/hero-bg.png"
            alt="LNL Arena"
            fill
            className="object-cover -z-10"
            priority
          />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          >
            <source src="/images/hero/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex-grow flex flex-col justify-center px-4 sm:px-6 lg:px-8">

          {/* Main Title Area (Centered) */}
          <div className="flex flex-col justify-center items-center text-center">
            <div className="mb-4 md:mb-6 inline-flex items-center justify-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-lnl-gold/10 border border-lnl-gold/20 text-lnl-gold font-bold uppercase tracking-widest text-[10px] md:text-sm animate-fade-in-up backdrop-blur-md">
              <Trophy className="w-3 h-3 md:w-4 md:h-4" />
              <span>La Liga #1 de Bolivia</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase italic tracking-tighter mb-4 md:mb-6 leading-[0.95] text-shadow-lg max-w-4xl">
              {featuredEvent ? (
                <>
                  <span className="line-clamp-2">{featuredEvent.title.split(":")[0]}</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-lnl-red to-red-900 filter drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)] block">
                    {featuredEvent.title.split(":")[1]?.trim() || "EN VIVO"}
                  </span>
                </>
              ) : (
                <>
                  LIGA NACIONAL <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-lnl-red to-red-900 filter drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)]">DE LUCHA</span>
                </>
              )}
            </h1>
          </div>
        </div>

        {/* Bottom Banner - FULL WIDTH at absolute bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 w-full bg-zinc-900/95 backdrop-blur-xl border-t-4 border-lnl-red p-3 md:p-6 shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-12">

            {/* Event Info */}
            <div className="text-center md:text-left">
              {featuredEvent ? (
                <>
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">{featuredEvent.date}</h3>
                  <p className="text-gray-400 text-xs md:text-base font-medium uppercase tracking-widest">{featuredEvent.location} • {featuredEvent.time}</p>
                </>
              ) : (
                <>
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">Próximamente</h3>
                  <p className="text-gray-400 text-xs md:text-base font-medium uppercase tracking-widest">Estén atentos a nuestras redes</p>
                </>
              )}
            </div>

            {/* Countdown - Hidden on very small screens */}
            {featuredEvent && (
              <div className="hidden sm:flex flex-grow justify-center scale-75 md:scale-100 origin-center">
                <Countdown targetDate={`${featuredEvent.date}T${featuredEvent.time}:00`} eventName={featuredEvent.title} />
              </div>
            )}

            {/* CTA Button */}
            {featuredEvent?.whatsappLink ? (
              <a
                href={featuredEvent.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap px-6 md:px-8 py-3 md:py-4 bg-lnl-red text-white font-black uppercase tracking-widest rounded text-sm md:text-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:bg-red-600 transition-all flex items-center gap-2"
              >
                Comprar Entrada <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            ) : (
              <Link
                href="/reservas"
                className="whitespace-nowrap px-6 md:px-8 py-3 md:py-4 bg-lnl-red text-white font-black uppercase tracking-widest rounded text-sm md:text-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:bg-red-600 transition-all flex items-center gap-2"
              >
                Comprar Entrada <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Championships Section */}
      <ChampionshipsSection />

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12 md:mt-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-lnl-red font-bold uppercase tracking-widest text-sm block mb-2">Calendario</span>
            <h2 className="text-4xl font-black uppercase italic tracking-tight text-white">Próximos Eventos</h2>
          </div>
          <Link href="/eventos" className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold uppercase text-sm">
            Ver todo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                date={event.date}
                time={event.time}
                location={event.location}
                isFeatured={event.isFeatured}
                imageUrl={event.image || "/images/event-placeholder.jpg"}
              />
            ))
          ) : (
            <p className="text-gray-500">No hay eventos próximos programados.</p>
          )}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link href="/eventos" className="inline-flex items-center gap-2 text-lnl-red font-bold uppercase text-sm">
            Ver todos los eventos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Roster Preview - Static for now, task is just Home/Events/News first */}
      <section className="bg-lnl-gray py-10 md:py-20 border-y border-zinc-800 mt-12 md:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-lnl-gold font-bold uppercase tracking-widest text-sm block mb-2">Estrellas</span>
              <h2 className="text-4xl font-black uppercase italic tracking-tight text-white">Luchadores Destacados</h2>
            </div>
            <Link href="/luchadores" className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold uppercase text-sm">
              Ver Roster Completo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {featuredWrestlers.length > 0 ? (
              featuredWrestlers.map(wrestler => (
                <WrestlerCard
                  key={wrestler.id}
                  name={wrestler.name}
                  nickname={wrestler.nickname || ""}
                  alignment={wrestler.alignment as "face" | "heel" | undefined}
                  imageUrl={wrestler.image || "/images/roster-placeholder.jpg"}
                />
              ))
            ) : (
              <p className="text-gray-500 col-span-4">No hay luchadores destacados.</p>
            )}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12 md:mt-20">
        <h2 className="text-4xl font-black uppercase italic tracking-tight text-white mb-10">Últimas Noticias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {latestNews.length > 0 ? (
            latestNews.map(news => (
              <NewsCard
                key={news.id}
                title={news.title}
                excerpt={news.description || news.title}
                date={news.date}
                category={news.category}
                slug={news.id} // using id as slug for now
                imageUrl={news.image || "/images/news-placeholder.jpg"}
              />
            ))
          ) : (
            <p className="text-gray-500">No hay noticias recientes.</p>
          )}
        </div>
      </section>

      {/* YouTube Feed */}
      <div id="multimedia" className="scroll-mt-24 mt-12 md:mt-20">
        <YouTubeFeed />
      </div>

      {/* Newsletter */}
      <Newsletter />

    </div>
  );
}
