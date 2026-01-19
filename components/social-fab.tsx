"use client";

import { useState } from "react";
import { Facebook, MessageCircle, X, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteConfig } from "@/components/config-provider";

export function SocialFab() {
    const [isOpen, setIsOpen] = useState(false);
    const config = useSiteConfig();

    const socialLinks = [
        {
            name: "WhatsApp",
            href: `https://wa.me/${config.whatsappVentas}?text=Hola,%20quiero%20información%20sobre%20Lucha%20Libre%20Bolivia`,
            icon: MessageCircle,
            color: "bg-green-600 hover:bg-green-500",
        },
        {
            name: "Facebook",
            href: config.social.facebook,
            icon: Facebook,
            color: "bg-blue-600 hover:bg-blue-500",
        },
        {
            name: "YouTube",
            href: config.social.youtube,
            icon: () => (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            ),
            color: "bg-red-600 hover:bg-red-500",
        },
        {
            name: "TikTok",
            href: config.social.tiktok,
            icon: () => (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
            ),
            color: "bg-black hover:bg-zinc-800 border border-zinc-700",
        },
    ].filter(link => link.href); // Only show links that have values

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
            {/* Social Links */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {socialLinks.map((link, index) => (
                            <motion.a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg transition-all ${link.color}`}
                                title={link.name}
                            >
                                <link.icon className="w-5 h-5" />
                            </motion.a>
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* Main FAB Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all ${isOpen
                    ? "bg-zinc-800 hover:bg-zinc-700"
                    : "bg-lnl-red hover:bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    }`}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <Share2 className="w-6 h-6 text-white" />
                )}
            </motion.button>
        </div>
    );
}
