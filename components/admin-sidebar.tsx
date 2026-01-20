"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Users,
    Calendar,
    Newspaper,
    ShoppingBag,
    Settings,
    LogOut,
    Trophy,
    Image as ImageIcon,
    Menu,
    X,
    Youtube,
    Handshake,
    BarChart3,
    Swords,
    Film,
    Store,
    ChevronDown,
    HelpCircle,
    Ticket
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useUserRole } from "@/hooks/use-user-role";
import { useTour } from "@/components/admin/admin-tour";
import { sidebarTour } from "@/lib/tour-definitions";

// Menu organized by categories
const menuCategories = [
    {
        name: "Lucha Libre",
        icon: Swords,
        href: "/admin/lucha-libre",
        color: "text-lnl-red",
        bgColor: "bg-lnl-red/10",
        items: [
            { name: "Luchadores", href: "/admin/luchadores", icon: Users, roles: ["admin", "editor"] },
            { name: "Campeonatos", href: "/admin/campeonatos", icon: Trophy, roles: ["admin", "editor"] },
            { name: "Tag Teams", href: "/admin/tag-teams", icon: Users, roles: ["admin", "editor"] },
            { name: "Eventos", href: "/admin/eventos", icon: Calendar, roles: ["admin", "editor"] },
            { name: "Rankings", href: "/admin/ranking", icon: BarChart3, roles: ["admin", "editor"] },
        ]
    },
    {
        name: "Contenido",
        icon: Film,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        items: [
            { name: "Noticias", href: "/admin/noticias", icon: Newspaper, roles: ["admin", "editor"] },
            { name: "Galería", href: "/admin/galeria", icon: ImageIcon, roles: ["admin", "editor"] },
            { name: "Videos", href: "/admin/videos", icon: Youtube, roles: ["admin", "editor"] },
        ]
    },
    {
        name: "Comercio",
        icon: Store,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        items: [
            { name: "Tienda", href: "/admin/tienda", icon: ShoppingBag, roles: ["admin", "editor"] },
            { name: "Sponsors", href: "/admin/auspiciadores", icon: Handshake, roles: ["admin", "editor"] },
            { name: "Ringside", href: "/admin/ringside", icon: Ticket, roles: ["admin", "editor"] },
        ]
    },
    {
        name: "Sistema",
        icon: Settings,
        color: "text-gray-400",
        items: [
            { name: "Usuarios", href: "/admin/usuarios", icon: Users, roles: ["admin"] },
            { name: "Configuración", href: "/admin/configuracion", icon: Settings, roles: ["admin"] },
        ]
    }
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { role } = useUserRole();
    const [isOpen, setIsOpen] = useState(false);
    const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
    const { startTour, hasCompletedTour } = useTour();

    const toggleCategory = (categoryName: string) => {
        setCollapsedCategories(prev =>
            prev.includes(categoryName)
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        );
    };

    // Check if path is within a category
    const isInCategory = (category: typeof menuCategories[0]) => {
        if (category.href && (pathname === category.href || pathname.startsWith(category.href + "/"))) return true;
        return category.items.some(item => pathname === item.href || pathname.startsWith(item.href + "/"));
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/admin/login");
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-lnl-red rounded text-white shadow-lg"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`
                fixed md:sticky top-0 left-0 z-40 h-screen w-56 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
                    <div className="w-7 h-7 bg-lnl-red rounded flex items-center justify-center font-black text-white text-[10px]">
                        LNL
                    </div>
                    <span className="font-black text-white italic tracking-tighter text-lg">ADMIN</span>
                </div>

                {/* Navigation - Always expanded */}
                <nav className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {menuCategories.map((category) => {
                        const filteredItems = category.items.filter(item =>
                            role ? item.roles.includes(role) : false
                        );

                        if (filteredItems.length === 0) return null;

                        const CategoryIcon = category.icon;
                        const hasActiveItem = isInCategory(category);
                        const isCollapsed = collapsedCategories.includes(category.name);

                        return (
                            <div key={category.name} className="space-y-0.5" data-tour={`sidebar-${category.name.toLowerCase().replace(' ', '-')}`}>
                                {/* Category Header */}
                                <div className="flex items-center gap-1">
                                    {/* If category has href, make it a link */}
                                    {category.href ? (
                                        <Link
                                            href={category.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${pathname === category.href
                                                ? `${category.bgColor} ${category.color} border border-current/20`
                                                : hasActiveItem
                                                    ? `${category.color}`
                                                    : "text-gray-400 hover:text-white hover:bg-zinc-900"
                                                }`}
                                        >
                                            <CategoryIcon className="w-4 h-4" />
                                            {category.name}
                                        </Link>
                                    ) : (
                                        <span className={`flex-1 flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide ${hasActiveItem ? category.color : "text-gray-500"
                                            }`}>
                                            <CategoryIcon className="w-4 h-4" />
                                            {category.name}
                                        </span>
                                    )}

                                    {/* Collapse toggle */}
                                    <button
                                        onClick={() => toggleCategory(category.name)}
                                        className="p-1 text-gray-600 hover:text-gray-400"
                                    >
                                        <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                                    </button>
                                </div>

                                {/* Submenu items - Always visible unless collapsed */}
                                {!isCollapsed && (
                                    <div className="ml-3 pl-3 border-l border-zinc-800 space-y-0.5">
                                        {filteredItems.map((item) => {
                                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                            const Icon = item.icon;

                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium transition-all ${isActive
                                                        ? "bg-lnl-red text-white"
                                                        : "text-gray-400 hover:bg-zinc-900 hover:text-white"
                                                        }`}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {item.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-2 border-t border-zinc-800 space-y-1">
                    <button
                        onClick={() => startTour("sidebar", sidebarTour)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-bold uppercase tracking-wide text-lnl-gold hover:bg-lnl-gold/10 transition-colors"
                    >
                        <HelpCircle className="w-4 h-4" />
                        {hasCompletedTour("sidebar") ? "Ver Guía" : "¿Cómo funciona?"}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-bold uppercase tracking-wide text-gray-400 hover:bg-zinc-900 hover:text-red-500 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Salir
                    </button>
                </div>
            </aside>
        </>
    );
}
