"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SiteConfig {
    whatsappVentas: string;
    whatsappAcademia: string;
    social: {
        facebook: string;
        instagram: string;
        tiktok: string;
        youtube: string;
    };
    basePrices: {
        general: string;
        vip: string;
        ringside: string;
    };
}

const DEFAULT_CONFIG: SiteConfig = {
    whatsappVentas: "59170000000",
    whatsappAcademia: "59176900000",
    social: {
        facebook: "https://www.facebook.com/profile.php?id=61559310413691",
        instagram: "https://instagram.com/lnlbolivia",
        tiktok: "https://www.tiktok.com/@liganacionalde.lucha",
        youtube: "https://youtube.com/@lnlbolivia"
    },
    basePrices: {
        general: "30",
        vip: "50",
        ringside: "80"
    }
};

interface ConfigContextType {
    config: SiteConfig;
    loading: boolean;
    getWhatsAppLink: (type: "ventas" | "academia", message?: string) => string;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const docRef = doc(db, "configuracion", "general");
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data() as Partial<SiteConfig>;
                setConfig({
                    ...DEFAULT_CONFIG,
                    ...data,
                    social: { ...DEFAULT_CONFIG.social, ...data.social },
                    basePrices: { ...DEFAULT_CONFIG.basePrices, ...data.basePrices }
                });
            }
            setLoading(false);
        }, (error) => {
            console.error("Error loading config:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getWhatsAppLink = (type: "ventas" | "academia", message?: string): string => {
        const number = type === "ventas" ? config.whatsappVentas : config.whatsappAcademia;
        const baseUrl = `https://wa.me/${number}`;
        return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
    };

    return (
        <ConfigContext.Provider value={{ config, loading, getWhatsAppLink }}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error("useConfig must be used within a ConfigProvider");
    }
    return context;
}

// Hook for just getting the config without throwing (for optional usage)
export function useSiteConfig(): SiteConfig {
    const context = useContext(ConfigContext);
    return context?.config ?? DEFAULT_CONFIG;
}

export { DEFAULT_CONFIG };
export type { SiteConfig };
