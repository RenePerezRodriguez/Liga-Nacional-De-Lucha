import Image from "next/image";
import Link from "next/link";

interface WrestlerCardProps {
    name: string;
    nickname?: string;
    imageUrl?: string;
    alignment?: "face" | "heel";
    slug?: string;
}

export function WrestlerCard({ name, nickname, imageUrl, slug: providedSlug }: WrestlerCardProps) {
    // Use provided slug or generate from name
    const slug = providedSlug || name
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

    return (
        <Link href={`/luchadores/${slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-xl bg-lnl-gray">
            {/* Background/Image */}
            <div className="absolute inset-0 bg-zinc-900 transition-transform duration-500 group-hover:scale-105">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-top"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                        <span className="text-4xl">?</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            </div>

            {/* Name Plate */}
            <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                {nickname && (
                    <span className="block text-lnl-gold text-xs font-bold uppercase tracking-widest mb-1 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                        {nickname}
                    </span>
                )}
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter group-hover:text-lnl-red transition-colors">
                    {name}
                </h3>
                <div className="h-1 w-12 bg-lnl-red mt-2 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            </div>
        </Link>
    );
}
