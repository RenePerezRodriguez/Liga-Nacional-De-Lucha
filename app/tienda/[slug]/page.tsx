"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, MessageCircle, ArrowLeft, Star, Truck, Shield, Share2, Check, Loader2 } from "lucide-react";
import { collection, getDocs, query, where, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSiteConfig } from "@/components/config-provider";

interface Product extends DocumentData {
    id: string;
    name: string;
    price: string | number;
    image?: string;
    category?: string;
    description?: string;
    status?: string;
    slug?: string;
    sizes?: string[];
    features?: string[];
    stock?: number;
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

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [baseUrl, setBaseUrl] = useState("");
    const config = useSiteConfig();

    useEffect(() => {
        setBaseUrl(window.location.origin);

        async function fetchProduct() {
            try {
                // First try to find by slug field
                const slugQuery = query(collection(db, "productos"), where("slug", "==", slug));
                let snapshot = await getDocs(slugQuery);

                // If not found by slug, get all and match by generated slug
                if (snapshot.empty) {
                    const allQuery = query(collection(db, "productos"));
                    const allSnapshot = await getDocs(allQuery);
                    const matchedDoc = allSnapshot.docs.find(doc => {
                        const data = doc.data();
                        return generateSlug(data.name || "") === slug;
                    });
                    if (matchedDoc) {
                        setProduct({ id: matchedDoc.id, ...matchedDoc.data() } as Product);
                    }
                } else {
                    const doc = snapshot.docs[0];
                    setProduct({ id: doc.id, ...doc.data() } as Product);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [slug]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${baseUrl}/tienda/${slug}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsAppBuy = () => {
        if (!product) return;

        const productUrl = `${baseUrl}/tienda/${slug}`;
        const price = typeof product.price === 'number' ? `Bs. ${product.price}` : product.price;
        const sizeText = selectedSize ? `\n📏 Talla: ${selectedSize}` : '';

        const message = `¡Hola! 👋

Quiero comprar este producto:
📦 *${product.name}*
💰 Precio: ${price}${sizeText}

🔗 Ver producto: ${productUrl}

¿Está disponible? ¿Cuáles son las opciones de pago y entrega?`;

        window.open(`https://wa.me/${config.whatsappVentas}?text=${encodeURIComponent(message)}`, "_blank");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-lnl-red" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white pt-28">
                <div className="text-center">
                    <ShoppingBag className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Producto no encontrado</h1>
                    <p className="text-gray-500 mb-4">El producto que buscas no existe o fue eliminado.</p>
                    <Link href="/tienda" className="text-lnl-red hover:underline flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Volver a la tienda
                    </Link>
                </div>
            </div>
        );
    }

    const price = typeof product.price === 'number' ? `Bs. ${product.price}` : product.price;
    const features = product.features || [];
    const sizes = product.sizes || [];

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
                        {product.image ? (
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                                <ShoppingBag className="w-32 h-32" />
                            </div>
                        )}
                        {product.status && product.status !== 'active' && (
                            <div className="absolute top-4 right-4 bg-black/80 text-white font-bold px-4 py-2 rounded-lg">
                                {product.status === 'soldout' ? 'AGOTADO' : 'PREVENTA'}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div>
                        <span className="text-lnl-gold font-bold uppercase tracking-widest text-sm">{product.category}</span>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tight mt-2 mb-4">{product.name}</h1>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-6">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-lnl-gold fill-lnl-gold" />
                            ))}
                            <span className="text-gray-400 text-sm ml-2">(Producto oficial LNL)</span>
                        </div>

                        <p className="text-4xl font-black text-white mb-6">{price}</p>

                        {product.description && (
                            <p className="text-gray-400 text-lg leading-relaxed mb-8">{product.description}</p>
                        )}

                        {/* Sizes */}
                        {sizes.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-white font-bold uppercase mb-3">Tallas Disponibles</h3>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 border rounded font-bold transition-all ${selectedSize === size
                                                ? 'border-lnl-red bg-lnl-red text-white'
                                                : 'border-zinc-700 text-white hover:border-lnl-red hover:bg-lnl-red/10'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Features */}
                        {features.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-white font-bold uppercase mb-3">Características</h3>
                                <ul className="space-y-2">
                                    {features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2 text-gray-300">
                                            <span className="w-1.5 h-1.5 bg-lnl-red rounded-full"></span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* CTA Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleWhatsAppBuy}
                                disabled={product.status === 'soldout'}
                                className="w-full py-4 bg-green-600 text-white font-black uppercase tracking-widest rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center gap-3 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <MessageCircle className="w-6 h-6" />
                                {product.status === 'soldout' ? 'Producto Agotado' : 'Comprar por WhatsApp'}
                            </button>

                            <button
                                onClick={handleCopyLink}
                                className="w-full py-3 bg-zinc-800 text-white font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-5 h-5 text-green-500" /> ¡Link Copiado!
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-5 h-5" /> Compartir Producto
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="flex items-center gap-3 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                                <Truck className="w-8 h-8 text-lnl-gold flex-shrink-0" />
                                <div>
                                    <p className="text-white font-bold text-sm">Envío a Todo Bolivia</p>
                                    <p className="text-gray-500 text-xs">Consulta costos</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                                <Shield className="w-8 h-8 text-lnl-gold flex-shrink-0" />
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
