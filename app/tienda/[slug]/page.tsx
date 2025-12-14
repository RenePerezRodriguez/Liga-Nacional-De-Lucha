"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, MessageCircle, ArrowLeft, Star, Truck, Shield } from "lucide-react";

// Simulated product database
const products: Record<string, {
    id: number,
    name: string,
    price: string,
    priceNum: number,
    image: string,
    category: string,
    description: string,
    sizes?: string[],
    features: string[]
}> = {
    "polera-oficial-lnl-2024": {
        id: 1,
        name: "Polera Oficial LNL 2024",
        price: "Bs. 100",
        priceNum: 100,
        image: "/images/merch/tshirt-black.jpg",
        category: "Ropa",
        description: "Polera oficial de la Liga Nacional de Lucha, temporada 2024. Confeccionada en algodón premium con el logotipo bordado en el pecho.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        features: ["100% Algodón", "Bordado de alta calidad", "Lavable a máquina", "Diseño exclusivo"]
    },
    "mascara-replica-el-sombra": {
        id: 2,
        name: "Máscara Réplica - El Sombra",
        price: "Bs. 250",
        priceNum: 250,
        image: "/images/merch/mask-sombra.jpg",
        category: "Máscaras",
        description: "Réplica oficial de la máscara de El Sombra, el Rey de las Tinieblas. Ideal para coleccionistas y fans.",
        features: ["Licuadora profesional", "Ajuste elástico", "Visión clara", "Edición limitada"]
    },
    "gorra-snapback-lnl": {
        id: 3,
        name: "Gorra Snapback LNL",
        price: "Bs. 80",
        priceNum: 80,
        image: "/images/merch/cap.jpg",
        category: "Accesorios",
        description: "Gorra snapback con el logo de LNL bordado. Ajustable para todas las tallas.",
        features: ["Talla única ajustable", "Bordado 3D", "Visera plana", "Material resistente"]
    },
    "pack-de-stickers": {
        id: 4,
        name: "Pack de Stickers",
        price: "Bs. 20",
        priceNum: 20,
        image: "/images/merch/stickers.jpg",
        category: "Accesorios",
        description: "Pack de 10 stickers con los luchadores más icónicos de la LNL. Resistentes al agua.",
        features: ["10 diseños únicos", "Vinil resistente", "Impermeables", "Perfectos para laptops"]
    }
};

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const product = products[slug];

    if (!product) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
                <div className="text-center">
                    <ShoppingBag className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
                    <h1 className="text-2xl font-bold">Producto no encontrado</h1>
                    <Link href="/tienda" className="text-lnl-red hover:underline mt-4 block">
                        Volver a la tienda
                    </Link>
                </div>
            </div>
        );
    }

    const handleWhatsAppBuy = () => {
        const message = `Hola, quiero comprar: ${product.name} (${product.price})`;
        window.open(`https://wa.me/59170000000?text=${encodeURIComponent(message)}`, "_blank");
    };

    return (
        <div className="min-h-screen bg-zinc-950 pb-20 pt-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <Link href="/tienda" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Volver a la Tienda
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                            <ShoppingBag className="w-32 h-32" />
                        </div>
                        {/* Uncomment when real images exist */}
                        {/* <Image src={product.image} alt={product.name} fill className="object-cover" /> */}
                    </div>

                    {/* Product Details */}
                    <div>
                        <span className="text-lnl-gold font-bold uppercase tracking-widest text-sm">{product.category}</span>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tight mt-2 mb-4">{product.name}</h1>

                        <div className="flex items-center gap-2 mb-6">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-lnl-gold fill-lnl-gold" />
                            ))}
                            <span className="text-gray-400 text-sm ml-2">(12 reseñas)</span>
                        </div>

                        <p className="text-3xl font-black text-white mb-6">{product.price}</p>

                        <p className="text-gray-400 text-lg leading-relaxed mb-8">{product.description}</p>

                        {/* Sizes */}
                        {product.sizes && (
                            <div className="mb-8">
                                <h3 className="text-white font-bold uppercase mb-3">Tallas Disponibles</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map(size => (
                                        <button key={size} className="px-4 py-2 border border-zinc-700 rounded text-white hover:border-lnl-red hover:bg-lnl-red/10 transition-all font-bold">
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Features */}
                        <div className="mb-8">
                            <h3 className="text-white font-bold uppercase mb-3">Características</h3>
                            <ul className="space-y-2">
                                {product.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-gray-300">
                                        <span className="w-1.5 h-1.5 bg-lnl-red rounded-full"></span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={handleWhatsAppBuy}
                            className="w-full py-4 bg-green-600 text-white font-black uppercase tracking-widest rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center gap-3 text-lg shadow-lg"
                        >
                            <MessageCircle className="w-6 h-6" /> Comprar por WhatsApp
                        </button>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="flex items-center gap-3 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                                <Truck className="w-8 h-8 text-lnl-gold" />
                                <div>
                                    <p className="text-white font-bold text-sm">Envío a Todo Bolivia</p>
                                    <p className="text-gray-500 text-xs">Consulta costos</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                                <Shield className="w-8 h-8 text-lnl-gold" />
                                <div>
                                    <p className="text-white font-bold text-sm">Producto Original</p>
                                    <p className="text-gray-500 text-xs">100% Garantizado</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
