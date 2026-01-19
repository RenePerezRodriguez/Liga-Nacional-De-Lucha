import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, Clock, Share2, Facebook, Twitter } from "lucide-react";
import { collection, getDocs, query, where, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface NewsArticle extends DocumentData {
    id: string;
    title: string;
    slug?: string;
    date: string;
    category?: string;
    description?: string;
    content?: string;
    image?: string;
    author?: string;
    readTime?: string;
}

async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
    const newsQuery = query(
        collection(db, "noticias"),
        where("slug", "==", slug)
    );
    const snap = await getDocs(newsQuery);

    if (snap.empty) return null;

    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as NewsArticle;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
        return {
            title: "Noticia no encontrada | LNL Bolivia"
        };
    }

    return {
        title: `${article.title} | Noticias LNL`,
        description: article.description?.substring(0, 160) || article.title,
        openGraph: {
            title: article.title,
            description: article.description,
            images: article.image ? [article.image] : [],
            type: "article",
            publishedTime: article.date,
            authors: article.author ? [article.author] : []
        }
    };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    // Debug content structure
    console.log("Article Content Preview:", article?.content?.substring(0, 200));

    if (!article) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-black uppercase italic mb-4">Artículo no encontrado</h1>
                    <Link href="/noticias" className="text-lnl-red hover:underline">
                        ← Volver a Noticias
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 pb-20">
            {/* Hero */}
            <div className="relative h-[50vh] overflow-hidden">
                <div className="absolute inset-0 bg-zinc-900">
                    {article.image ? (
                        <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            sizes="100vw"
                            className="object-cover opacity-40"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-lnl-red/30 to-black" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
                </div>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "NewsArticle",
                            "headline": article.title,
                            "image": article.image ? [article.image] : [],
                            "datePublished": article.date,
                            "author": article.author ? [{
                                "@type": "Person",
                                "name": article.author
                            }] : [],
                            "description": article.description
                        })
                    }}
                />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-5xl mx-auto">
                    <Link href="/noticias" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver a Noticias
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        {article.category && (
                            <span className="px-3 py-1 bg-lnl-red text-white text-xs font-bold uppercase rounded">
                                {article.category}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tight leading-tight">
                        {article.title}
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-8 pb-6 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{article.date}</span>
                    </div>
                    {article.readTime && (
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{article.readTime} de lectura</span>
                        </div>
                    )}
                    {article.author && (
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            <span>{article.author}</span>
                        </div>
                    )}
                </div>

                {/* Article Body */}
                {article.content ? (
                    <article
                        className="mx-auto prose prose-xl prose-invert max-w-3xl
                        prose-p:text-gray-300 prose-p:leading-8 prose-p:mb-6
                        prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:text-white prose-headings:tracking-tight
                        prose-h1:text-4xl prose-h1:mb-8
                        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b-4 prose-h2:border-lnl-gold prose-h2:pb-2 prose-h2:inline-block
                        prose-h3:text-2xl prose-h3:mt-8 prose-h3:text-lnl-gold
                        prose-strong:text-lnl-gold prose-strong:font-black
                        prose-a:text-lnl-red prose-a:no-underline hover:prose-a:text-white hover:prose-a:underline prose-a:font-bold prose-a:transition-colors
                        prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                        prose-li:text-gray-300 prose-li:mb-2 marker:prose-li:text-lnl-red
                        prose-blockquote:border-l-4 prose-blockquote:border-lnl-red prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-xl prose-blockquote:text-white prose-blockquote:my-8 prose-blockquote:bg-zinc-900/50 prose-blockquote:p-6 prose-blockquote:rounded-r-lg
                        prose-img:rounded-xl prose-img:border-2 prose-img:border-zinc-800 prose-img:shadow-2xl prose-img:my-8 prose-img:w-full"
                        dangerouslySetInnerHTML={{ __html: article.content || "" }}
                    />
                ) : (
                    <div className="text-gray-300 text-lg leading-relaxed italic border-l-4 border-lnl-gold pl-6 py-2">
                        {article.description || "Contenido no disponible."}
                    </div>
                )}

                {/* Share */}
                <div className="mt-12 pt-8 border-t border-zinc-800">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400 font-bold uppercase text-sm flex items-center gap-2">
                            <Share2 className="w-4 h-4" /> Compartir:
                        </span>
                        <a href="#" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors">
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a href="#" className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-400 transition-colors">
                            <Twitter className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                {/* Related */}
                <div className="mt-12">
                    <h3 className="text-2xl font-black text-white uppercase italic mb-6">Más Noticias</h3>
                    <Link
                        href="/noticias"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-lnl-red text-white font-bold uppercase rounded hover:bg-red-600 transition-colors"
                    >
                        Ver todas las noticias
                    </Link>
                </div>
            </div>
        </div>
    );
}
