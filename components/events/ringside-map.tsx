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

    const renderSeat = (sideKey: string, row: string, seatNum: number, isVertical = false) => {
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
                title={`${sideKey === "N" ? "Norte" : sideKey === "S" ? "Sur" : "Oeste"} - Fila ${row} - Asiento ${seatNum}`}
                className={cn(
                    "rounded border flex items-center justify-center font-bold transition-all",
                    // Mobile: w-6 h-7 (easier touch) | Desktop: Scaled
                    isVertical
                        ? "w-8 h-6 sm:w-10 sm:h-7 md:w-12 md:h-8"
                        : "w-6 h-7 text-[9px] sm:w-7 sm:h-10 sm:text-[10px] md:w-8 md:h-12 md:text-xs",
                    bgColor,
                    textColor,
                    cursor
                )}
            >
                {seatNum}
            </button>
        );
    };

    return (
        <div className="bg-zinc-950 p-4 rounded-xl flex flex-col items-center justify-center">

            {/* =====================================================================================
                MOBILE LAYOUT (< md) - VERTICAL STACK
                Strategy: Stack everything vertically to avoid horizontal scroll.
                Apps like Ticketmaster often use lists or stacked blocks for mobile.
                Order: Norte -> Oeste (Rotated to Horizontal) -> Ring -> Sur
               ===================================================================================== */}
            <div className="flex md:hidden flex-col items-center gap-4 w-full">

                {/* 1. NORTE (Horizontal) */}
                <div className="flex flex-col items-center w-full">
                    <span className="text-lnl-red font-black uppercase text-xs tracking-widest mb-1">LADO NORTE</span>
                    {[...ROWS].reverse().map(row => (
                        <div key={row} className="flex gap-0.5 mb-0.5 items-center justify-center w-full">
                            <span className="text-[9px] font-bold text-gray-500 w-3 text-right mr-0.5">{row}</span>
                            {Array.from({ length: SEATS_PER_ROW }).map((_, i) =>
                                renderSeat("N", row, i + 1)
                            )}
                            <span className="text-[9px] font-bold text-gray-500 w-3 ml-0.5">{row}</span>
                        </div>
                    ))}
                </div>

                {/* 2. OESTE (Rotated to Horizontal for Mobile fit) */}
                <div className="flex flex-col items-center w-full">
                    {/* Visual Divider/Header for Section */}
                    <span className="text-blue-500 font-black uppercase text-xs tracking-widest mb-1">LADO OESTE</span>
                    {[...ROWS].reverse().map(row => (
                        <div key={row} className="flex gap-0.5 mb-0.5 items-center justify-center w-full">
                            <span className="text-[9px] font-bold text-gray-500 w-3 text-right mr-0.5">{row}</span>
                            {Array.from({ length: SEATS_PER_ROW }).map((_, i) =>
                                renderSeat("O", row, i + 1) // Render as Horizontal (default)
                            )}
                            <span className="text-[9px] font-bold text-gray-500 w-3 ml-0.5">{row}</span>
                        </div>
                    ))}
                </div>

                {/* 3. RING */}
                <div className="relative w-[180px] h-[180px] flex-shrink-0 bg-zinc-900 border-2 border-zinc-700 rounded-lg flex items-center justify-center my-1">
                    <div className="absolute inset-3 border-4 border-red-600/70 rounded" />
                    <div className="absolute inset-6 border-4 border-white/50 rounded" />
                    <div className="absolute inset-9 border-4 border-blue-600/70 rounded" />
                    <div className="relative w-20 h-20 opacity-80">
                        <Image src="/images/logos/LNL-Logotipo.png" alt="LNL" fill className="object-contain" />
                    </div>
                </div>

                {/* 4. SUR (Horizontal) */}
                <div className="flex flex-col items-center w-full">
                    <span className="text-green-500 font-black uppercase text-xs tracking-widest mb-1">LADO SUR</span>
                    {[...ROWS].map(row => (
                        <div key={row} className="flex gap-0.5 mb-0.5 items-center justify-center w-full">
                            <span className="text-[9px] font-bold text-gray-500 w-3 text-right mr-0.5">{row}</span>
                            {Array.from({ length: SEATS_PER_ROW }).map((_, i) =>
                                renderSeat("S", row, i + 1)
                            )}
                            <span className="text-[9px] font-bold text-gray-500 w-3 ml-0.5">{row}</span>
                        </div>
                    ))}
                </div>

            </div>


            {/* =====================================================================================
                DESKTOP LAYOUT (md+) - 3x3 GRID
                Strategy: Mathematical centering with Ghost Column
               ===================================================================================== */}
            <div className="hidden md:grid grid-cols-[1fr_auto_1fr] gap-x-4 items-center w-full max-w-5xl mx-auto">

                {/* ROW 1: NORTE */}
                <div className="col-start-2 flex flex-col items-center justify-end pb-4">
                    <span className="text-lnl-red font-black uppercase text-sm tracking-widest mb-2">LADO NORTE</span>
                    {[...ROWS].reverse().map(row => (
                        <div key={row} className="flex gap-1 mb-1 items-center">
                            <span className="text-[10px] font-bold text-gray-500 w-4 text-right mr-1">{row}</span>
                            {Array.from({ length: SEATS_PER_ROW }).map((_, i) =>
                                renderSeat("N", row, i + 1)
                            )}
                            <span className="text-[10px] font-bold text-gray-500 w-4 ml-1">{row}</span>
                        </div>
                    ))}
                </div>

                {/* ROW 2: OESTE | RING | GHOST */}
                <div className="col-start-1 flex items-center justify-end gap-2 h-full">
                    <span className="text-blue-500 font-black uppercase text-sm tracking-widest whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', textOrientation: 'sideways' }}>LADO OESTE</span>
                    <div className="flex gap-1">
                        {[...ROWS].reverse().map(row => (
                            <div key={row} className="flex flex-col gap-1 items-center">
                                <span className="text-[10px] font-bold text-gray-500 mb-1">{row}</span>
                                {Array.from({ length: SEATS_PER_ROW }).map((_, i) =>
                                    renderSeat("O", row, i + 1, true)
                                )}
                                <span className="text-[10px] font-bold text-gray-500 mt-1">{row}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-start-2 flex items-center justify-center">
                    <div className="relative w-[380px] h-[380px] flex-shrink-0 bg-zinc-900 border-2 border-zinc-700 rounded-lg flex items-center justify-center">
                        <div className="absolute inset-4 border-4 border-red-600/70 rounded" />
                        <div className="absolute inset-8 border-4 border-white/50 rounded" />
                        <div className="absolute inset-12 border-4 border-blue-600/70 rounded" />
                        <div className="absolute top-0 left-0 w-6 h-6 bg-white rounded-full border border-gray-400 -translate-x-2 -translate-y-2" />
                        <div className="absolute top-0 right-0 w-6 h-6 bg-blue-600 rounded-full border border-blue-800 translate-x-2 -translate-y-2" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 bg-red-600 rounded-full border border-red-800 -translate-x-2 translate-y-2" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full border border-gray-400 translate-x-2 translate-y-2" />
                        <div className="relative w-32 h-32 opacity-80">
                            <Image src="/images/logos/LNL-Logotipo.png" alt="LNL" fill className="object-contain" />
                        </div>
                    </div>
                </div>

                <div className="col-start-3 flex items-center justify-start gap-2 h-full opacity-0 pointer-events-none select-none">
                    <div className="flex gap-1">
                        {[...ROWS].reverse().map(row => (
                            <div key={row} className="flex flex-col gap-1 items-center">
                                <span className="text-[10px] font-bold text-gray-500 mb-1">{row}</span>
                                {Array.from({ length: SEATS_PER_ROW }).map((_, i) =>
                                    renderSeat("O", row, i + 1, true)
                                )}
                                <span className="text-[10px] font-bold text-gray-500 mt-1">{row}</span>
                            </div>
                        ))}
                    </div>
                    <span className="text-blue-500 font-black uppercase text-sm tracking-widest whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>LADO ESTE</span>
                </div>

                {/* ROW 3: SUR */}
                <div className="col-start-2 flex flex-col items-center justify-start pt-4">
                    {[...ROWS].map(row => (
                        <div key={row} className="flex gap-1 mb-1 items-center">
                            <span className="text-[10px] font-bold text-gray-500 w-4 text-right mr-1">{row}</span>
                            {Array.from({ length: SEATS_PER_ROW }).map((_, i) =>
                                renderSeat("S", row, i + 1)
                            )}
                            <span className="text-[10px] font-bold text-gray-500 w-4 ml-1">{row}</span>
                        </div>
                    ))}
                    <span className="text-green-500 font-black uppercase text-sm tracking-widest mt-2">LADO SUR</span>
                </div>

            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 border-t border-zinc-800 w-full">
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
    );
}
