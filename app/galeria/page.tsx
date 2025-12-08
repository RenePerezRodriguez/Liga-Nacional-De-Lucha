import Link from "next/link";
import Image from "next/image";
import { Download, Camera } from "lucide-react";

const photos = [
    { id: 1, src: "/images/hero/hero-bg.png", alt: "Arena Wide Shot", category: "Eventos" },
    { id: 2, src: "/images/roster/el-sombra.png", alt: "El Sombra Entrance", category: "Luchadores" },
    { id: 3, src: "/images/roster/furia-roja.png", alt: "Furia Roja Pose", category: "Luchadores" },
    { id: 4, src: "/images/events/guerra-del-valle.png", alt: "Crowd reaction", category: "Fans" },
    { id: 5, src: "/images/events/noche-de-campeones.png", alt: "Championship Celebration", category: "Eventos" },
    { id: 6, src: "/images/roster/titan.png", alt: "High Flying Action", category: "Acción" },
];

export default function GalleryPage() {
    return (
        <div className="min-h-screen bg-black pb-20">
            <div className="py-10 md:py-12 mb-8 md:mb-10 text-center">
                <h1 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-4">
                    Galería <span className="text-lnl-red">HD</span>
                </h1>
                <p className="text-gray-400 text-sm md:text-base">Revive los mejores momentos de la LNL.</p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                    {photos.map((photo) => (
                        <div key={photo.id} className="relative group break-inside-avoid rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                            <div className="relative aspect-auto">
                                <Image
                                    src={photo.src}
                                    alt={photo.alt}
                                    width={600}
                                    height={400}
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <a href={photo.src} download className="p-3 bg-white text-black rounded-full hover:bg-lnl-gold transition-colors">
                                        <Download className="w-6 h-6" />
                                    </a>
                                    <button className="p-3 bg-white text-black rounded-full hover:bg-lnl-gold transition-colors">
                                        <Camera className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
