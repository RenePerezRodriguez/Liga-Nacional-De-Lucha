import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, Clock, Share2, Facebook, Twitter } from "lucide-react";

// Simulated news database
const newsData: Record<string, {
    title: string;
    excerpt: string;
    content: string;
    date: string;
    category: string;
    imageUrl?: string;
    author: string;
    readTime: string;
}> = {
    "resultados-caos-jaula": {
        title: "Resultados: Caos en la Jaula - Diciembre 2024",
        excerpt: "Una noche llena de sorpresas donde el campeonato máximo cambió de manos.",
        content: `
            <p>La noche del 2 de diciembre de 2024 quedará grabada en la historia de la Liga Nacional de Lucha como una de las más intensas y dramáticas que hayamos presenciado.</p>
            
            <h2>Evento Principal: Furia Roja vs El Sombra</h2>
            <p>En una brutal batalla dentro de la jaula de acero, El Sombra logró destronar a Furia Roja después de 45 minutos de combate despiadado. La victoria llegó tras un devastador Shadow Driver desde lo alto de la jaula.</p>
            
            <h2>Resultados Completos</h2>
            <ul>
                <li><strong>Campeonato Máximo:</strong> El Sombra def. Furia Roja (Jaula de Acero)</li>
                <li><strong>Campeonato en Parejas:</strong> Los Hermanos Destrucción retienen vs. Águila Dorada & Titán</li>
                <li><strong>Lucha Especial:</strong> La Máscara def. El Rayo en lucha de apuestas</li>
            </ul>
            
            <p>El nuevo campeón celebró su victoria proclamando que una nueva era de oscuridad ha comenzado en Bolivia.</p>
        `,
        date: "02 Dic, 2024",
        category: "Resultados",
        imageUrl: "/images/news/steel-cage.png",
        author: "Redacción LNL",
        readTime: "5 min"
    },
    "apertura-academia-2025": {
        title: "Gran Apertura de la Academia LNL 2025",
        excerpt: "La Liga Nacional de Lucha abre sus puertas para la nueva generación de talentos.",
        content: `
            <p>¡Es oficial! La Academia LNL abrirá sus puertas en enero de 2025 para formar a la próxima generación de estrellas de la lucha libre boliviana.</p>
            
            <h2>¿Qué ofrecemos?</h2>
            <ul>
                <li>Entrenamiento profesional con luchadores activos del roster</li>
                <li>Ring profesional con todas las medidas de seguridad</li>
                <li>Clases de técnica, acrobacia, y desarrollo de personaje</li>
                <li>Oportunidad de debut en eventos oficiales de la LNL</li>
            </ul>
            
            <h2>Requisitos</h2>
            <p>Buscamos personas mayores de 18 años con buena condición física y, sobre todo, pasión por la lucha libre. No se requiere experiencia previa.</p>
            
            <p>Las inscripciones ya están abiertas. ¡No pierdas la oportunidad de convertirte en leyenda!</p>
        `,
        date: "28 Nov, 2024",
        category: "Anuncio",
        imageUrl: "/images/news/wrestling-school.png",
        author: "Administración LNL",
        readTime: "3 min"
    },
    "entrevista-sombra": {
        title: "Entrevista Exclusiva: El Sombra rompe el silencio",
        excerpt: "El enigmático luchador habla por primera vez sobre su traición a Furia Roja.",
        content: `
            <p><em>"La oscuridad siempre triunfa sobre la furia ciega."</em></p>
            
            <p>En una entrevista exclusiva con la Liga Nacional de Lucha, El Sombra finalmente se sentó a hablar sobre los eventos que han sacudido el mundo de la lucha libre boliviana.</p>
            
            <h2>Sobre la traición</h2>
            <p>"No fue traición. Fue evolución. Furia Roja ya no era digno de la grandeza. Yo simplemente tomé lo que me correspondía por derecho."</p>
            
            <h2>Sus planes para 2025</h2>
            <p>"El campeonato es solo el comienzo. Mi objetivo es que cada luchador de esta liga tema pronunciar mi nombre. La era de las tinieblas apenas comienza."</p>
            
            <h2>Mensaje para los fans</h2>
            <p>"Pueden abuchearme todo lo que quieran. Al final del día, soy su campeón. Y eso no va a cambiar por mucho tiempo."</p>
        `,
        date: "25 Nov, 2024",
        category: "Entrevista",
        author: "Juan Carlos Mendoza",
        readTime: "4 min"
    },
    "alianza-gimnasio-hercules": {
        title: "Nueva alianza: LNL x Gimnasio Hércules",
        excerpt: "Anunciamos nuestra nueva sede de entrenamiento oficial.",
        content: `
            <p>La Liga Nacional de Lucha se enorgullece en anunciar una alianza estratégica con el prestigioso Gimnasio Hércules de Cochabamba.</p>
            
            <h2>Beneficios de la alianza</h2>
            <ul>
                <li>Instalaciones de primer nivel para entrenamiento</li>
                <li>Acceso exclusivo para estudiantes de la Academia LNL</li>
                <li>Equipamiento de preparación física profesional</li>
                <li>Ubicación céntrica y de fácil acceso</li>
            </ul>
            
            <h2>Palabras del propietario</h2>
            <p>"Es un honor para Gimnasio Hércules ser parte del crecimiento de la lucha libre en Bolivia. Estamos comprometidos con la excelencia deportiva."</p>
            
            <p>Esta alianza marca un nuevo capítulo en nuestra misión de profesionalizar la lucha libre boliviana.</p>
        `,
        date: "20 Nov, 2024",
        category: "Corporativo",
        author: "Redacción LNL",
        readTime: "2 min"
    }
};

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = newsData[slug];

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
                    {article.imageUrl ? (
                        <Image
                            src={article.imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover opacity-40"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-lnl-red/30 to-black" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-5xl mx-auto">
                    <Link href="/noticias" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver a Noticias
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="px-3 py-1 bg-lnl-red text-white text-xs font-bold uppercase rounded">
                            {article.category}
                        </span>
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
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{article.readTime} de lectura</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <span>{article.author}</span>
                    </div>
                </div>

                {/* Article Body */}
                <article
                    className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:text-white prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-white"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

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
