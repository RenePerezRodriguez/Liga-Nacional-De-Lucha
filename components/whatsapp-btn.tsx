"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
    return (
        <a
            href="https://wa.me/59112345678?text=Hola%20LNL,%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20las%20entradas"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center animate-bounce-slow"
            aria-label="Contactar por WhatsApp"
        >
            <MessageCircle className="w-8 h-8 fill-current" />
        </a>
    );
}
