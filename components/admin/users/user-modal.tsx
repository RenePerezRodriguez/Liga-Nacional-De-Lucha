"use client";

import { useState, useEffect } from "react";
import { AdminUser, updateUserAction, updateUserClaimsAction, createUserAction } from "@/app/actions/auth-admin";
import { X, Save, Key, Shield } from "lucide-react";
import { toast } from "react-hot-toast";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: AdminUser | null;
    onSuccess: () => void;
}

export function UserModal({ isOpen, onClose, user, onSuccess }: UserModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        displayName: "",
        role: "user",
        password: "",
        disabled: false
    });

    const isEditing = !!user;

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || "",
                role: (user.customClaims?.role as string) || "user",
                password: "", // Always empty for security
                disabled: user.disabled,
                email: user.email || ""
            });
        } else {
            setFormData({
                displayName: "",
                role: "user",
                password: "",
                disabled: false,
                email: ""
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing && user) {
                // UPDATE MODE
                const updateResult = await updateUserAction(user.uid, {
                    displayName: formData.displayName,
                    disabled: formData.disabled,
                    ...(formData.password ? { password: formData.password } : {})
                });

                if (!updateResult.success) throw new Error(updateResult.error);

                const currentRole = user.customClaims?.role || "user";
                if (formData.role !== currentRole) {
                    const claims = { role: formData.role };
                    const claimsResult = await updateUserClaimsAction(user.uid, claims);
                    if (!claimsResult.success) throw new Error(claimsResult.error);
                }
                toast.success("Usuario actualizado correctamente");
            } else {
                // CREATE MODE
                if (!formData.email || !formData.password) {
                    throw new Error("Email y contraseña son obligatorios.");
                }

                const createResult = await createUserAction({
                    email: formData.email,
                    password: formData.password,
                    displayName: formData.displayName,
                    role: formData.role
                });

                if (!createResult.success) throw new Error(createResult.error);
                toast.success("Usuario creado correctamente");
            }

            onSuccess();
        } catch (error: unknown) {
            toast.error("Error: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Shield className="text-lnl-gold" /> {isEditing ? "Editar Usuario" : "Crear Nuevo Usuario"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email {isEditing && "(No editable)"}</label>
                        <input
                            type="email"
                            required
                            disabled={isEditing}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white outline-none focus:ring-1 focus:ring-lnl-gold ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white focus:border-lnl-gold outline-none focus:ring-1 focus:ring-lnl-gold transition-all"
                            placeholder="Nombre visible"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Rol</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white focus:border-lnl-gold outline-none"
                        >
                            <option value="user">Usuario (Sin acceso)</option>
                            <option value="editor">Editor (Admin limitado)</option>
                            <option value="admin">Administrador (Acceso total)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            * Admin: Acceso a usuarios y configuración global.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                            <Key className="w-4 h-4" /> {isEditing ? "Cambiar Contraseña" : "Contraseña"}
                        </label>
                        <input
                            type="password"
                            required={!isEditing}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white focus:border-lnl-gold outline-none"
                            placeholder={isEditing ? "Dejar vacía para mantener actual" : "Mínimo 6 caracteres"}
                            minLength={6}
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="disabled"
                            checked={formData.disabled}
                            onChange={(e) => setFormData({ ...formData, disabled: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-600 bg-zinc-800 text-lnl-red focus:ring-lnl-red"
                        />
                        <label htmlFor="disabled" className="text-sm text-gray-300 select-none">
                            Deshabilitar cuenta (Bloquear acceso)
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-lnl-gold text-black rounded font-bold hover:bg-yellow-500 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                            {isEditing ? "Guardar Cambios" : "Crear Usuario"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
