"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/admin");
        } catch (err) {
            console.error(err);
            const firebaseError = err as { code?: string };
            if (firebaseError.code === "auth/invalid-credential") {
                setError("Credenciales incorrectas. Intenta de nuevo.");
            } else if (firebaseError.code === "auth/too-many-requests") {
                setError("Demasiados intentos fallidos. Espera unos minutos.");
            } else {
                setError("Error al iniciar sesión. Verifica tu conexión.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">

                {/* Background Accents */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-lnl-gold to-lnl-red" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-lnl-red/20 rounded-full blur-3xl pointer-events-none" />

                <div className="text-center mb-8 relative z-10">
                    <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800 shadow-lg">
                        <Lock className="w-10 h-10 text-lnl-gold" />
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">Acceso Admin</h1>
                    <p className="text-gray-500 text-sm">Panel de Control LNL</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-6 flex items-center gap-3 text-red-400 text-sm animate-shake">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-gray-500 ml-1">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-lnl-red focus:ring-1 focus:ring-lnl-red transition-all"
                                placeholder="admin@luchalibrebolivia.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-gray-500 ml-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-lnl-red focus:ring-1 focus:ring-lnl-red transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-black uppercase tracking-widest py-3 rounded-lg hover:bg-gray-200 transition-colors mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ingresar"}
                    </button>
                </form>

                <p className="text-center text-xs text-zinc-600 mt-8">
                    Acceso restringido únicamente para personal autorizado.
                </p>
            </div>
        </div>
    );
}
