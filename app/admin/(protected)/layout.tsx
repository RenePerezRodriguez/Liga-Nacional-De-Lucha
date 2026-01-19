"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ToastProvider } from "@/components/ui/toast-provider";
import { TourProvider } from "@/components/admin/admin-tour";
import { Loader2 } from "lucide-react";

export default function ProtectedAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/admin/login");
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-lnl-red animate-spin" />
            </div>
        );
    }

    return (
        <ToastProvider>
            <TourProvider>
                <div className="flex bg-zinc-950 text-white min-h-screen">
                    <AdminSidebar />
                    <main className="flex-1 p-4 md:p-8 w-full overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </TourProvider>
        </ToastProvider>
    );
}

