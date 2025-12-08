import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsCardProps {
    title: string;
    excerpt: string;
    date: string;
    category?: string;
    imageUrl?: string;
    slug: string;
}

export function NewsCard({ title, excerpt, date, category = "Noticias", imageUrl, slug }: NewsCardProps) {
    return (
        <Link href={`/noticias/${slug}`} className="group flex flex-col md:flex-row gap-6 bg-lnl-gray/50 border border-zinc-800 rounded-xl overflow-hidden hover:bg-lnl-gray hover:border-lnl-red/50 transition-all p-4">
            {/* Image */}
            <div className="relative w-full md:w-1/3 aspect-video md:aspect-[4/3] rounded-lg overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-zinc-800 animate-pulse" /> {/* Placeholder */}
                {imageUrl && (
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center flex-grow">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-lnl-gold bg-lnl-gold/10 px-2 py-1 rounded">
                        {category}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 text-xs uppercase">
                        <Clock className="w-3 h-3" />
                        <span>{date}</span>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-lnl-red transition-colors leading-tight">
                    {title}
                </h3>

                <p className="text-gray-400 text-sm line-clamp-2 md:line-clamp-3 mb-4">
                    {excerpt}
                </p>

                <span className="inline-flex items-center text-lnl-red font-bold text-sm uppercase tracking-wide group-hover:gap-2 transition-all">
                    Leer más <ArrowRight className="w-4 h-4 ml-1" />
                </span>
            </div>
        </Link>
    );
}
