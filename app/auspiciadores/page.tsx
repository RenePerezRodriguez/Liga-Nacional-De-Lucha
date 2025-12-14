"use client";

import { Handshake, Star, TrendingUp, Users } from "lucide-react";
import Image from "next/image";

export default function SponsorsPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20">
            {/* Hero */}
            <section className="relative h-[50vh] flex items-center justify-center overflow-hidden mb-20">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/hero/sponsors-bg.png"
                        alt="Business"
                        fill
                        className="object-cover opacity-30 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                <div className="relative z-10 text-center max-w-4xl px-4 animate-fade-in-up">
                    <span className="text-lnl-gold font-bold uppercase tracking-[0.3em] text-sm md:text-base mb-4 block">
                        Alianzas Estratégicas
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6 leading-none">
                        Nuestros <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Aliados</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Las marcas que hacen posible el espectáculo de lucha libre más grande de Bolivia.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Featured Video Section (Activaciones) */}
                <div className="mb-24">
                    <div className="flex items-end justify-between mb-8 border-b border-zinc-800 pb-4">
                        <h2 className="text-3xl font-black uppercase italic tracking-tight flex items-center gap-3">
                            <TrendingUp className="text-lnl-red w-8 h-8" /> Activaciones de Marca
                        </h2>
                    </div>

                    <div className="aspect-video w-full bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl relative group border border-zinc-800">
                        {/* Placeholder for Video Embed */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-gray-500 uppercase tracking-widest font-bold">Video de Activaciones Aquí</p>
                        </div>
                        {/* Once you have a real video ID, use an iframe here */}
                        {/* <iframe src="https://www.youtube.com/embed/VIDEO_ID" ... /> */}
                    </div>
                    <p className="mt-4 text-gray-400 text-sm md:text-base max-w-3xl">
                        Nuestros eventos no son solo combates, son experiencias inmersivas donde su marca interactúa directamente con miles de fanáticos apasionados.
                    </p>
                </div>

                {/* Sponsor Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">

                    {/* Sponsor Card 1 */}
                    <div className="bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 flex flex-col items-center text-center hover:border-lnl-gold/50 transition-colors group">
                        <div className="w-32 h-32 relative mb-6 grayscale group-hover:grayscale-0 transition-all duration-300">
                            {/* Replace with actual logos */}
                            <div className="w-full h-full bg-white/10 rounded-full flex items-center justify-center">
                                <span className="font-black text-2xl text-gray-500">LOGO</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tight mb-2">PowerDrink</h3>
                        <span className="text-xs font-bold uppercase tracking-widest text-lnl-gold mb-4">Hidratador Oficial</span>
                        <p className="text-sm text-gray-500">
                            Manteniendo a nuestros atletas al máximo rendimiento en cada combate.
                        </p>
                    </div>

                    {/* Sponsor Card 2 */}
                    <div className="bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 flex flex-col items-center text-center hover:border-lnl-gold/50 transition-colors group">
                        <div className="w-32 h-32 relative mb-6 grayscale group-hover:grayscale-0 transition-all duration-300">
                            <div className="w-full h-full bg-white/10 rounded-full flex items-center justify-center">
                                <span className="font-black text-2xl text-gray-500">LOGO</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tight mb-2">GymForce</h3>
                        <span className="text-xs font-bold uppercase tracking-widest text-lnl-gold mb-4">Gimnasio Oficial</span>
                        <p className="text-sm text-gray-500">
                            Donde se forjan los campeones de la LNL. Entrenamiento de alto nivel.
                        </p>
                    </div>

                    {/* Sponsor Card 3 */}
                    <div className="bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 flex flex-col items-center text-center hover:border-lnl-gold/50 transition-colors group">
                        <div className="w-32 h-32 relative mb-6 grayscale group-hover:grayscale-0 transition-all duration-300">
                            <div className="w-full h-full bg-white/10 rounded-full flex items-center justify-center">
                                <span className="font-black text-2xl text-gray-500">LOGO</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tight mb-2">BurgerKing</h3>
                        <span className="text-xs font-bold uppercase tracking-widest text-lnl-gold mb-4">Partner</span>
                        <p className="text-sm text-gray-500">
                            El sabor de la victoria después de cada evento.
                        </p>
                    </div>

                </div>

                {/* CTA */}
                <div className="mt-24 p-12 bg-gradient-to-r from-lnl-red/20 to-transparent border-l-4 border-lnl-red rounded-r-xl">
                    <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">¿Quiere ser parte de la historia?</h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                        Únase a la familia de patrocinadores de la Liga Nacional de Lucha y posicione su marca ante una audiencia fiel y apasionada.
                    </p>
                    <a href="mailto:marketing@luchalibrebolivia.com" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded hover:bg-gray-200 transition-colors">
                        <Handshake className="w-5 h-5" /> Contáctenos
                    </a>
                </div>

            </div>
        </div>
    );
}
