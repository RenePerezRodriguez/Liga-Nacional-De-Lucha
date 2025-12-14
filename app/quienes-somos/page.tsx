import { Trophy, Users, Star, Target, Eye, GraduationCap } from "lucide-react";
import Link from "next/link";

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
                        La <span className="text-lnl-red font-bold">Liga Nacional de Lucha (LNL)</span> es una promoción boliviana de lucha libre profesional, fundada en mayo de 2024 por el <span className="text-lnl-gold">Lic. Erick Ulloa</span>. Nacemos con la visión de impulsar y dignificar la lucha libre en Bolivia, construyendo una identidad propia que combine espectáculo, deporte y narrativa.
                    </p>
                </div>
            </section>

            {/* About Content */}
            <section className="max-w-5xl mx-auto px-4 py-16">
                <div className="prose prose-invert prose-lg max-w-none">
                    <div className="bg-zinc-900/50 rounded-2xl p-8 md:p-12 border border-zinc-800 mb-12">
                        <h2 className="text-3xl font-black text-white uppercase italic mb-6 flex items-center gap-3">
                            <GraduationCap className="w-8 h-8 text-lnl-red" />
                            Nuestra Historia
                        </h2>
                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                            Nuestra liga está integrada por atletas formados con los más altos estándares en la academia <span className="text-lnl-gold font-bold">BKA</span>, quienes reciben preparación física, técnica y escénica de nivel profesional.
                        </p>
                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                            Su desempeño en el ring refleja nuestro compromiso con la excelencia, ofreciendo shows dinámicos, seguros y emocionantes en diferentes ciudades del país.
                        </p>
                        <p className="text-white text-xl font-bold italic border-l-4 border-lnl-red pl-6">
                            La LNL representa una nueva era para la lucha libre boliviana: más profesional, más competitiva y más conectada con el público.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Misión */}
                    <div className="bg-gradient-to-br from-lnl-red/20 to-transparent rounded-2xl p-8 border border-lnl-red/30 hover:border-lnl-red transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-lnl-red rounded-xl flex items-center justify-center">
                                <Target className="w-7 h-7 text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase italic">Misión</h2>
                        </div>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            Impulsar el desarrollo de la lucha libre en Bolivia mediante espectáculos profesionales, atletas de alto rendimiento y una identidad cultural propia. Buscamos ofrecer entretenimiento de calidad, fomentar el talento nacional y consolidar la lucha libre como un deporte–espectáculo de prestigio y proyección internacional.
                        </p>
                    </div>

                    {/* Visión */}
                    <div className="bg-gradient-to-br from-lnl-gold/20 to-transparent rounded-2xl p-8 border border-lnl-gold/30 hover:border-lnl-gold transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-lnl-gold rounded-xl flex items-center justify-center">
                                <Eye className="w-7 h-7 text-black" />
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase italic">Visión</h2>
                        </div>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            Convertirnos en la promoción de lucha libre líder en Bolivia y referente en Latinoamérica, reconocida por su calidad técnica, narrativa innovadora, formación de atletas de élite y capacidad de inspirar a nuevas generaciones. Aspiramos a construir un ecosistema deportivo y artístico sostenible que eleve el nombre de Bolivia en cada escenario.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter text-center mb-12">
                    Nuestros Valores
                </h2>
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

            {/* Academy CTA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-lnl-red to-red-900 rounded-2xl p-8 md:p-16 relative overflow-hidden">
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-white/70 font-bold uppercase tracking-widest text-sm">Academia BKA</span>
                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-6 mt-2">
                                Forma Parte de la Nueva Era
                            </h2>
                            <p className="text-white/90 text-lg mb-8">
                                Nuestros atletas son formados con los más altos estándares en la academia BKA, recibiendo preparación física, técnica y escénica de nivel profesional.
                            </p>
                            <ul className="space-y-3 mb-8 text-white/90 font-medium">
                                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-lnl-gold rounded-full" /> Preparación física de alto rendimiento</li>
                                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-lnl-gold rounded-full" /> Técnica profesional de lucha libre</li>
                                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-lnl-gold rounded-full" /> Desarrollo escénico y de personaje</li>
                            </ul>
                            <Link
                                href="/academia"
                                className="inline-block bg-white text-lnl-red font-bold uppercase tracking-wider py-3 px-8 rounded hover:bg-yellow-400 hover:text-black transition-colors"
                            >
                                Ir a la Academia
                            </Link>
                        </div>
                        {/* Visual element */}
                        <div className="hidden md:flex justify-center items-center">
                            <div className="w-64 h-64 border-4 border-white/20 rounded-full flex items-center justify-center">
                                <div className="w-48 h-48 border-4 border-lnl-gold rounded-full flex items-center justify-center">
                                    <GraduationCap className="w-24 h-24 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
