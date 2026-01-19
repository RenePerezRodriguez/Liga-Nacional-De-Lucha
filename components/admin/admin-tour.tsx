"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, HelpCircle, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ========================================
// TYPES
// ========================================

export interface TourStep {
    target: string; // CSS selector
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right";
}

interface TourContextType {
    startTour: (tourId: string, steps: TourStep[]) => void;
    endTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    isActive: boolean;
    currentStep: number;
    totalSteps: number;
    hasCompletedTour: (tourId: string) => boolean;
    resetTour: (tourId: string) => void;
    resetAllTours: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

// ========================================
// TOUR PROVIDER
// ========================================

export function TourProvider({ children }: { children: ReactNode }) {
    const [isActive, setIsActive] = useState(false);
    const [currentTourId, setCurrentTourId] = useState<string | null>(null);
    const [steps, setSteps] = useState<TourStep[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    // Get completed tours from localStorage
    const getCompletedTours = (): string[] => {
        if (typeof window === "undefined") return [];
        try {
            return JSON.parse(localStorage.getItem("admin-tours-completed") || "[]");
        } catch {
            return [];
        }
    };

    const hasCompletedTour = (tourId: string): boolean => {
        return getCompletedTours().includes(tourId);
    };

    const markTourCompleted = (tourId: string) => {
        const completed = getCompletedTours();
        if (!completed.includes(tourId)) {
            localStorage.setItem("admin-tours-completed", JSON.stringify([...completed, tourId]));
        }
    };

    const resetTour = (tourId: string) => {
        const completed = getCompletedTours().filter(id => id !== tourId);
        localStorage.setItem("admin-tours-completed", JSON.stringify(completed));
    };

    const resetAllTours = () => {
        localStorage.removeItem("admin-tours-completed");
    };

    const startTour = useCallback((tourId: string, tourSteps: TourStep[]) => {
        if (tourSteps.length === 0) return;
        setCurrentTourId(tourId);
        setSteps(tourSteps);
        setCurrentStep(0);
        setIsActive(true);
    }, []);

    const endTour = useCallback(() => {
        if (currentTourId) {
            markTourCompleted(currentTourId);
        }
        setIsActive(false);
        setCurrentTourId(null);
        setSteps([]);
        setCurrentStep(0);
        setTargetRect(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTourId]);

    const nextStep = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            endTour();
        }
    }, [currentStep, steps.length, endTour]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    // Update target rect when step changes
    useEffect(() => {
        if (!isActive || steps.length === 0) return;

        const step = steps[currentStep];

        const updateTargetPosition = () => {
            const element = document.querySelector(step.target);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
            } else {
                setTargetRect(null);
            }
        };

        // Initial scroll and position update
        const element = document.querySelector(step.target);
        if (element) {
            // Scroll element into view first
            element.scrollIntoView({ behavior: "smooth", block: "center" });

            // Wait for scroll animation to complete then update position
            const scrollTimeout = setTimeout(() => {
                updateTargetPosition();
            }, 400);

            // Also update on scroll/resize
            const handleScrollResize = () => {
                updateTargetPosition();
            };

            window.addEventListener("scroll", handleScrollResize, true);
            window.addEventListener("resize", handleScrollResize);

            return () => {
                clearTimeout(scrollTimeout);
                window.removeEventListener("scroll", handleScrollResize, true);
                window.removeEventListener("resize", handleScrollResize);
            };
        } else {
            setTargetRect(null);
        }
    }, [isActive, currentStep, steps]);

    // Handle keyboard navigation
    useEffect(() => {
        if (!isActive) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") endTour();
            if (e.key === "ArrowRight") nextStep();
            if (e.key === "ArrowLeft") prevStep();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isActive, nextStep, prevStep, endTour]);

    const currentStepData = steps[currentStep];

    return (
        <TourContext.Provider value={{
            startTour,
            endTour,
            nextStep,
            prevStep,
            isActive,
            currentStep,
            totalSteps: steps.length,
            hasCompletedTour,
            resetTour,
            resetAllTours,
        }}>
            {children}

            {/* Tour Overlay */}
            <AnimatePresence>
                {isActive && currentStepData && (
                    <>
                        {/* Backdrop with spotlight */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9998] pointer-events-none"
                            style={{
                                background: targetRect
                                    ? `radial-gradient(ellipse ${Math.max(targetRect.width + 40, 150)}px ${Math.max(targetRect.height + 40, 80)}px at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent 0%, rgba(0,0,0,0.85) 100%)`
                                    : "rgba(0,0,0,0.85)"
                            }}
                        />

                        {/* Highlight border around target */}
                        {targetRect && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed z-[9999] border-2 border-lnl-gold rounded-lg pointer-events-none shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                                style={{
                                    top: targetRect.top - 4,
                                    left: targetRect.left - 4,
                                    width: targetRect.width + 8,
                                    height: targetRect.height + 8,
                                }}
                            />
                        )}

                        {/* Tooltip */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="fixed z-[10000] w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-4"
                            style={getTooltipPosition(targetRect, currentStepData.placement)}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-lnl-gold" />
                                    {currentStepData.title}
                                </h3>
                                <button
                                    onClick={endTour}
                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Content */}
                            <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                {currentStepData.content}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    Paso {currentStep + 1} de {steps.length}
                                </span>
                                <div className="flex items-center gap-2">
                                    {currentStep > 0 && (
                                        <button
                                            onClick={prevStep}
                                            className="p-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={nextStep}
                                        className="px-4 py-2 bg-lnl-gold text-black rounded-lg font-bold text-sm hover:bg-yellow-400 transition-colors flex items-center gap-1"
                                    >
                                        {currentStep === steps.length - 1 ? "Finalizar" : "Siguiente"}
                                        {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </TourContext.Provider>
    );
}

// Calculate tooltip position based on target and placement preference
function getTooltipPosition(rect: DOMRect | null, placement: TourStep["placement"] = "bottom"): React.CSSProperties {
    if (!rect) {
        return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }

    const padding = 16;
    const tooltipWidth = 320;

    switch (placement) {
        case "top":
            return {
                bottom: window.innerHeight - rect.top + padding,
                left: Math.max(padding, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))
            };
        case "left":
            return {
                top: rect.top + rect.height / 2 - 80,
                right: window.innerWidth - rect.left + padding
            };
        case "right":
            return {
                top: rect.top + rect.height / 2 - 80,
                left: rect.right + padding
            };
        case "bottom":
        default:
            return {
                top: rect.bottom + padding,
                left: Math.max(padding, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))
            };
    }
}

// ========================================
// HOOKS
// ========================================

export function useTour() {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error("useTour must be used within a TourProvider");
    }
    return context;
}

// ========================================
// TOUR BUTTON COMPONENT
// ========================================

interface TourButtonProps {
    tourId: string;
    steps: TourStep[];
    className?: string;
}

export function TourButton({ tourId, steps, className = "" }: TourButtonProps) {
    const { startTour, hasCompletedTour } = useTour();
    const completed = hasCompletedTour(tourId);

    return (
        <button
            onClick={() => startTour(tourId, steps)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 bg-lnl-gold/10 border border-lnl-gold/30 text-lnl-gold rounded-lg text-sm font-medium hover:bg-lnl-gold/20 transition-colors ${className}`}
        >
            {completed ? <RotateCcw className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
            {completed ? "Repetir Guía" : "¿Cómo funciona?"}
        </button>
    );
}

// ========================================
// AUTO-START TOUR ON FIRST VISIT
// ========================================

interface AutoTourProps {
    tourId: string;
    steps: TourStep[];
    delay?: number; // ms before starting
}

export function AutoTour({ tourId, steps, delay = 1000 }: AutoTourProps) {
    const { startTour, hasCompletedTour, isActive } = useTour();

    useEffect(() => {
        if (hasCompletedTour(tourId) || isActive) return;

        const timer = setTimeout(() => {
            startTour(tourId, steps);
        }, delay);

        return () => clearTimeout(timer);
    }, [tourId, steps, delay, startTour, hasCompletedTour, isActive]);

    return null;
}
