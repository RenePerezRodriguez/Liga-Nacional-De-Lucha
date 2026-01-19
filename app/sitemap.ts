import { MetadataRoute } from 'next';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const BASE_URL = 'https://luchalibrebolivia.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch wrestlers from Firebase
    const wrestlersSnap = await getDocs(query(collection(db, "luchadores"), orderBy("name")));
    const wrestlers = wrestlersSnap.docs.map(doc => ({
        url: `${BASE_URL}/luchadores/${doc.data().slug || doc.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Fetch news from Firebase
    const newsSnap = await getDocs(query(collection(db, "noticias"), orderBy("date", "desc")));
    const news = newsSnap.docs.map(doc => ({
        url: `${BASE_URL}/noticias/${doc.data().slug || doc.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    // Fetch events from Firebase
    const eventsSnap = await getDocs(query(collection(db, "eventos"), orderBy("date", "desc")));
    const events = eventsSnap.docs.map(doc => ({
        url: `${BASE_URL}/eventos/${doc.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${BASE_URL}/luchadores`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/noticias`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/eventos`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/tienda`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/galeria`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/quienes-somos`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...wrestlers,
        ...news,
        ...events,
    ];
}
