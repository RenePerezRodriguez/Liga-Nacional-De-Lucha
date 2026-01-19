"use client";

import { useEffect, useState } from "react";
import { Handshake, ExternalLink } from "lucide-react";
import Image from "next/image";
import { collection, onSnapshot, query, orderBy, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Sponsor extends DocumentData {
    id: string;
    name: string;
    type?: string;
    logo?: string;
    description?: string;
    website?: string;
}

export default function SponsorsPage() {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "auspiciadores"), orderBy("name"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setSponsors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Sponsor[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const getSponsorTypeLabel = (type?: string) => {
        switch (type) {
            case "principal": return "Patrocinador Principal";
            case "media": return "Media Partner";
            case "colaborador": return "Colaborador";
            default: return "Partner Oficial";
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20">
            {/* Hero */}
            <section className="relative h-[50vh] flex items-center justify-center overflow-hidden mb-20">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-lnl-gold/20 via-black to-black" />
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

                {/* Sponsor Grid */}
                {loading ? (
                    <div className="text-center text-gray-500 py-20">Cargando auspiciadores...</div>
                ) : sponsors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {sponsors.map((sponsor) => (
                            <div key={sponsor.id} className="bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 flex flex-col items-center text-center hover:border-lnl-gold/50 transition-colors group">
                                <div className="w-32 h-32 relative mb-6 grayscale group-hover:grayscale-0 transition-all duration-300">
                                    {sponsor.logo ? (
                                        <Image src={sponsor.logo} alt={sponsor.name} fill className="object-contain rounded-full bg-white/10 p-2" />
                                    ) : (
                                        <div className="w-full h-full bg-white/10 rounded-full flex items-center justify-center">
                                            <Handshake className="w-12 h-12 text-gray-500" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tight mb-2">{sponsor.name}</h3>
                                <span className="text-xs font-bold uppercase tracking-widest text-lnl-gold mb-4">{getSponsorTypeLabel(sponsor.type)}</span>
                                {sponsor.description && (
                                    <p className="text-sm text-gray-500 mb-4">{sponsor.description}</p>
                                )}
                                {sponsor.website && (
                                    <a href={sponsor.website} target="_blank" rel="noreferrer" className="text-lnl-gold text-xs flex items-center gap-1 hover:text-yellow-400">
                                        <ExternalLink className="w-3 h-3" /> Visitar sitio
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-20">
                        <Handshake className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
                        <p>Próximamente anunciaremos a nuestros aliados.</p>
                    </div>
                )}

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
