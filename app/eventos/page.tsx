import { EventCard } from "@/components/event-card";
import { TaleOfTheTape } from "@/components/tale-of-the-tape";
import { Calendar, Sword } from "lucide-react";

export default function EventsPage() {
    return (
        <div className="pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8 md:mb-12">
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4 flex items-center gap-2 md:gap-4">
                        <Calendar className="w-8 h-8 md:w-12 md:h-12 text-lnl-red" />
                        Calendario
                    </h1>
                    <p className="text-gray-400 max-w-xl text-sm md:text-base">
                        No te pierdas ningún evento. Consulta las próximas fechas y asegura tu lugar en la historia.
                    </p>
                </div>
            </div>

            {/* Featured Match Preview (Tale of the Tape) */}
            <section className="mb-20">
                <div className="max-w-7xl mx-auto px-4 mb-4 flex items-center gap-2">
                    <Sword className="text-lnl-gold w-6 h-6" />
                    <h2 className="text-2xl font-black uppercase italic text-white">Evento Estelar: Guerra del Valle</h2>
                </div>
                <TaleOfTheTape
                    fighter1={{
                        name: "Furia Roja",
                        nickname: "La Máquina de Dolor",
                        height: "1.85m",
                        weight: "110kg",
                        finisher: "Powerbomb Infernal",
                        image: "/images/roster/furia-roja.png",
                        alignment: "heel"
                    }}
                    fighter2={{
                        name: "Águila Dorada",
                        nickname: "El Vuelo de la Victoria",
                        height: "1.75m",
                        weight: "85kg",
                        finisher: "450 Splash",
                        image: "/images/roster/aguila-dorada.png",
                        alignment: "face"
                    }}
                />
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <EventCard
                        title="Guerra del Valle: Invasión"
                        date="15 Dic, 2024"
                        time="18:30"
                        location="Coliseo Pittsburg, Cochabamba"
                        isFeatured={true}
                        imageUrl="/images/events/guerra-del-valle.png"
                    />
                    <EventCard
                        title="Noche de Campeones"
                        date="22 Dic, 2024"
                        time="19:00"
                        location="Coliseo de la Coronilla"
                        imageUrl="/images/events/noche-de-campeones.png"
                    />
                    <EventCard
                        title="Reyes del Ring 2025"
                        date="05 Ene, 2025"
                        time="16:00"
                        location="Coliseo Pittsburg"
                    />
                    <EventCard
                        title="Venganza"
                        date="12 Ene, 2025"
                        time="18:30"
                        location="Coliseo de la Coronilla"
                    />
                </div>
            </div>
        </div>
    );
}
