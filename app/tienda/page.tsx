"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, MessageCircle, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSiteConfig } from "@/components/config-provider";

interface Product extends DocumentData {
    id: string;
    name: string;
    price: string | number;
    image?: string;
    category?: string;
    status?: string;
    slug?: string;
    description?: string;
}

// Generate slug from product name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

// Generate WhatsApp message with product details
function getWhatsAppUrl(product: Product, baseUrl: string, whatsappNumber: string): string {
    const productUrl = `${baseUrl}/tienda/${product.slug || generateSlug(product.name)}`;
    const price = typeof product.price === 'number' ? `Bs. ${product.price}` : product.price;

    const message = `¡Hola! 👋

Me interesa comprar:
📦 *${product.name}*
💰 Precio: ${price}

🔗 Ver producto: ${productUrl}

¿Está disponible? ¿Cuáles son las opciones de entrega?`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export default function StorePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [baseUrl, setBaseUrl] = useState("");
    const config = useSiteConfig();

    useEffect(() => {
        // Get base URL for sharing
        setBaseUrl(window.location.origin);

        const q = query(collection(db, "productos"), orderBy("name"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-zinc-950 pb-20">
            {/* Hero */}
            <div className="bg-gradient-to-br from-lnl-red to-red-800 py-12 md:py-16 mb-10">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-2">Tienda Oficial</h1>
                    <p className="text-white/80 font-bold uppercase tracking-widest text-sm md:text-base">Lleva la pasión de la lucha contigo</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {loading ? (
                        <div className="col-span-full text-center text-gray-500 py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lnl-red mx-auto mb-4"></div>
                            Cargando productos...
                        </div>
                    ) : products.length > 0 ? (
                        products.filter(p => p.status !== 'hidden').map((product) => {
                            const slug = product.slug || generateSlug(product.name);
                            const price = typeof product.price === 'number' ? `Bs. ${product.price}` : product.price;

                            return (
                                <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group hover:border-lnl-gold transition-all">
                                    {/* Clickable Image Area */}
                                    <Link href={`/tienda/${slug}`} className="block">
                                        <div className="relative aspect-square bg-zinc-800 overflow-hidden">
                                            {product.image ? (
                                                <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-zinc-700 group-hover:text-lnl-gold transition-colors">
                                                    <ShoppingBag className="w-16 h-16" />
                                                </div>
                                            )}
                                            {product.status && product.status !== 'active' && (
                                                <div className="absolute top-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
                                                    {product.status === 'soldout' ? 'AGOTADO' : 'PREVENTA'}
                                                </div>
                                            )}
                                            {/* View Details Overlay */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="flex items-center gap-2 text-white font-bold uppercase text-sm bg-lnl-red px-4 py-2 rounded-full">
                                                    <ExternalLink className="w-4 h-4" /> Ver Detalles
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="p-5">
                                        <span className="text-xs text-lnl-gold font-bold uppercase tracking-wider">{product.category}</span>
                                        <Link href={`/tienda/${slug}`}>
                                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-lnl-gold transition-colors line-clamp-2">{product.name}</h3>
                                        </Link>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-2xl font-black text-white">{price}</span>
                                            <a
                                                href={getWhatsAppUrl(product, baseUrl, config.whatsappVentas)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-green-600 text-white text-xs font-bold uppercase px-3 py-2 rounded-lg hover:bg-green-500 transition-colors flex items-center gap-1.5"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                Comprar
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <ShoppingBag className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                            <p className="text-gray-500">No hay productos disponibles.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
