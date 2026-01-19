import { TourStep } from "@/components/admin/admin-tour";

// ========================================
// TOUR: PRODUCTOS
// ========================================
export const productFormTour: TourStep[] = [
    {
        target: "[data-tour='product-name']",
        title: "Nombre del Producto",
        content: "Ingresa un nombre descriptivo para tu producto. Este será el título que verán los clientes.",
        placement: "bottom"
    },
    {
        target: "[data-tour='product-slug']",
        title: "URL Amigable",
        content: "El slug se genera automáticamente. Es la parte de la URL que identifica este producto (ej: /tienda/polera-lnl-2024).",
        placement: "bottom"
    },
    {
        target: "[data-tour='product-price']",
        title: "Precio",
        content: "Establece el precio en Bolivianos (Bs.). Los clientes verán este precio en la tienda.",
        placement: "bottom"
    },
    {
        target: "[data-tour='product-description']",
        title: "Descripción",
        content: "Describe el producto de forma atractiva. Incluye materiales, cuidados y cualquier detalle importante.",
        placement: "top"
    },
    {
        target: "[data-tour='product-category']",
        title: "Categoría",
        content: "Selecciona la categoría que mejor describe tu producto. Esto ayuda a organizar la tienda.",
        placement: "right"
    },
    {
        target: "[data-tour='product-status']",
        title: "Estado del Producto",
        content: "Indica si está disponible, en preventa o agotado. Los productos agotados no permiten compra.",
        placement: "right"
    },
    {
        target: "[data-tour='product-sizes']",
        title: "Tallas (Opcional)",
        content: "Si es ropa, añade las tallas disponibles. El cliente podrá seleccionar su talla al comprar.",
        placement: "top"
    },
    {
        target: "[data-tour='product-features']",
        title: "Características",
        content: "Lista las características principales: material, calidad, edición limitada, etc.",
        placement: "top"
    },
    {
        target: "[data-tour='product-image']",
        title: "Imagen del Producto",
        content: "Sube una foto de alta calidad. Puedes usar la IA para quitar el fondo automáticamente.",
        placement: "left"
    }
];

// ========================================
// TOUR: LUCHADORES
// ========================================
export const wrestlerFormTour: TourStep[] = [
    {
        target: "[data-tour='wrestler-name']",
        title: "Nombre del Luchador",
        content: "El nombre artístico o ring name del luchador. Será visible en el roster público.",
        placement: "bottom"
    },
    {
        target: "[data-tour='wrestler-nickname']",
        title: "Apodo",
        content: "El apodo épico o catchphrase (ej: 'El Rey de las Tinieblas', 'La Bestia de Cochabamba').",
        placement: "bottom"
    },
    {
        target: "[data-tour='wrestler-alignment']",
        title: "Alineación",
        content: "Face = Técnico/Bueno, Heel = Rudo/Malo. Esto afecta cómo se muestra en el sitio.",
        placement: "bottom"
    },
    {
        target: "[data-tour='wrestler-weight']",
        title: "Peso y Altura",
        content: "Datos físicos del luchador para las estadísticas oficiales.",
        placement: "bottom"
    },
    {
        target: "[data-tour='wrestler-bio']",
        title: "Biografía",
        content: "Historia del personaje, origen, motivaciones. Hazlo épico y en kayfabe.",
        placement: "top"
    },
    {
        target: "[data-tour='wrestler-photo']",
        title: "Foto Oficial",
        content: "Sube la foto de prensa del luchador. Fondo oscuro recomendado.",
        placement: "left"
    }
];

// ========================================
// TOUR: EVENTOS
// ========================================
export const eventFormTour: TourStep[] = [
    {
        target: "[data-tour='event-title']",
        title: "Nombre del Evento",
        content: "El nombre épico del show (ej: 'REVOLUCIÓN: Noche de Campeones').",
        placement: "bottom"
    },
    {
        target: "[data-tour='event-date']",
        title: "Fecha y Hora",
        content: "Cuándo será el evento. Esta información se muestra en el calendario público.",
        placement: "bottom"
    },
    {
        target: "[data-tour='event-location']",
        title: "Ubicación",
        content: "El venue o coliseo donde se realizará el evento.",
        placement: "bottom"
    },
    {
        target: "[data-tour='event-featured']",
        title: "Evento Destacado",
        content: "Actívalo para que aparezca como HERO en la página principal.",
        placement: "bottom"
    },
    {
        target: "[data-tour='event-matches']",
        title: "Cartelera de Luchas",
        content: "Añade las luchas programadas. Puedes marcar cuáles son por títulos.",
        placement: "top"
    },
    {
        target: "[data-tour='event-prices']",
        title: "Precios de Entradas",
        content: "Define los precios por zona: General, VIP, Ringside.",
        placement: "top"
    }
];

// ========================================
// TOUR: NOTICIAS
// ========================================
export const newsFormTour: TourStep[] = [
    {
        target: "[data-tour='news-title']",
        title: "Título de la Noticia",
        content: "Un título impactante que capture la atención. SEO se genera automáticamente.",
        placement: "bottom"
    },
    {
        target: "[data-tour='news-category']",
        title: "Categoría",
        content: "Clasifica la noticia: Resultados, Backstage, Anuncios, etc.",
        placement: "bottom"
    },
    {
        target: "[data-tour='news-content']",
        title: "Contenido",
        content: "Usa el editor rico para formatear texto, añadir imágenes y videos embebidos.",
        placement: "top"
    },
    {
        target: "[data-tour='news-image']",
        title: "Imagen Principal",
        content: "La imagen que aparecerá como portada de la noticia.",
        placement: "left"
    },
    {
        target: "[data-tour='news-seo']",
        title: "SEO",
        content: "El extracto, palabras clave y meta descripción se generan automáticamente.",
        placement: "top"
    }
];

// ========================================
// TOUR: VIDEOS
// ========================================
export const videoFormTour: TourStep[] = [
    {
        target: "[data-tour='video-url']",
        title: "URL de YouTube",
        content: "Pega el link del video. El título se obtiene automáticamente de YouTube.",
        placement: "bottom"
    },
    {
        target: "[data-tour='video-title']",
        title: "Título",
        content: "Se llena automáticamente pero puedes editarlo si quieres personalizarlo.",
        placement: "bottom"
    },
    {
        target: "[data-tour='video-category']",
        title: "Categoría",
        content: "Clasifica el video: Lucha Completa, Highlights, Backstage, Entrevista.",
        placement: "bottom"
    }
];

// ========================================
// TOUR: CAMPEONATOS
// ========================================
export const championshipFormTour: TourStep[] = [
    {
        target: "[data-tour='championship-name']",
        title: "Nombre del Título",
        content: "El nombre oficial del campeonato (ej: 'Campeonato Mundial LNL').",
        placement: "bottom"
    },
    {
        target: "[data-tour='championship-division']",
        title: "División",
        content: "Masculino, Femenino o Parejas. Determina quién puede competir por este título.",
        placement: "bottom"
    },
    {
        target: "[data-tour='championship-champion']",
        title: "Campeón Actual",
        content: "Selecciona el luchador o equipo que actualmente posee el título.",
        placement: "bottom"
    },
    {
        target: "[data-tour='championship-image']",
        title: "Imagen del Cinturón",
        content: "Una foto del cinturón o título físico.",
        placement: "left"
    }
];

// ========================================
// TOUR: GALERÍA
// ========================================
export const galleryFormTour: TourStep[] = [
    {
        target: "[data-tour='gallery-title']",
        title: "Título de la Imagen",
        content: "Describe qué muestra la foto (ej: 'El Sombra vs Thunder en LNL 15').",
        placement: "bottom"
    },
    {
        target: "[data-tour='gallery-event']",
        title: "Evento",
        content: "Asocia la foto a un evento para organizarla mejor.",
        placement: "bottom"
    },
    {
        target: "[data-tour='gallery-image']",
        title: "Imagen",
        content: "Sube la foto. Se comprimirá automáticamente para web.",
        placement: "left"
    }
];

// ========================================
// TOUR: SIDEBAR (NAVEGACIÓN GENERAL)
// ========================================
export const sidebarTour: TourStep[] = [
    {
        target: "[data-tour='sidebar-lucha-libre']",
        title: "Lucha Libre",
        content: "Aquí gestionas todo lo relacionado con el deporte: luchadores, campeonatos, eventos y rankings.",
        placement: "right"
    },
    {
        target: "[data-tour='sidebar-contenido']",
        title: "Contenido",
        content: "Gestiona el contenido multimedia: noticias, galería de fotos y videos de YouTube.",
        placement: "right"
    },
    {
        target: "[data-tour='sidebar-comercio']",
        title: "Comercio",
        content: "Administra la tienda de productos y los auspiciadores/patrocinadores.",
        placement: "right"
    },
    {
        target: "[data-tour='sidebar-sistema']",
        title: "Sistema",
        content: "Configuración global del sitio: números de WhatsApp, redes sociales, etc.",
        placement: "right"
    }
];

// ========================================
// TOUR: AUSPICIADORES
// ========================================
export const sponsorFormTour: TourStep[] = [
    {
        target: "[data-tour='sponsor-logo']",
        title: "Logo del Auspiciador",
        content: "Sube el logo de la empresa o marca. Se mostrará en la sección de sponsors del sitio.",
        placement: "bottom"
    },
    {
        target: "[data-tour='sponsor-name']",
        title: "Nombre",
        content: "El nombre de la empresa o marca auspiciadora.",
        placement: "bottom"
    },
    {
        target: "[data-tour='sponsor-type']",
        title: "Tipo de Patrocinio",
        content: "Categoriza el nivel de patrocinio: Principal, Partner, Media Partner o Colaborador.",
        placement: "bottom"
    },
    {
        target: "[data-tour='sponsor-website']",
        title: "Sitio Web",
        content: "URL del sitio web del auspiciador. Los usuarios podrán visitarlo desde la página.",
        placement: "bottom"
    }
];
