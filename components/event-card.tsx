import { Calendar, MapPin, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EventCardProps {
    title: string;
    date: string;
    time: string;
    location: string;
    imageUrl?: string;
    isFeatured?: boolean;
}

export function EventCard({
    title,
    date,
    time,
    location,
    imageUrl,
    isFeatured = false,
}: EventCardProps) {
    return (
        <div className={cn(
            "group relative overflow-hidden rounded-xl bg-lnl-gray border border-zinc-800 transition-all hover:border-lnl-red hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]",
            isFeatured ? "md:col-span-2 aspect-video" : "aspect-[4/5]"
        )}>
            {/* Background Image Placeholder */}
            <div className="absolute inset-0 bg-zinc-900">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-6">
                <div className="flex items-center gap-2 text-lnl-gold mb-2 font-bold uppercase tracking-wider text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{date}</span>
                </div>

                <h3 className={cn(
                    "font-bold text-white uppercase italic leading-none mb-4 group-hover:text-lnl-red transition-colors",
                    isFeatured ? "text-4xl md:text-5xl" : "text-2xl"
                )}>
                    {title}
                </h3>

                <div className="space-y-2 text-gray-300 text-sm mb-6">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-lnl-red" />
                        <span>{time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-lnl-red" />
                        <span>{location}</span>
                    </div>
                </div>

                <Link
                    href="/eventos"
                    className="inline-flex items-center justify-center bg-lnl-red text-white font-bold uppercase tracking-wider py-2 px-6 rounded hover:bg-red-700 transition-colors"
                >
                    Entradas
                </Link>
            </div>

            {/* Featured Tag */}
            {isFeatured && (
                <div className="absolute top-4 right-4 bg-lnl-gold text-black font-bold uppercase text-xs px-3 py-1 rounded-full">
                    Evento Principal
                </div>
            )}
        </div>
    );
}
