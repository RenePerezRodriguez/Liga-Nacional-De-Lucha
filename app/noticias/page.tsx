import { NewsCard } from "@/components/news-card";

export default function NewsPage() {
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <NewsCard
                    title="Resultados: Caos en la Jaula - Diciembre 2024"
                    excerpt="Una noche llena de sorpresas donde el campeonato máximo cambió de manos en una lucha sangrienta dentro de la jaula de acero."
                    date="02 Dic, 2024"
                    category="Resultados"
                    slug="resultados-caos-jaula"
                    imageUrl="/images/news/steel-cage.png"
                />
                <NewsCard
                    title="Gran Apertura de la Academia LNL 2025"
                    excerpt="La Liga Nacional de Lucha abre sus puertas para la nueva generación de talentos. ¡Inscríbete hoy y conviértete en una leyenda!"
                    date="28 Nov, 2024"
                    category="Anuncio"
                    slug="apertura-academia-2025"
                    imageUrl="/images/news/wrestling-school.png"
                />
                <NewsCard
                    title="Entrevista Exclusiva: El Sombra rompe el silencio"
                    excerpt="El enigmático luchador habla por primera vez sobre su traición a Furia Roja y sus planes dominantes para el próximo año."
                    date="25 Nov, 2024"
                    category="Entrevista"
                    slug="entrevista-sombra"
                />
                <NewsCard
                    title="Nueva alianza: LNL x Gimnasio Hércules"
                    excerpt="Anunciamos nuestra nueva sede de entrenamiento oficial. Mejores instalaciones para preparar a las futuras estrellas."
                    date="20 Nov, 2024"
                    category="Corporativo"
                    slug="alianza-gimnasio-hercules"
                />
            </div>
        </div>
    );
}
