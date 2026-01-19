"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SponsorsSection } from "@/components/sponsors";
import { SocialFab } from "@/components/social-fab";
import { ConfigProvider } from "@/components/config-provider";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");

    if (isAdmin) {
        return <ConfigProvider>{children}</ConfigProvider>;
    }

    return (
        <ConfigProvider>
            <Navbar />
            <main className="flex-grow pt-28">
                {children}
            </main>
            <SponsorsSection />
            <Footer />
            <SocialFab />
        </ConfigProvider>
    );
}

