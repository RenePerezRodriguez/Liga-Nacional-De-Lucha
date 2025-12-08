import Image from "next/image";
import { ShoppingBag, MessageCircle } from "lucide-react";

const products = [
    {
        id: 1,
        name: "Polera Oficial LNL 2024",
        price: "Bs. 100",
        image: "/images/merch/tshirt-black.jpg", // Placeholder
        category: "Ropa"
    },
    {
        id: 2,
        name: "Máscara Réplica - El Sombra",
        price: "Bs. 250",
        image: "/images/merch/mask-sombra.jpg", // Placeholder
        category: "Máscaras"
    },
    {
        id: 3,
        name: "Gorra Snapback LNL",
        price: "Bs. 80",
        image: "/images/merch/cap.jpg", // Placeholder
        category: "Accesorios"
    },
    {
        id: 4,
        name: "Pack de Stickers",
        price: "Bs. 20",
        image: "/images/merch/stickers.jpg", // Placeholder
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
                        <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group hover:border-lnl-gold transition-all">
                            <div className="relative aspect-square bg-zinc-800">
                                {/* Placeholder for Product Image */}
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                                    <ShoppingBag className="w-16 h-16" />
                                </div>
                            </div>
                            <div className="p-6">
                                <span className="text-xs text-lnl-gold font-bold uppercase tracking-wider">{product.category}</span>
                                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-2xl font-black text-white">{product.price}</span>
                                    <a
                                        href={`https://wa.me/59170000000?text=Hola, quiero comprar: ${product.name}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-green-600 text-white p-2 rounded-full hover:bg-green-500 transition-colors"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
