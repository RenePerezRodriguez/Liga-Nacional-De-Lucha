import { EventCard } from "@/components/event-card";
import { WrestlerCard } from "@/components/wrestler-card";
import { NewsCard } from "@/components/news-card";
import { ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { ChampionshipsSection } from "@/components/championships";
import { YouTubeFeed } from "@/components/youtube-feed";
import { Newsletter } from "@/components/newsletter";
import { SponsorsSection } from "@/components/sponsors";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 md:gap-20 pb-12 md:pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-20 pb-10">
        {/* Hero Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60"
          >
            <source src="/images/hero/hero-video.mp4" type="video/mp4" />
            <Image
              src="/images/hero/hero-bg.png"
              alt="LNL Arena"
              fill
              className="object-cover"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        </div>

        <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto flex-grow flex flex-col justify-center">
          <div className="mb-4 inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-lnl-gold/10 border border-lnl-gold/20 text-lnl-gold font-bold uppercase tracking-widest text-[10px] md:text-sm animate-fade-in-up mx-auto">
            <Trophy className="w-3 h-3 md:w-4 md:h-4" />
            <span>La Liga #1 de Bolivia</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none text-shadow-lg break-words">
            Pasión. <span className="text-lnl-red text-shadow-glow">Adrenalina.</span> <br />
            Lucha Libre.
          </h1>
          <p className="text-sm sm:text-lg md:text-2xl text-gray-300 mb-6 md:mb-10 max-w-2xl mx-auto px-2 drop-shadow-md">
            El mejor espectáculo de Cochabamba.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 w-full sm:w-auto">
            <Link
              href="/eventos"
              className="w-full sm:w-auto px-6 py-3 bg-lnl-red text-white font-bold uppercase tracking-wider rounded hover:bg-red-700 transition-colors shadow-lg text-xs sm:text-base flex items-center justify-center"
            >
              Próximos Eventos
            </Link>
            <Link
              href="/luchadores"
              className="w-full sm:w-auto px-6 py-3 bg-transparent border-2 border-white text-white font-bold uppercase tracking-wider rounded hover:bg-white hover:text-black transition-colors text-xs sm:text-base flex items-center justify-center"
            >
              Ver Roster
            </Link>
          </div>
        </div>

        {/* Countdown */}
        <div className="relative z-20 w-full mb-8 px-4 flex justify-center">
          <Countdown targetDate="2024-12-15T18:30:00" eventName="Guerra del Valle: Invasión" />
        </div>
      </section>

      {/* Championships Section */}
      <ChampionshipsSection />

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
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
          <EventCard
            title="Guerra del Valle: Invasión"
            date="15 Dic, 2024"
            time="18:30"
            location="Coliseo Pittsburg, Cochabamba"
            isFeatured={true}
            imageUrl="/images/events/guerra-del-valle.png"
          />
          <EventCard
            title="Noche de Campeones"
            date="22 Dic, 2024"
            time="19:00"
            location="Coliseo de la Coronilla"
            imageUrl="/images/events/noche-de-campeones.png"
          />
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link href="/eventos" className="inline-flex items-center gap-2 text-lnl-red font-bold uppercase text-sm">
            Ver todos los eventos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Roster Preview */}
      <section className="bg-lnl-gray py-10 md:py-20 border-y border-zinc-800">
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
            <WrestlerCard name="El Sombra" nickname="El Rey de las Tinieblas" imageUrl="/images/roster/el-sombra.png" />
            <WrestlerCard name="Furia Roja" nickname="La Máquina de Dolor" alignment="heel" imageUrl="/images/roster/furia-roja.png" />
            <WrestlerCard name="Águila Dorada" nickname="El Vuelo de la Victoria" imageUrl="/images/roster/aguila-dorada.png" />
            <WrestlerCard name="Titán" nickname="El Gigante de los Andes" imageUrl="/images/roster/titan.png" />
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h2 className="text-4xl font-black uppercase italic tracking-tight text-white mb-10">Últimas Noticias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <NewsCard
            title="Resultados: Caos en la Jaula - Diciembre 2024"
            excerpt="Una noche llena de sorpresas donde el campeonato máximo cambió de manos en una lucha sangrienta dentro de la jaula de acero."
            date="02 Dic, 2024"
            category="Resultados"
            slug="resultados-caos-jaula"
            imageUrl="/images/news/steel-cage.png"
          />
          <NewsCard
            title="Gran Apertura de la Academia LNL 2025"
            excerpt="La Liga Nacional de Lucha abre sus puertas para la nueva generación de talentos. ¡Inscríbete hoy y conviértete en una leyenda!"
            date="28 Nov, 2024"
            category="Anuncio"
            slug="apertura-academia-2025"
            imageUrl="/images/news/wrestling-school.png"
          />
        </div>
      </section>

      {/* YouTube Feed */}
      <YouTubeFeed />

      {/* Newsletter */}
      <Newsletter />

      {/* Sponsors */}
      <SponsorsSection />

    </div>
  );
}
