import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, MessageCircle } from "lucide-react";

const products = [
    {
        id: 1,
        slug: "polera-oficial-lnl-2024",
        name: "Polera Oficial LNL 2024",
        price: "Bs. 100",
        image: "/images/merch/tshirt-black.jpg",
        category: "Ropa"
    },
    {
        id: 2,
        slug: "mascara-replica-el-sombra",
        name: "Máscara Réplica - El Sombra",
        price: "Bs. 250",
        image: "/images/merch/mask-sombra.jpg",
        category: "Máscaras"
    },
    {
        id: 3,
        slug: "gorra-snapback-lnl",
        name: "Gorra Snapback LNL",
        price: "Bs. 80",
        image: "/images/merch/cap.jpg",
        category: "Accesorios"
    },
    {
        id: 4,
        slug: "pack-de-stickers",
        name: "Pack de Stickers",
        price: "Bs. 20",
        image: "/images/merch/stickers.jpg",
        category: "Accesorios"
    }
];

export default function StorePage() {
    return (
        <div className="min-h-screen bg-zinc-950 pb-20">
            <div className="bg-lnl-red py-12 mb-10">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-2">Tienda Oficial</h1>
                    <p className="text-white/80 font-bold uppercase tracking-widest text-sm md:text-base">Lleva la pasión de la lucha contigo</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <Link key={product.id} href={`/tienda/${product.slug}`} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group hover:border-lnl-gold transition-all block">
                            <div className="relative aspect-square bg-zinc-800">
                                {/* Placeholder for Product Image */}
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-700 group-hover:text-lnl-gold transition-colors">
                                    <ShoppingBag className="w-16 h-16" />
                                </div>
                            </div>
                            <div className="p-6">
                                <span className="text-xs text-lnl-gold font-bold uppercase tracking-wider">{product.category}</span>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-lnl-gold transition-colors">{product.name}</h3>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-2xl font-black text-white">{product.price}</span>
                                    <span className="bg-lnl-red text-white text-xs font-bold uppercase px-3 py-1 rounded-full">
                                        Ver Detalles
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

