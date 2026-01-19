"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Users,
    Trophy,
    Calendar,
    BarChart3,
    Swords,
    Check,
    ArrowRight,
    TrendingUp,
    Newspaper,
    Star
} from "lucide-react";

export default function LuchaLibreGuidePage() {
    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/lucha-libre" className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                        <Swords className="w-8 h-8 text-lnl-red" />
                        Guía del Sistema
                    </h1>
                    <p className="text-gray-400 text-sm">Cómo funciona el flujo completo de Lucha Libre</p>
                </div>
            </div>

            {/* Flow Diagram */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-black text-white uppercase mb-4">Flujo General</h2>
                <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                    <div className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg font-bold">
                        <Users className="w-4 h-4" /> Luchadores
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                    <div className="flex items-center gap-2 bg-lnl-gold/20 text-lnl-gold px-4 py-2 rounded-lg font-bold">
                        <Trophy className="w-4 h-4" /> Campeonatos
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                    <div className="flex items-center gap-2 bg-lnl-red/20 text-lnl-red px-4 py-2 rounded-lg font-bold">
                        <Calendar className="w-4 h-4" /> Eventos
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                    <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg font-bold">
                        <Check className="w-4 h-4" /> Resultados
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                    <div className="flex items-center gap-2 bg-purple-500/20 text-purple-400 px-4 py-2 rounded-lg font-bold">
                        <TrendingUp className="w-4 h-4" /> Rankings
                    </div>
                </div>
            </div>

            {/* Steps */}
            <div className="space-y-6">
                {/* Step 1: Wrestlers */}
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-400 font-black">1</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2 mb-2">
                                <Users className="w-5 h-5 text-blue-400" /> Registrar Luchadores
                            </h3>
                            <p className="text-gray-400 mb-4">
                                Primero, crea el roster de luchadores con todos sus datos: nombre, apodo, foto, biografía,
                                movimientos, estadísticas físicas, y redes sociales.
                            </p>
                            <div className="bg-black/30 rounded-lg p-4 text-sm space-y-2">
                                <p className="text-gray-300"><Check className="w-4 h-4 inline text-green-500 mr-2" />Cada luchador inicia con <strong className="text-white">1000 puntos ELO</strong></p>
                                <p className="text-gray-300"><Check className="w-4 h-4 inline text-green-500 mr-2" />Las estadísticas W-L empiezan en 0-0</p>
                                <p className="text-gray-300"><Check className="w-4 h-4 inline text-green-500 mr-2" />Se genera automáticamente un slug para la URL pública</p>
                            </div>
                            <Link href="/admin/luchadores" className="inline-flex items-center gap-2 mt-4 text-blue-400 hover:text-blue-300 font-bold text-sm">
                                Ir a Luchadores <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Step 2: Championships */}
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-lnl-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-lnl-gold font-black">2</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2 mb-2">
                                <Trophy className="w-5 h-5 text-lnl-gold" /> Crear Campeonatos
                            </h3>
                            <p className="text-gray-400 mb-4">
                                Define los títulos de tu liga. Puedes tener campeonatos masculinos, femeninos y de parejas.
                                Cada uno tiene su historial de reinados.
                            </p>
                            <div className="bg-black/30 rounded-lg p-4 text-sm space-y-2">
                                <p className="text-gray-300"><Check className="w-4 h-4 inline text-green-500 mr-2" />Subir imagen del cinturón</p>
                                <p className="text-gray-300"><Check className="w-4 h-4 inline text-green-500 mr-2" />Asignar campeón actual (opcional)</p>
                                <p className="text-gray-300"><Check className="w-4 h-4 inline text-green-500 mr-2" />El historial de reinados se genera automáticamente</p>
                            </div>
                            <Link href="/admin/campeonatos" className="inline-flex items-center gap-2 mt-4 text-lnl-gold hover:text-yellow-300 font-bold text-sm">
                                Ir a Campeonatos <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Step 3: Events */}
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-lnl-red/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-lnl-red font-black">3</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-lnl-red" /> Programar Eventos
                            </h3>
                            <p className="text-gray-400 mb-4">
                                Crea eventos con fecha, hora, y cartelera de luchas. Configura qué luchas son por campeonato
                                y cuál es el evento estelar.
                            </p>
                            <div className="bg-black/30 rounded-lg p-4 text-sm space-y-2">
                                <p className="text-gray-300"><Check className="w-4 h-4 inline text-green-500 mr-2" />Añadir luchas con luchadores del roster</p>
                                <p className="text-gray-300"><Check className="w-4 h-4 inline text-green-500 mr-2" />Marcar &quot;Lucha por Campeonato&quot; y seleccionar título</p>
                                <p className="text-gray-300"><Check className="w-4 h-4 inline text-green-500 mr-2" />Marcar evento estelar para más impacto en ranking</p>
                            </div>
                            <Link href="/admin/eventos" className="inline-flex items-center gap-2 mt-4 text-lnl-red hover:text-red-400 font-bold text-sm">
                                Ir a Eventos <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Step 4: Results */}
                <section className="bg-zinc-900 border border-lnl-gold/50 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-green-400 font-black">4</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2 mb-2">
                                <Check className="w-5 h-5 text-green-400" /> Registrar Resultados
                                <span className="text-xs bg-lnl-gold text-black px-2 py-0.5 rounded uppercase ml-2">Clave</span>
                            </h3>
                            <p className="text-gray-400 mb-4">
                                Después de cada show, registra los resultados. Este es el paso que activa toda la automatización.
                            </p>
                            <div className="bg-black/30 rounded-lg p-4 text-sm space-y-2">
                                <p className="text-gray-300"><Star className="w-4 h-4 inline text-lnl-gold mr-2" /><strong>Automático:</strong> Actualiza ELO de cada luchador</p>
                                <p className="text-gray-300"><Star className="w-4 h-4 inline text-lnl-gold mr-2" /><strong>Automático:</strong> Actualiza récord W-L</p>
                                <p className="text-gray-300"><Star className="w-4 h-4 inline text-lnl-gold mr-2" /><strong>Automático:</strong> Cambia campeón si pierde título</p>
                                <p className="text-gray-300"><Star className="w-4 h-4 inline text-lnl-gold mr-2" /><strong>Automático:</strong> Crea reinado en historial</p>
                                <p className="text-gray-300"><Star className="w-4 h-4 inline text-lnl-gold mr-2" /><strong>Automático:</strong> Genera noticia de nuevo campeón</p>
                                <p className="text-gray-300"><Star className="w-4 h-4 inline text-lnl-gold mr-2" /><strong>Automático:</strong> Guarda combate en historial</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step 5: Rankings */}
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-400 font-black">5</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2 mb-2">
                                <BarChart3 className="w-5 h-5 text-purple-400" /> Rankings Actualizados
                            </h3>
                            <p className="text-gray-400 mb-4">
                                Los rankings se calculan automáticamente usando el sistema ELO (similar a ajedrez/UFC).
                            </p>
                            <div className="bg-black/30 rounded-lg p-4 text-sm">
                                <p className="text-white font-bold mb-2">Sistema ELO:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-gray-300">Lucha Normal: <strong className="text-white">K=32</strong></p>
                                    <p className="text-gray-300">Evento Estelar: <strong className="text-white">K=40</strong></p>
                                    <p className="text-gray-300">Lucha por Título: <strong className="text-white">K=48</strong></p>
                                    <p className="text-gray-300">Inicio: <strong className="text-white">1000 pts</strong></p>
                                </div>
                                <hr className="border-zinc-700 my-3" />
                                <p className="text-gray-400 text-xs">
                                    Ganar contra alguien mejor rankeado = más puntos. Perder contra alguien peor rankeado = más puntos perdidos.
                                </p>
                            </div>
                            <Link href="/admin/ranking" className="inline-flex items-center gap-2 mt-4 text-purple-400 hover:text-purple-300 font-bold text-sm">
                                Ver Rankings <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Results */}
                <section className="bg-gradient-to-r from-lnl-red/20 to-transparent border border-lnl-red/30 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-lnl-red/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Newspaper className="w-5 h-5 text-lnl-red" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase mb-2">
                                Resultado Final
                            </h3>
                            <p className="text-gray-400 mb-4">
                                En las páginas públicas, los fans verán:
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <p className="text-white font-bold">Perfil del Luchador:</p>
                                    <ul className="text-gray-400 space-y-1">
                                        <li>• Récord W-L actualizado</li>
                                        <li>• Ranking ELO y tier</li>
                                        <li>• Historial de combates</li>
                                        <li>• Estadísticas avanzadas</li>
                                    </ul>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-white font-bold">Página de Campeonatos:</p>
                                    <ul className="text-gray-400 space-y-1">
                                        <li>• Campeón actual</li>
                                        <li>• Días de reinado</li>
                                        <li>• Número de defensas</li>
                                        <li>• Historial completo</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Back Button */}
            <div className="mt-8 text-center">
                <Link
                    href="/admin/lucha-libre"
                    className="inline-flex items-center gap-2 bg-lnl-red text-white px-6 py-3 rounded-lg font-bold uppercase hover:bg-red-700"
                >
                    <ArrowLeft className="w-5 h-5" /> Volver al Dashboard
                </Link>
            </div>
        </div>
    );
}
