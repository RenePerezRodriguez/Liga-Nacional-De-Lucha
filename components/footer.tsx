import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Trophy, Youtube } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-lnl-dark border-t border-lnl-gray pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative w-10 h-10">
                                <Image
                                    src="/images/logos/LNL-Logotipo.png"
                                    alt="LNL Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="font-bold text-lg tracking-tighter text-white uppercase">
                                Liga Nacional de Lucha
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm max-w-sm mb-6">
                            El epicentro de la lucha libre profesional en Cochabamba.
                            Pasión, adrenalina y espectáculo puro.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://www.facebook.com/profile.php?id=61559310413691" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-lnl-blue transition-colors">
                                <Facebook className="h-6 w-6" />
                            </a>
                            <a href="https://www.tiktok.com/@liganacionalde.lucha" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-lnl-pink transition-colors">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-6 w-6"
                                >
                                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                </svg>
                            </a>
                            <Link href="#" className="text-gray-400 hover:text-lnl-red transition-colors">
                                <Youtube className="h-6 w-6" />
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-purple-500 transition-colors">
                                <Instagram className="h-6 w-6" />
                            </Link>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-white font-bold uppercase tracking-wider mb-4 border-b border-lnl-red pb-2 inline-block">
                            Navegación
                        </h3>
                        <ul className="space-y-2">
                            <li><Link href="/eventos" className="text-gray-400 hover:text-lnl-gold text-sm transition-colors">Próximos Eventos</Link></li>
                            <li><Link href="/luchadores" className="text-gray-400 hover:text-lnl-gold text-sm transition-colors">Roster</Link></li>
                            <li><Link href="/ranking" className="text-gray-400 hover:text-lnl-gold text-sm transition-colors">Ranking Oficial</Link></li>
                            <li><Link href="/resultados" className="text-gray-400 hover:text-lnl-gold text-sm transition-colors">Resultados</Link></li>
                            <li><Link href="/galeria" className="text-gray-400 hover:text-lnl-gold text-sm transition-colors">Galería Multimedia</Link></li>
                            <li><Link href="/tienda" className="text-gray-400 hover:text-lnl-gold text-sm transition-colors">Tienda Oficial</Link></li>
                            <li><Link href="/academia" className="text-gray-400 hover:text-lnl-gold text-sm transition-colors">La Academia</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-bold uppercase tracking-wider mb-4 border-b border-lnl-red pb-2 inline-block">
                            Contacto
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>Cochabamba, Bolivia</li>
                            <li>info@lnl-cochabamba.com</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-lnl-gray pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-xs">
                        © {new Date().getFullYear()} Liga Nacional de Lucha. Todos los derechos reservados.
                    </p>
                    <p className="text-gray-600 text-xs mt-2 md:mt-0">
                        Diseñado y desarrollado por <a href="https://DesarrolloWebBolivia.com" target="_blank" rel="noopener noreferrer" className="hover:text-lnl-red transition-colors">DesarrolloWebBolivia.com</a> & <a href="https://SafeSoft.tech" target="_blank" rel="noopener noreferrer" className="hover:text-lnl-blue transition-colors">SafeSoft.tech</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
