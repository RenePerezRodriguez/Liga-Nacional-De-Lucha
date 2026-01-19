import { NewsCard } from "@/components/news-card";
import { collection, getDocs, query, orderBy, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Newspaper } from "lucide-react";

interface NewsItem extends DocumentData {
    id: string;
    title: string;
    date: string;
    category?: string;
    description?: string;
    image?: string;
    slug?: string;
}

async function getNews() {
    const newsQuery = query(
        collection(db, "noticias"),
        orderBy("date", "desc")
    );
    const snap = await getDocs(newsQuery);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NewsItem[];
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewsPage() {
    const news = await getNews();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8 md:mb-12">
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4">
                    Últimas Noticias
                </h1>
                <p className="text-gray-400 max-w-xl text-sm md:text-base">
                    Entérate de todo lo que sucede dentro y fuera del ring. Resultados, anuncios y exclusivas.
                </p>
            </div>

            {news.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {news.map((item) => (
                        <NewsCard
                            key={item.id}
                            title={item.title}
                            excerpt={item.description || item.title}
                            date={item.date}
                            category={item.category}
                            slug={item.slug || item.id}
                            imageUrl={item.image}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <Newspaper className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No hay noticias publicadas.</p>
                    <p className="text-gray-600 text-sm mt-2">Vuelve pronto para las últimas novedades.</p>
                </div>
            )}
        </div>
    );
}
