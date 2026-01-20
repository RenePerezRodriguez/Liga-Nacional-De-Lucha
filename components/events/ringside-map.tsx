"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

export type SeatStatus = "available" | "selected" | "reserved" | "sold" | "blocked";

export interface Seat {
    id: string;
    side: "north" | "south" | "west";
    row: string;
    number: number;
    status: SeatStatus;
}

interface RingsideMapProps {
    seats: Record<string, SeatStatus>;
    mode: "admin" | "public";
    onSeatClick?: (seatId: string, currentStatus: SeatStatus) => void;
    selectedSeats?: string[];
}

// Layout: 3 rows (A, B, C) x 12 seats per side
const ROWS = ["A", "B", "C"];
const SEATS_PER_ROW = 12;

export function RingsideMap({ seats, mode, onSeatClick, selectedSeats = [] }: RingsideMapProps) {

    const renderSeat = (sideKey: string, row: string, seatNum: number) => {
        const id = `${sideKey}-${row}-${seatNum}`;
        const status = seats[id] || "available";
        const isSelected = selectedSeats.includes(id);

        let bgColor = "bg-zinc-800 hover:bg-zinc-700 border-zinc-600";
        let textColor = "text-white";
        let cursor = "cursor-pointer";
        let disabled = false;

        if (status === "sold") {
            bgColor = "bg-red-900/60 border-red-700";
            textColor = "text-red-400";
            cursor = "cursor-not-allowed";
            disabled = mode === "public";
        } else if (status === "reserved") {
            bgColor = "bg-yellow-900/60 border-yellow-700";
            textColor = "text-yellow-400";
            cursor = "cursor-not-allowed";
            disabled = mode === "public";
        } else if (status === "blocked") {
            bgColor = "bg-zinc-950 border-zinc-900 opacity-30";
            textColor = "text-zinc-600";
            cursor = "cursor-not-allowed";
            disabled = true;
        } else if (isSelected) {
            bgColor = "bg-lnl-gold border-lnl-gold shadow-[0_0_10px_rgba(234,179,8,0.6)]";
            textColor = "text-black font-bold";
        }

        return (
            <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() => onSeatClick?.(id, status)}
                title={`Lado ${sideKey === "N" ? "Norte" : sideKey === "S" ? "Sur" : "Oeste"} - Fila ${row} - Asiento ${seatNum}`}
                className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded border flex items-center justify-center text-[8px] sm:text-[9px] md:text-[10px] font-bold transition-all",
                    bgColor,
                    textColor,
                    cursor
                )}
            >
                {seatNum}
            </button>
        );
    };

    const renderRowLabel = (row: string) => (
        <span className="text-[10px] sm:text-xs font-black text-gray-500 w-4 sm:w-5 flex items-center justify-center">
            {row}
        </span>
    );

    return (
        <div className="bg-zinc-950 p-3 sm:p-4 md:p-6 rounded-xl">
            <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8">

                {/* Mobile: Stack vertically, Desktop: Side by side */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 w-full">

                    {/* LADO NORTE */}
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-lnl-red font-black uppercase text-xs sm:text-sm tracking-widest mb-1">
                            LADO NORTE
                        </span>
                        {[...ROWS].reverse().map(row => (
                            <div key={row} className="flex items-center gap-0.5">
                                {renderRowLabel(row)}
                                {Array.from({ length: SEATS_PER_ROW }).map((_, i) =>
                                    renderSeat("N", row, i + 1)
                                )}
                            </div>
                        ))}
                    </div>

                    {/* RING CENTRAL - Solo visible en desktop entre Norte y Sur */}
                    <div className="hidden lg:flex relative w-32 h-32 xl:w-40 xl:h-40 flex-shrink-0 mx-4">
                        <div className="absolute inset-0 bg-zinc-900 border-2 border-zinc-700 rounded flex items-center justify-center">
                            <div className="absolute inset-2 border-2 border-red-600/60 rounded" />
                            <div className="absolute inset-4 border-2 border-white/40 rounded" />
                            <div className="absolute inset-6 border-2 border-blue-600/60 rounded" />
                            <div className="absolute top-0 left-0 w-3 h-3 bg-white rounded-full border border-gray-400 -translate-x-1 -translate-y-1" />
                            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-600 rounded-full border border-blue-800 translate-x-1 -translate-y-1" />
                            <div className="absolute bottom-0 left-0 w-3 h-3 bg-red-600 rounded-full border border-red-800 -translate-x-1 translate-y-1" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-white rounded-full border border-gray-400 translate-x-1 translate-y-1" />
                            <div className="relative w-16 h-16 xl:w-20 xl:h-20">
                                <Image src="/images/logos/LNL-Logotipo.png" alt="LNL" fill className="object-contain opacity-80" />
                            </div>
                        </div>
                    </div>

                    {/* LADO SUR */}
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-green-500 font-black uppercase text-xs sm:text-sm tracking-widest mb-1">
                            LADO SUR
                        </span>
                        {ROWS.map(row => (
                            <div key={row} className="flex items-center gap-0.5">
                                {Array.from({ length: SEATS_PER_ROW }).map((_, i) =>
                                    renderSeat("S", row, i + 1)
                                )}
                                {renderRowLabel(row)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ring visual for mobile - compact version */}
                <div className="lg:hidden relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                    <div className="absolute inset-0 bg-zinc-900 border-2 border-zinc-700 rounded flex items-center justify-center">
                        <div className="absolute inset-1 border border-red-600/60 rounded" />
                        <div className="absolute inset-3 border border-blue-600/60 rounded" />
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                            <Image src="/images/logos/LNL-Logotipo.png" alt="LNL" fill className="object-contain opacity-80" />
                        </div>
                    </div>
                </div>

                {/* LADO OESTE */}
                <div className="flex flex-col items-center gap-1 mt-2">
                    <span className="text-blue-500 font-black uppercase text-xs sm:text-sm tracking-widest mb-1">
                        LADO OESTE
                    </span>
                    {ROWS.map(row => (
                        <div key={row} className="flex items-center gap-0.5">
                            {renderRowLabel(row)}
                            {Array.from({ length: SEATS_PER_ROW }).map((_, i) =>
                                renderSeat("O", row, i + 1)
                            )}
                            {renderRowLabel(row)}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4 pt-4 border-t border-zinc-800 w-full">
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 bg-zinc-800 border border-zinc-600 rounded" />
                        <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase">Disponible</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 bg-lnl-gold border border-lnl-gold rounded" />
                        <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase">Seleccionado</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 bg-red-900/60 border border-red-700 rounded" />
                        <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase">Vendido</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 bg-yellow-900/60 border border-yellow-700 rounded" />
                        <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase">Reservado</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
