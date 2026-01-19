"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useUserRole() {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
            if (user) {
                try {
                    // Forzar refresh del token para asegurar que tenemos los últimos claims
                    const tokenResult = await user.getIdTokenResult(true);
                    setRole(tokenResult.claims.role as string || null);
                } catch (error) {
                    console.error("Error obteniendo claims:", error);
                    setRole(null);
                }
            } else {
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { role, loading, isAdmin: role === "admin", isEditor: role === "editor" };
}
