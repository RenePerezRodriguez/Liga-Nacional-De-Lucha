import { PlayCircle } from "lucide-react";
import Image from "next/image";

export function YouTubeFeed() {
    const videos = [
        {
            title: "Guerra del Valle: Evento Completo",
            duration: "2:15:30",
            thumbnail: "/images/video-thumb-1.jpg", // Placeholder
            views: "15k vistas",
            date: "Hace 2 semanas"
        },
        {
            title: "TOP 10: Mejores Movimientos de Furia Roja",
            duration: "12:45",
            thumbnail: "/images/video-thumb-2.jpg", // Placeholder
            views: "25k vistas",
            date: "Hace 1 mes"
        },
        {
            title: "Promo: La Traición del Sombra",
            duration: "05:20",
            thumbnail: "/images/video-thumb-3.jpg", // Placeholder
            views: "8k vistas",
            date: "Hace 3 días"
        }
    ];

    return (
        <section className="bg-zinc-900 py-10 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <span className="text-red-600 font-bold uppercase tracking-widest text-sm block mb-2">LNL Network</span>
                        <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-white">Últimos Videos</h2>
                    </div>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold uppercase text-xs md:text-sm">
                        Visitar Canal <PlayCircle className="w-4 h-4" />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {videos.map((video, idx) => (
                        <div key={idx} className="group cursor-pointer">
                            <div className="relative aspect-video bg-zinc-800 rounded-xl overflow-hidden mb-3 border border-zinc-700 group-hover:border-lnl-red transition-all shadow-lg">
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <PlayCircle className="w-12 h-12 text-white/80 group-hover:text-lnl-red group-hover:scale-110 transition-all" />
                                </div>
                                {/* Simulated Thumbnail */}
                                <div className="absolute inset-0 bg-zinc-800" />
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
                                    {video.duration}
                                </div>
                            </div>
                            <h3 className="text-white font-bold leading-tight mb-1 group-hover:text-lnl-gold transition-colors">{video.title}</h3>
                            <div className="text-gray-500 text-xs flex gap-2">
                                <span>{video.views}</span>
                                <span>•</span>
                                <span>{video.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
