"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownProps {
    targetDate: string; // ISO string format
    eventName: string;
}

export function Countdown({ targetDate, eventName }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft();

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <div className="w-full bg-lnl-gold/10 backdrop-blur-md border-y border-lnl-gold/30 text-white py-4">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
                <div className="flex items-center gap-2 text-lnl-gold font-bold uppercase tracking-widest animate-pulse">
                    <Clock className="w-5 h-5" />
                    <span>Próximo Evento: {eventName}</span>
                </div>

                <div className="flex gap-4 md:gap-8 font-mono text-2xl md:text-3xl font-black">
                    <div className="text-center">
                        <span className="block leading-none">{timeLeft.days.toString().padStart(2, '0')}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Días</span>
                    </div>
                    <span className="animate-pulse">:</span>
                    <div className="text-center">
                        <span className="block leading-none">{timeLeft.hours.toString().padStart(2, '0')}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Horas</span>
                    </div>
                    <span className="animate-pulse">:</span>
                    <div className="text-center">
                        <span className="block leading-none">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Min</span>
                    </div>
                    <span className="animate-pulse">:</span>
                    <div className="text-center">
                        <span className="block leading-none">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Seg</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
