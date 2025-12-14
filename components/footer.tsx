"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Youtube, Ticket, Calendar, MapPin, ArrowRight } from "lucide-react";
import { Countdown } from "./countdown";

export function Footer() {
    return (
        <footer className="bg-lnl-dark border-t border-lnl-gray">

            {/* Next Event Banner */}
            <div className="bg-gradient-to-r from-lnl-red via-red-700 to-lnl-red relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/events/guerra-del-valle.png')] bg-cover bg-center opacity-20" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                        {/* Event Info */}
                        <div className="flex items-center gap-4 text-white">
                            <div className="hidden sm:block p-3 bg-black/30 rounded-lg">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <div className="text-center md:text-left">
                                <span className="text-xs font-bold uppercase tracking-widest text-white/70">Próximo Evento</span>
                                <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tight">Guerra del Valle</h3>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-white/80">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" /> 15 Dic, 2024
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" /> Coliseo Pittsburg
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Countdown */}
                        <div className="hidden lg:block scale-75 origin-center">
                            <Countdown targetDate="2024-12-15T18:30:00" eventName="" />
                        </div>

                        {/* CTA */}
                        <Link
                            href="/reservas"
                            className="flex items-center gap-2 px-6 py-3 bg-white text-lnl-red font-black uppercase tracking-widest rounded-lg hover:bg-yellow-400 hover:text-black transition-all shadow-lg group"
                        >
                            <Ticket className="w-5 h-5" />
                            Comprar Entradas
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="pt-12 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

                        {/* Brand */}
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative w-12 h-12">
                                    <Image
                                        src="/images/logos/LNL-Logotipo.png"
                                        alt="LNL Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <div>
                                    <span className="font-black text-xl tracking-tighter text-white uppercase block leading-none">
                                        Lucha Libre
                                    </span>
                                    <span className="text-xs font-bold text-lnl-red tracking-[0.2em] uppercase">
                                        Bolivia
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm max-w-sm mb-6">
                                El epicentro de la lucha libre profesional en Bolivia.
                                Pasión, adrenalina y espectáculo puro.
                            </p>

                            {/* Social Icons */}
                            <div className="flex space-x-3">
                                <a href="https://www.facebook.com/profile.php?id=61559310413691" target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                                    <Facebook className="h-5 w-5" />
                                </a>
                                <a href="https://www.youtube.com/@LigaNacionalDeLucha" target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg text-gray-400 hover:bg-red-600 hover:text-white transition-all">
                                    <Youtube className="h-5 w-5" />
                                </a>
                                <a href="https://www.tiktok.com/@liganacionalde.lucha" target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg text-gray-400 hover:bg-pink-600 hover:text-white transition-all">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div>
                            <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">
                                Navegación
                            </h3>
                            <ul className="space-y-2">
                                <li><Link href="/eventos" className="text-gray-400 hover:text-white text-sm transition-colors">Eventos</Link></li>
                                <li><Link href="/luchadores" className="text-gray-400 hover:text-white text-sm transition-colors">Luchadores</Link></li>
                                <li><Link href="/ranking" className="text-gray-400 hover:text-white text-sm transition-colors">Ranking</Link></li>
                                <li><Link href="/tienda" className="text-gray-400 hover:text-white text-sm transition-colors">Tienda</Link></li>
                                <li><Link href="/academia" className="text-gray-400 hover:text-white text-sm transition-colors">Academia</Link></li>
                                <li><Link href="/noticias" className="text-gray-400 hover:text-white text-sm transition-colors">Noticias</Link></li>
                            </ul>
                        </div>

                        {/* Contact & Legal */}
                        <div>
                            <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">
                                Contacto
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-lnl-red" />
                                    Cochabamba, Bolivia
                                </li>
                                <li>
                                    <a href="tel:+59170000000" className="hover:text-white transition-colors">
                                        +591 700-00000
                                    </a>
                                </li>
                                <li>
                                    <a href="mailto:info@luchalibrebolivia.com" className="hover:text-white transition-colors">
                                        info@luchalibrebolivia.com
                                    </a>
                                </li>
                            </ul>

                            <div className="mt-6">
                                <h3 className="text-white font-bold uppercase tracking-wider mb-2 text-sm">
                                    Legal
                                </h3>
                                <ul className="space-y-1 text-xs text-gray-500">
                                    <li><Link href="#" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
                                    <li><Link href="#" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-zinc-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-xs">
                            © {new Date().getFullYear()} Liga Nacional de Lucha Bolivia. Todos los derechos reservados.
                        </p>
                        <p className="text-gray-600 text-xs">
                            Desarrollado por{" "}
                            <a href="https://DesarrolloWebBolivia.com" target="_blank" rel="noopener noreferrer" className="hover:text-lnl-red transition-colors">
                                DesarrolloWebBolivia.com
                            </a>
                            {" "}&{" "}
                            <a href="https://SafeSoft.tech" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
                                SafeSoft.tech
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
