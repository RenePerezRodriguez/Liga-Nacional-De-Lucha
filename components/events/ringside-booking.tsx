"use client";

import { useState } from "react";
import { RingsideMap, SeatStatus } from "@/components/events/ringside-map";
import { MessageCircle, X, ShoppingCart, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidePricing {
    alias: string;
    rowA: number;
    rowB: number;
    rowC: number;
}

interface RingsidePrices {
    north: SidePricing;
    south: SidePricing;
    west: SidePricing;
}

interface EventSeatingData {
    enabled: boolean;
    seats: Record<string, SeatStatus>;
}

interface RingsideBookingProps {
    eventId: string;
    eventTitle: string;
    seatingData?: EventSeatingData;
    ringsidePrices?: RingsidePrices;
    whatsappNumber?: string;
}

const DEFAULT_PRICES: RingsidePrices = {
    north: { alias: "Lado Norte", rowA: 100, rowB: 80, rowC: 60 },
    south: { alias: "Lado Sur", rowA: 100, rowB: 80, rowC: 60 },
    west: { alias: "Lado Oeste", rowA: 100, rowB: 80, rowC: 60 },
};

export function RingsideBooking({ eventTitle, seatingData, ringsidePrices, whatsappNumber = "59176402369" }: RingsideBookingProps) {
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

    // Use provided prices or defaults
    const prices = ringsidePrices || DEFAULT_PRICES;

    // If seating is not enabled or data missing, show WhatsApp contact message
    if (!seatingData?.enabled) {
        return (
            <div className="p-8 md:p-12 text-center bg-zinc-950">
                <Info className="w-16 h-16 text-zinc-700 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-white uppercase italic mb-3">
                    Venta de Ringside No Disponible Online
                </h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    La venta de entradas numeradas para este evento se realiza únicamente en boletería o contactando directamente con nuestro equipo.
                </p>

                <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola LNL, quiero información sobre entradas Ringside para ${eventTitle}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-green-900/50 uppercase tracking-widest"
                >
                    <MessageCircle className="w-6 h-6" />
                    Consultar por WhatsApp
                </a>
            </div>
        );
    }

    const handleSeatClick = (seatId: string, status: SeatStatus) => {
        // Only allow selecting available seats in public mode
        if (status !== "available" && !selectedSeats.includes(seatId)) return;

        setSelectedSeats(prev => {
            if (prev.includes(seatId)) {
                return prev.filter(id => id !== seatId);
            } else {
                return [...prev, seatId];
            }
        });
    };

    const getSeatDetails = (seatId: string) => {
        const [sideKey, row, col] = seatId.split("-");
        let sideName = "";
        let price = 0;

        // Map row letter to price key
        const rowPriceKey = row === "A" ? "rowA" : row === "B" ? "rowB" : "rowC";

        if (sideKey === "N") {
            sideName = prices.north.alias;
            price = prices.north[rowPriceKey];
        } else if (sideKey === "S") {
            sideName = prices.south.alias;
            price = prices.south[rowPriceKey];
        } else if (sideKey === "O") {
            sideName = prices.west.alias;
            price = prices.west[rowPriceKey];
        }

        return { sideName, row, col, price };
    };

    const totalPrice = selectedSeats.reduce((acc, seatId) => {
        return acc + getSeatDetails(seatId).price;
    }, 0);

    const generateWhatsappLink = () => {
        const lines = selectedSeats.map(id => {
            const { sideName, row, col, price } = getSeatDetails(id);
            return `• Lado ${sideName} - Fila ${row} - Asiento ${col} (Bs${price})`;
        });

        const message = `Hola LNL, quisiera *reservar* entradas Ringside para *${eventTitle}*:\n\n${lines.join("\n")}\n\n*Total: Bs${totalPrice}*\n\nEspero confirmación.`;
        return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    };

    // Merge selected seats with existing seat data for display
    const displaySeats: Record<string, SeatStatus> = { ...seatingData.seats };
    selectedSeats.forEach(id => {
        if (!displaySeats[id] || displaySeats[id] === "available") {
            displaySeats[id] = "selected";
        }
    });

    return (
        <div className="flex flex-col">
            {/* Map Area */}
            <div className="w-full">
                <RingsideMap
                    mode="public"
                    seats={displaySeats}
                    onSeatClick={handleSeatClick}
                    selectedSeats={selectedSeats}
                />
            </div>

            {/* Selection Panel - Below map */}
            <div className="w-full bg-zinc-900 border-t border-zinc-800 p-4 sm:p-6">
                <div className="max-w-2xl mx-auto space-y-4">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-lnl-gold" />
                            <span className="text-white font-bold uppercase text-sm">
                                Tu Selección ({selectedSeats.length})
                            </span>
                        </div>
                        {selectedSeats.length > 0 && (
                            <button
                                onClick={() => setSelectedSeats([])}
                                className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                            >
                                Limpiar todo
                            </button>
                        )}
                    </div>

                    {/* Seats List */}
                    {selectedSeats.length === 0 ? (
                        <div className="text-center py-6 text-gray-600 text-sm italic border border-dashed border-zinc-700 rounded-lg">
                            Selecciona asientos en el mapa para continuar
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                            {selectedSeats.map(id => {
                                const { sideName, row, col, price } = getSeatDetails(id);
                                return (
                                    <div
                                        key={id}
                                        className="bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg flex items-center justify-between gap-2"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-white text-xs font-bold">{sideName} {row}-{col}</span>
                                            <span className="text-lnl-gold text-[10px] font-bold">Bs{price}</span>
                                        </div>
                                        <button
                                            onClick={() => handleSeatClick(id, "selected")}
                                            className="text-gray-600 hover:text-red-500 transition-colors"
                                            title="Quitar"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Total & CTA */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800">
                        <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-xs uppercase font-bold">Total Estimado:</span>
                            <span className="text-2xl font-black text-white">Bs{totalPrice}</span>
                        </div>

                        <a
                            href={generateWhatsappLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 uppercase tracking-wider text-sm transition-all w-full sm:w-auto justify-center",
                                selectedSeats.length === 0 && "opacity-50 pointer-events-none grayscale"
                            )}
                        >
                            <MessageCircle className="w-5 h-5" />
                            Reservar por WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
