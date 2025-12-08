"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { name: "Eventos", href: "/eventos" },
    { name: "Luchadores", href: "/luchadores" },
    { name: "Ranking", href: "/ranking" },
    { name: "Tienda", href: "/tienda" },
    { name: "Academia", href: "/academia" },
    { name: "Noticias", href: "/noticias" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 w-full z-50 bg-lnl-dark/95 backdrop-blur-sm border-b border-lnl-gray shadow-lg transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-24">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-16 h-16 md:w-20 md:h-20 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                            <Image
                                src="/images/logos/LNL-Logotipo.png"
                                alt="LNL Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="font-black text-xl md:text-2xl tracking-tighter text-white uppercase group-hover:text-lnl-gold transition-colors leading-none mb-0.5">
                                LNL
                            </span>
                            <span className="text-[10px] md:text-xs font-bold text-lnl-red tracking-[0.2em] uppercase leading-none">
                                Cochabamba
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:block">
                        <div className="ml-10 flex items-baseline space-x-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-gray-300 hover:text-white hover:bg-lnl-red/10 px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all relative group"
                                >
                                    {item.name}
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-lnl-red transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="-mr-2 flex lg:hidden">
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

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-lnl-dark border-b border-lnl-gray overflow-hidden shadow-2xl"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-200 hover:text-white hover:bg-lnl-red/80 block px-3 py-4 rounded-xl text-lg font-black uppercase text-center tracking-widest transition-all"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
