"use client";

import { useMemo } from "react";
import { Check, X, AlertCircle, Info } from "lucide-react";

interface SeoScoreProps {
    title: string;
    seoTitle: string;
    seoDescription: string;
    content: string;
    keywords: string;
    hasImage: boolean;
    slug: string;
}

interface SeoCheck {
    id: string;
    label: string;
    passed: boolean;
    message: string;
    weight: number;
}

export function SeoScore({ title, seoTitle, seoDescription, content, keywords, hasImage, slug }: SeoScoreProps) {
    const checks = useMemo<SeoCheck[]>(() => {
        const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
        const seoTitleLength = seoTitle.length || title.length;
        const seoDescLength = seoDescription.length;
        const keywordList = keywords.split(",").map(k => k.trim().toLowerCase()).filter(Boolean);
        const primaryKeyword = keywordList[0] || "";

        // Check for headings in content (HTML)
        const hasH2 = /<h2/i.test(content);
        const hasH3 = /<h3/i.test(content);
        const hasHeadings = hasH2 || hasH3;

        // Check for links
        const hasLinks = /<a\s/i.test(content);

        // Check for images
        const hasContentImages = /<img/i.test(content);

        // Slug validation
        const isSlugValid = /^[a-z0-9-]+$/.test(slug) && slug.length > 0;

        // Keyword in title
        const keywordInTitle = !!(primaryKeyword && (title.toLowerCase().includes(primaryKeyword) || seoTitle.toLowerCase().includes(primaryKeyword)));

        return [
            {
                id: "seo-title",
                label: "Título SEO",
                passed: seoTitleLength >= 30 && seoTitleLength <= 60,
                message: seoTitleLength < 30
                    ? `Muy corto (${seoTitleLength}/60). Añade más palabras.`
                    : seoTitleLength > 60
                        ? `Muy largo (${seoTitleLength}/60). Google lo cortará.`
                        : `Perfecto (${seoTitleLength}/60 caracteres)`,
                weight: 15
            },
            {
                id: "meta-desc",
                label: "Meta Descripción",
                passed: seoDescLength >= 120 && seoDescLength <= 155,
                message: seoDescLength < 120
                    ? `Muy corta (${seoDescLength}/155). Añade más detalles.`
                    : seoDescLength > 155
                        ? `Muy larga (${seoDescLength}/155). Se cortará en Google.`
                        : `Perfecto (${seoDescLength}/155 caracteres)`,
                weight: 15
            },
            {
                id: "keyword-title",
                label: "Palabra clave en título",
                passed: keywordInTitle,
                message: keywordInTitle
                    ? `"${primaryKeyword}" encontrada en el título`
                    : primaryKeyword
                        ? `"${primaryKeyword}" no está en el título`
                        : "Define una palabra clave",
                weight: 10
            },
            {
                id: "featured-image",
                label: "Imagen destacada",
                passed: hasImage,
                message: hasImage
                    ? "Imagen configurada correctamente"
                    : "Añade una imagen para redes sociales",
                weight: 10
            },
            {
                id: "content-length",
                label: "Longitud del contenido",
                passed: wordCount >= 300,
                message: wordCount < 300
                    ? `Solo ${wordCount} palabras. Mínimo recomendado: 300`
                    : `${wordCount} palabras - Buen contenido`,
                weight: 15
            },
            {
                id: "headings",
                label: "Encabezados (H2, H3)",
                passed: hasHeadings,
                message: hasHeadings
                    ? "El contenido tiene estructura con encabezados"
                    : "Añade encabezados para organizar el contenido",
                weight: 10
            },
            {
                id: "internal-links",
                label: "Enlaces",
                passed: hasLinks,
                message: hasLinks
                    ? "Contiene enlaces"
                    : "Añade enlaces a otras páginas o fuentes",
                weight: 10
            },
            {
                id: "content-images",
                label: "Imágenes en contenido",
                passed: hasContentImages || hasImage,
                message: hasContentImages || hasImage
                    ? "El contenido incluye imágenes"
                    : "Añade imágenes para hacer el contenido más visual",
                weight: 10
            },
            {
                id: "url-friendly",
                label: "URL amigable",
                passed: isSlugValid,
                message: isSlugValid
                    ? `Slug correcto: "${slug}"`
                    : "El slug debe ser letras, números y guiones",
                weight: 5
            }
        ];
    }, [title, seoTitle, seoDescription, content, keywords, hasImage, slug]);

    const totalScore = useMemo(() => {
        const maxScore = checks.reduce((acc, check) => acc + check.weight, 0);
        const earnedScore = checks.reduce((acc, check) => acc + (check.passed ? check.weight : 0), 0);
        return Math.round((earnedScore / maxScore) * 100);
    }, [checks]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500";
        if (score >= 50) return "text-yellow-500";
        return "text-red-500";
    };

    const getScoreBarColor = (score: number) => {
        if (score >= 80) return "bg-green-500";
        if (score >= 50) return "bg-yellow-500";
        return "bg-red-500";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Excelente";
        if (score >= 60) return "Bueno";
        if (score >= 40) return "Regular";
        return "Necesita mejorar";
    };

    const passedChecks = checks.filter(c => c.passed).length;
    const failedChecks = checks.filter(c => !c.passed);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Score Header */}
            <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                        <Info className="w-4 h-4 text-lnl-gold" /> Puntuación SEO
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className={`text-3xl font-black ${getScoreColor(totalScore)}`}>{totalScore}</span>
                        <span className="text-gray-500 text-sm">/100</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${getScoreBarColor(totalScore)} transition-all duration-500`}
                        style={{ width: `${totalScore}%` }}
                    />
                </div>

                <div className="flex justify-between items-center mt-2">
                    <span className={`text-sm font-bold ${getScoreColor(totalScore)}`}>
                        {getScoreLabel(totalScore)}
                    </span>
                    <span className="text-xs text-gray-500">
                        {passedChecks}/{checks.length} criterios cumplidos
                    </span>
                </div>
            </div>

            {/* Recommendations */}
            {failedChecks.length > 0 && (
                <div className="p-4 border-b border-zinc-800">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Recomendaciones
                    </h4>
                    <div className="space-y-2">
                        {failedChecks.map(check => (
                            <div key={check.id} className="flex items-start gap-2 text-sm">
                                <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-white font-medium">{check.label}:</span>{" "}
                                    <span className="text-gray-400">{check.message}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Checks */}
            <div className="p-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Detalle de análisis</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {checks.map(check => (
                        <div
                            key={check.id}
                            className={`flex items-center gap-2 text-xs p-2 rounded ${check.passed ? "bg-green-500/10" : "bg-red-500/10"
                                }`}
                        >
                            {check.passed ? (
                                <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                            ) : (
                                <X className="w-3 h-3 text-red-500 flex-shrink-0" />
                            )}
                            <span className={check.passed ? "text-gray-300" : "text-gray-400"}>
                                {check.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
