import { CheckCircle, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AcademyPage() {
    return (
        <div className="min-h-screen bg-black">
            {/* Hero */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-zinc-900">
                    {/* Background Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-r from-lnl-red/80 to-black/80 z-10" />
                    <Image
                        src="/images/news/wrestling-school.png"
                        alt="Academy Training"
                        fill
                        className="object-cover opacity-50"
                    />
                </div>

                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter mb-4 md:mb-6 leading-none">
                        Crea tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Legado</span>
                    </h1>
                    <p className="text-base sm:text-xl text-gray-200 mb-6 md:mb-8 max-w-2xl mx-auto">
                        La Academia LNL es el único centro de alto rendimiento en Cochabamba dedicado a formar la próxima generación de estrellas de la lucha libre.
                    </p>
                    <Link
                        href="#inscripcion"
                        className="px-6 py-3 md:px-8 md:py-4 bg-white text-black font-black uppercase tracking-wider rounded hover:bg-yellow-400 transition-colors text-sm md:text-base"
                    >
                        Inscribirme Ahora
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-zinc-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-lnl-red rounded-full flex items-center justify-center mx-auto mb-6">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic mb-4">Entrenamiento Profesional</h3>
                            <p className="text-gray-400">Aprende técnicas de llaveo, caídas, psicología del ring y manejo de cuerdas con instructores veteranos.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-lnl-red rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic mb-4">Seguridad Primero</h3>
                            <p className="text-gray-400">Instalaciones equipadas con rings profesionales y colchonetas de absorción de impacto para minimizar riesgos.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-lnl-red rounded-full flex items-center justify-center mx-auto mb-6">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic mb-4">Desarrollo de Personaje</h3>
                            <p className="text-gray-400">No solo creamos luchadores, creamos estrellas. Te ayudamos a desarrollar tu gimmick y habilidades de micrófono.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section id="inscripcion" className="py-20 bg-lnl-red">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-black text-white uppercase italic mb-8">Comienza tu viaje</h2>
                    <form className="bg-white p-8 rounded-xl shadow-2xl space-y-4 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded focus:border-lnl-red focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Edad</label>
                                <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded focus:border-lnl-red focus:outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
                            <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded focus:border-lnl-red focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">¿Por qué quieres ser luchador?</label>
                            <textarea className="w-full px-4 py-2 border border-gray-300 rounded focus:border-lnl-red focus:outline-none" rows={4}></textarea>
                        </div>
                        <button type="submit" className="w-full py-4 bg-black text-white font-black uppercase tracking-wider rounded hover:bg-zinc-800 transition-colors">
                            Enviar Solicitud
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
