import Image from "next/image";

export function SponsorsSection() {
    const sponsors = [
        { name: "Cerveza Paceña", logo: "/images/sponsors/pacena.png" },
        { name: "Coca Cola", logo: "/images/sponsors/coca-cola.png" },
        { name: "Burger King", logo: "/images/sponsors/burger-king.png" },
        { name: "Entel", logo: "/images/sponsors/entel.png" },
        { name: "Pollos Kingdom", logo: "/images/sponsors/pollos-kingdom.png" },
    ];

    return (
        <section className="bg-white py-12 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8">
                    Nuestros Patrocinadores Oficiales
                </p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-60 hover:opacity-100 transition-opacity duration-300 filter grayscale hover:grayscale-0">
                    {/* Since we don't have real logos, we'll use text placeholders styled nicely */}
                    {sponsors.map((sponsor, idx) => (
                        <div key={idx} className="text-xl md:text-2xl font-black text-gray-400 hover:text-black uppercase italic tracking-tighter transition-colors select-none">
                            {sponsor.name}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
