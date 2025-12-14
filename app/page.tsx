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

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col pt-16 md:pt-20 pb-44 md:pb-32 overflow-hidden">
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

            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase italic tracking-tighter mb-4 md:mb-6 leading-[0.9] text-shadow-lg break-words max-w-5xl">
              Guerra del <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-lnl-red to-red-900 filter drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)]">Valle</span>
            </h1>

            <p className="text-base sm:text-xl md:text-2xl lg:text-3xl text-gray-200 font-medium mb-6 md:mb-8 max-w-2xl drop-shadow-md tracking-tight px-4">
              El evento más explosivo del año llega a Bolivia.
            </p>
          </div>
        </div>

        {/* Bottom Banner - FULL WIDTH at absolute bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 w-full bg-zinc-900/95 backdrop-blur-xl border-t-4 border-lnl-red p-3 md:p-6 shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-12">

            {/* Event Info */}
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">15 de Diciembre</h3>
              <p className="text-gray-400 text-xs md:text-base font-medium uppercase tracking-widest">Coliseo Pittsburg • 18:30</p>
            </div>

            {/* Countdown - Hidden on very small screens */}
            <div className="hidden sm:flex flex-grow justify-center scale-75 md:scale-100 origin-center">
              <Countdown targetDate="2024-12-15T18:30:00" eventName="" />
            </div>

            {/* CTA Button */}
            <a
              href="https://wa.me/59170000000?text=Hola,%20quiero%20comprar%20entradas%20para%20Guerra%20del%20Valle"
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap px-6 md:px-8 py-3 md:py-4 bg-lnl-red text-white font-black uppercase tracking-widest rounded text-sm md:text-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:bg-red-600 transition-all flex items-center gap-2"
            >
              Comprar Entrada <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </a>
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
            <WrestlerCard name="Alberto Del Rio" nickname="El Patrón" alignment="heel" imageUrl="/images/roster/sin-fondo/ALBERTO DEL RIO.png" />
            <WrestlerCard name="Ajayu" nickname="El Espíritu Andino" imageUrl="/images/roster/sin-fondo/AJAYU.png" />
            <WrestlerCard name="Hijo de Dos Caras" nickname="Legado de Leyenda" imageUrl="/images/roster/sin-fondo/HIJO DE DOS CARAS.png" />
            <WrestlerCard name="Sarah" nickname="La Diva del Ring" imageUrl="/images/roster/sin-fondo/SARAH.png" />
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12 md:mt-20">
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
      <div id="multimedia" className="scroll-mt-24 mt-12 md:mt-20">
        <YouTubeFeed />
      </div>

      {/* Newsletter */}
      <Newsletter />

    </div>
  );
}
