"use client";

import { useState } from "react";
import Image from "next/image";
import { Globe, Facebook, Twitter } from "lucide-react";

interface SeoPreviewProps {
    title: string;
    description: string;
    url: string;
    image?: string;
    siteName?: string;
}

export function SeoPreview({ title, description, url, image, siteName = "Liga Nacional de Lucha" }: SeoPreviewProps) {
    const [activeTab, setActiveTab] = useState<"google" | "facebook" | "twitter">("google");

    const truncate = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + "...";
    };

    const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-zinc-800">
                <TabButton
                    active={activeTab === "google"}
                    onClick={() => setActiveTab("google")}
                    icon={<Globe className="w-4 h-4" />}
                    label="Google"
                />
                <TabButton
                    active={activeTab === "facebook"}
                    onClick={() => setActiveTab("facebook")}
                    icon={<Facebook className="w-4 h-4" />}
                    label="Facebook"
                />
                <TabButton
                    active={activeTab === "twitter"}
                    onClick={() => setActiveTab("twitter")}
                    icon={<Twitter className="w-4 h-4" />}
                    label="Twitter/X"
                />
            </div>

            {/* Preview Content */}
            <div className="p-4">
                {activeTab === "google" && (
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center">
                                <Globe className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">{siteName}</p>
                                <p className="text-xs text-gray-500">{displayUrl}</p>
                            </div>
                        </div>
                        <h3 className="text-xl text-blue-400 hover:underline cursor-pointer mb-1">
                            {truncate(title || "Título de la noticia", 60)}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {truncate(description || "Descripción de la noticia que aparecerá en los resultados de búsqueda de Google.", 155)}
                        </p>
                    </div>
                )}

                {activeTab === "facebook" && (
                    <div className="max-w-lg border border-zinc-700 rounded-lg overflow-hidden bg-zinc-800">
                        {image ? (
                            <div className="relative w-full h-52 bg-zinc-700">
                                <Image src={image} alt="OG Image" fill className="object-cover" sizes="500px" />
                            </div>
                        ) : (
                            <div className="w-full h-52 bg-zinc-700 flex items-center justify-center text-gray-500">
                                Sin imagen
                            </div>
                        )}
                        <div className="p-3">
                            <p className="text-xs text-gray-500 uppercase">{displayUrl}</p>
                            <h3 className="text-white font-bold mt-1">
                                {truncate(title || "Título de la noticia", 60)}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                                {truncate(description || "Descripción de la noticia.", 80)}
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === "twitter" && (
                    <div className="max-w-lg border border-zinc-700 rounded-2xl overflow-hidden bg-zinc-800">
                        {image ? (
                            <div className="relative w-full h-48 bg-zinc-700">
                                <Image src={image} alt="Twitter Card" fill className="object-cover" sizes="500px" />
                            </div>
                        ) : (
                            <div className="w-full h-48 bg-zinc-700 flex items-center justify-center text-gray-500">
                                Sin imagen
                            </div>
                        )}
                        <div className="p-3">
                            <h3 className="text-white font-bold">
                                {truncate(title || "Título de la noticia", 60)}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                                {truncate(description || "Descripción de la noticia.", 100)}
                            </p>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <Globe className="w-3 h-3" /> {displayUrl}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function TabButton({
    active,
    onClick,
    icon,
    label
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${active
                    ? "text-white border-b-2 border-lnl-gold bg-zinc-800/50"
                    : "text-gray-500 hover:text-white hover:bg-zinc-800/30"
                }`}
        >
            {icon}
            {label}
        </button>
    );
}
