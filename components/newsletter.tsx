"use client";

import { Send } from "lucide-react";
import { useState } from "react";

export function Newsletter() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "success">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setStatus("success");
            setEmail("");
            // In a real app, you would send this to an API
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    return (
        <section className="bg-lnl-red py-10 md:py-16 relative overflow-hidden">
            {/* Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-multiply"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4 text-shadow-sm">
                    Únete a LNL Insider
                </h2>
                <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                    Recibe noticias exclusivas, preventa de entradas y contenido especial directamente en tu correo. ¡Sé el primero en saberlo!
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                    <input
                        type="email"
                        placeholder="Tu correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-grow px-6 py-4 rounded-full bg-white text-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 placeholder-gray-400"
                        required
                    />
                    <button
                        type="submit"
                        className="px-8 py-4 bg-black text-white font-bold uppercase tracking-wider rounded-full hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                        Suscribirse <Send className="w-4 h-4" />
                    </button>
                </form>

                {status === "success" && (
                    <div className="mt-4 p-4 bg-green-500 text-white font-bold rounded-lg animate-fade-in-up">
                        ¡Gracias por suscribirte! Pronto recibirás noticias nuestras.
                    </div>
                )}
            </div>
        </section>
    );
}
