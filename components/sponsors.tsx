"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

interface Sponsor extends DocumentData {
    id: string;
    name: string;
    logo?: string;
}

export function SponsorsSection() {
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

    if (loading || sponsors.length === 0) {
        return null; // Don't show section if no sponsors
    }

    return (
        <section className="bg-white py-12 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8">
                    Nuestros Patrocinadores Oficiales
                </p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-60 hover:opacity-100 transition-opacity duration-300">
                    {sponsors.map((sponsor) => (
                        <div key={sponsor.id} className="relative group">
                            {sponsor.logo ? (
                                <div className="relative w-24 h-16 md:w-32 md:h-20 grayscale group-hover:grayscale-0 transition-all">
                                    <Image src={sponsor.logo} alt={sponsor.name} fill className="object-contain" />
                                </div>
                            ) : (
                                <div className="text-xl md:text-2xl font-black text-gray-400 hover:text-black uppercase italic tracking-tighter transition-colors select-none">
                                    {sponsor.name}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
