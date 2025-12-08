import { Trophy, Users, Star } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="pb-20">
            {/* Hero Section */}
            <section className="relative py-20 bg-lnl-gray border-b border-zinc-800">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-6">
                        Quiénes Somos
                    </h1>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        La <span className="text-lnl-red font-bold">Liga Nacional de Lucha (LNL)</span> es la organización de lucha libre profesional más grande y prestigiosa de Cochabamba, Bolivia. Fundada con la misión de revitalizar el deporte-espectáculo en la región, LNL combina atletismo de alto nivel, narrativa envolvente y una producción de calidad internacional.
                    </p>
                </div>
            </section>

            {/* Values Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 text-center hover:border-lnl-gold transition-colors group">
                        <div className="w-16 h-16 bg-lnl-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-lnl-gold/20">
                            <Trophy className="w-8 h-8 text-lnl-gold" />
                        </div>
                        <h3 className="text-2xl font-bold text-white uppercase italic mb-3">Excelencia</h3>
                        <p className="text-gray-400">
                            Buscamos la perfección en cada llave, en cada evento y en cada historia que contamos sobre el ring.
                        </p>
                    </div>
                    <div className="bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 text-center hover:border-lnl-red transition-colors group">
                        <div className="w-16 h-16 bg-lnl-red/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-lnl-red/20">
                            <Users className="w-8 h-8 text-lnl-red" />
                        </div>
                        <h3 className="text-2xl font-bold text-white uppercase italic mb-3">Comunidad</h3>
                        <p className="text-gray-400">
                            No solo somos una liga, somos una familia. Luchadores y fanáticos unidos por una misma pasión.
                        </p>
                    </div>
                    <div className="bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 text-center hover:border-white transition-colors group">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20">
                            <Star className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white uppercase italic mb-3">Espectáculo</h3>
                        <p className="text-gray-400">
                            Luces, sonido, acción. Llevamos el entretenimiento deportivo al siguiente nivel en Bolivia.
                        </p>
                    </div>
                </div>
            </section>

            {/* Academy Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-lnl-red to-red-900 rounded-2xl p-8 md:p-16 relative overflow-hidden">
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-6">
                                La Academia LNL
                            </h2>
                            <p className="text-white/90 text-lg mb-8">
                                ¿Sueñas con subir al cuadrilátero? Nuestra escuela de lucha libre profesional forma a las estrellas del mañana. Entrenamiento físico, técnico y psicológico con instructores veteranos.
                            </p>
                            <ul className="space-y-3 mb-8 text-white/90 font-medium">
                                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-lnl-gold rounded-full" /> Acondicionamiento físico extremo</li>
                                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-lnl-gold rounded-full" /> Llaveo y contrallaveo (Chain Wrestling)</li>
                                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-lnl-gold rounded-full" /> Psicología del ring y manejo de micrófono</li>
                            </ul>
                            <button className="bg-white text-lnl-red font-bold uppercase tracking-wider py-3 px-8 rounded hover:bg-gray-100 transition-colors">
                                Más Información
                            </button>
                        </div>
                        {/* Visual element placeholder for Academy */}
                        <div className="hidden md:flex justify-center items-center">
                            <div className="w-64 h-64 border-4 border-white/20 rounded-full flex items-center justify-center animate-spin-slow">
                                <div className="w-48 h-48 border-4 border-lnl-gold rounded-full flex items-center justify-center">
                                    <Star className="w-24 h-24 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
