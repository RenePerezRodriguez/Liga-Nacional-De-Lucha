"use client";

import { CheckCircle, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AcademyPage() {
    const handleWhatsAppJoin = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd gather the form data here.
        // For now, we'll just open the chat.
        window.open("https://wa.me/59176900000?text=Hola,%20quiero%20inscribirme%20a%20la%20academia%20LNL", "_blank");
    };

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
                        La Academia LNL es el único centro de alto rendimiento en Bolivia dedicado a formar la próxima generación de estrellas.
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

                    <div className="bg-white p-8 rounded-xl shadow-2xl text-left mb-8">
                        <div className="mb-6 border-b pb-6">
                            <h3 className="text-2xl font-bold text-black mb-2 uppercase">Información de Contacto</h3>
                            <p className="text-gray-600 flex flex-col md:flex-row gap-4">
                                <span><strong>Ciudad:</strong> Cochabamba, Bolivia</span>
                                <span><strong>Celular:</strong> +591 769-00000</span>
                            </p>
                        </div>

                        <form onSubmit={handleWhatsAppJoin} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                                    <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded focus:border-red-600 focus:outline-none text-black" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Edad</label>
                                    <input type="number" required className="w-full px-4 py-2 border border-gray-300 rounded focus:border-red-600 focus:outline-none text-black" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
                                <input type="email" required className="w-full px-4 py-2 border border-gray-300 rounded focus:border-red-600 focus:outline-none text-black" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">¿Por qué quieres ser luchador?</label>
                                <textarea className="w-full px-4 py-2 border border-gray-300 rounded focus:border-red-600 focus:outline-none text-black" rows={4}></textarea>
                            </div>
                            <button type="submit" className="w-full py-4 bg-green-600 text-white font-black uppercase tracking-wider rounded hover:bg-green-500 transition-colors flex items-center justify-center gap-3">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Enviar por WhatsApp
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                * Se abrirá tu aplicación de WhatsApp con un mensaje pre-cargado.
                            </p>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
