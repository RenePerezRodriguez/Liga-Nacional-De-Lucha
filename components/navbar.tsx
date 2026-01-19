"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Ticket, Phone, MapPin, Handshake, ChevronDown, ImageIcon, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteConfig } from "@/components/config-provider";

// Format phone number for display: 59170000000 -> +591 700-00000
function formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('591')) {
        return `+591 ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
}

const navItems = [
    { name: "Eventos", href: "/eventos" },
    { name: "Luchadores", href: "/luchadores" },
    { name: "Campeonatos", href: "/campeonatos" },
    { name: "Ranking", href: "/ranking" },
    { name: "Tienda", href: "/tienda" },
    { name: "Academia", href: "/academia" },
    { name: "Noticias", href: "/noticias" },
    { name: "Nosotros", href: "/quienes-somos" },
];

const multimediaItems = [
    { name: "Videos", href: "/videos", icon: Video, desc: "Luchas y entrevistas" },
    { name: "Galería", href: "/galeria", icon: ImageIcon, desc: "Fotos de eventos" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [multimediaOpen, setMultimediaOpen] = useState(false);
    const config = useSiteConfig();
    const phoneDisplay = formatPhone(config.whatsappVentas);

    return (
        <nav className="fixed w-full z-50">

            {/* Top Bar - Info & CTA */}
            <div className="bg-zinc-950 border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-10 text-xs md:text-sm">

                        {/* Left: Contact Info */}
                        <div className="hidden lg:flex items-center gap-4 text-gray-400 text-[11px]">
                            <a href={`tel:+${config.whatsappVentas}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                                <Phone className="w-3 h-3" />
                                <span>{phoneDisplay}</span>
                            </a>
                            <span className="text-zinc-700">|</span>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-lnl-red" />
                                <span className="text-gray-500">LP • SC • CB • OR • PT • CH • TJ • BN • PD</span>
                            </div>
                        </div>

                        {/* Right: CTA Buttons */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/auspiciadores"
                                className="flex items-center gap-1 px-2 py-1.5 text-gray-400 hover:text-white font-bold uppercase tracking-widest text-[10px] md:text-xs transition-colors"
                            >
                                <Handshake className="w-3 h-3" />
                                <span className="hidden sm:inline">Auspiciadores</span>
                            </Link>
                            <Link
                                href="/reservas"
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-lnl-red text-white font-bold uppercase tracking-widest text-xs rounded hover:bg-red-600 transition-all shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                            >
                                <Ticket className="w-3 h-3" />
                                <span className="hidden sm:inline">Comprar</span> Entradas
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="bg-gradient-to-b from-black via-black/95 to-transparent backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">

                        {/* Logo Section */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-16 h-16 md:w-20 md:h-20 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                                <Image
                                    src="/images/logos/LNL-Logotipo.png"
                                    alt="LNL Logo"
                                    fill
                                    sizes="80px"
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div className="hidden sm:flex flex-col justify-center">
                                <span className="font-black text-lg md:text-xl tracking-tighter text-white uppercase group-hover:text-lnl-red transition-colors leading-none mb-0.5">
                                    Lucha Libre
                                </span>
                                <span className="text-[10px] md:text-xs font-bold text-lnl-red tracking-[0.2em] uppercase leading-none">
                                    Bolivia
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden lg:block">
                            <div className="flex items-baseline space-x-0">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="text-gray-300 hover:text-white hover:bg-white/5 px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-bold uppercase tracking-wide transition-all relative group"
                                    >
                                        {item.name}
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-lnl-red transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                                    </Link>
                                ))}

                                {/* Multimedia Dropdown */}
                                <div
                                    className="relative"
                                    onMouseEnter={() => setMultimediaOpen(true)}
                                    onMouseLeave={() => setMultimediaOpen(false)}
                                >
                                    <button className="flex items-center gap-1 text-gray-300 hover:text-white hover:bg-white/5 px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-bold uppercase tracking-wide transition-all">
                                        Media
                                        <ChevronDown className={`w-3 h-3 transition-transform ${multimediaOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {multimediaOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute top-full left-0 mt-1 w-52 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
                                            >
                                                {multimediaItems.map((item) => (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        className="flex items-center gap-3 px-4 py-3 hover:bg-lnl-red/10 transition-colors border-b border-zinc-800/50 last:border-0"
                                                    >
                                                        <item.icon className="w-5 h-5 text-lnl-red" />
                                                        <div>
                                                            <span className="block text-white font-bold text-sm">{item.name}</span>
                                                            <span className="block text-gray-500 text-xs">{item.desc}</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex lg:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-lnl-gray focus:outline-none focus:ring-2 focus:ring-inset focus:ring-lnl-red transition-all"
                            >
                                <span className="sr-only">Abrir menú</span>
                                {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="lg:hidden bg-black/98 border-t border-zinc-800"
                    >
                        <div className="px-4 pt-4 pb-6 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-3 rounded-lg text-gray-200 hover:text-white hover:bg-lnl-red/10 font-bold uppercase tracking-wider transition-all"
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {/* Multimedia Section */}
                            <div className="border-t border-zinc-800 pt-3 mt-3">
                                <span className="block px-4 text-lnl-red font-bold uppercase text-xs tracking-widest mb-2">Multimedia</span>
                                {multimediaItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-200 hover:text-white hover:bg-lnl-red/10 transition-all"
                                    >
                                        <item.icon className="w-5 h-5 text-lnl-red" />
                                        <span className="font-bold">{item.name}</span>
                                    </Link>
                                ))}
                            </div>

                            {/* Mobile CTA */}
                            <Link
                                href="/reservas"
                                onClick={() => setIsOpen(false)}
                                className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-lnl-red text-white font-black uppercase tracking-widest rounded-lg hover:bg-red-600 transition-all"
                            >
                                <Ticket className="w-5 h-5" />
                                Comprar Entradas
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
