"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUserRole } from "@/hooks/use-user-role";
import { listUsersAction, deleteUserAction, AdminUser } from "@/app/actions/auth-admin";
import { UserModal } from "@/components/admin/users/user-modal";
import { Loader2, UserCog, Trash2, Edit, ShieldAlert } from "lucide-react";
import { toast } from "react-hot-toast";

export default function UsersPage() {
    const { isAdmin, loading: roleLoading } = useUserRole();
    const router = useRouter();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);

    // Function for pagination (manual trigger)
    const loadMoreUsers = async (pageToken: string) => {
        setLoading(true);
        const result = await listUsersAction(pageToken);
        if (result.success && result.data) {
            setUsers(prev => [...prev, ...result.data!.users]);
            setNextPageToken(result.data.pageToken);
        } else {
            toast.error("Error cargando más usuarios: " + result.error);
        }
        setLoading(false);
    };

    // 1. Effect for Route Protection
    useEffect(() => {
        if (!roleLoading && !isAdmin) {
            toast.error("Acceso denegado: Se requieren permisos de Administrador.");
            router.push("/admin/lucha-libre");
        }
    }, [roleLoading, isAdmin, router]);

    // 2. Effect for Initial Data Fetching only
    useEffect(() => {
        let isMounted = true;

        async function initialFetch() {
            if (isAdmin) {
                // Assuming component starts with loading=true, so we don't need to set it true here, dealing with the synchronous setState execution warning.
                const result = await listUsersAction();

                if (!isMounted) return;

                if (result.success && result.data) {
                    setUsers(result.data.users);
                    setNextPageToken(result.data.pageToken);
                } else {
                    toast.error("Error cargando usuarios: " + result.error);
                }
                setLoading(false);
            }
        }

        initialFetch();

        return () => { isMounted = false; };
    }, [isAdmin]); // Only depends on isAdmin status

    const handleDelete = async (uid: string) => {
        if (confirm("¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.")) {
            const result = await deleteUserAction(uid);
            if (result.success) {
                toast.success("Usuario eliminado correctamente");
                window.location.reload(); // Refresh list
            } else {
                toast.error("Error eliminando usuario: " + result.error);
            }
        }
    };

    const handleEdit = (user: AdminUser) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    if (roleLoading || (loading && users.length === 0)) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-lnl-gold animate-spin" />
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                    <UserCog className="text-lnl-gold" /> Gestión de Usuarios
                </h1>
                <button
                    onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                    className="px-4 py-2 bg-lnl-gold text-black font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-yellow-500 transition-transform active:scale-95 flex items-center gap-2"
                >
                    <UserCog className="w-4 h-4" /> Nuevo Usuario
                </button>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-zinc-950 text-gray-200 uppercase font-bold text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {users.map((user) => (
                                <tr key={user.uid} className="hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
                                            {user.photoURL ? (
                                                <Image src={user.photoURL} alt={user.displayName || "User"} width={32} height={32} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCog className="w-4 h-4 text-gray-500" />
                                            )}
                                        </div>
                                        {user.displayName || "Sin nombre"}
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${user.customClaims?.role === 'admin'
                                            ? 'bg-red-900/30 text-red-500 border-red-900'
                                            : user.customClaims?.role === 'editor'
                                                ? 'bg-blue-900/30 text-blue-500 border-blue-900'
                                                : 'bg-zinc-800 text-gray-400 border-zinc-700'
                                            }`}>
                                            {(user.customClaims?.role as string) || "user"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.disabled ? (
                                            <span className="text-red-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Deshabilitado</span>
                                        ) : (
                                            <span className="text-green-500">Activo</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                            title="Editar"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.uid)}
                                            className="text-red-500 hover:text-red-400 transition-colors p-1"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && !loading && (
                    <div className="p-8 text-center text-gray-500">No se encontraron usuarios.</div>
                )}
                {nextPageToken && (
                    <div className="p-4 flex justify-center border-t border-zinc-800">
                        <button
                            onClick={() => loadMoreUsers(nextPageToken)}
                            disabled={loading}
                            className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition"
                        >
                            {loading ? "Cargando..." : "Cargar más"}
                        </button>
                    </div>
                )}
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                onSuccess={() => {
                    setIsModalOpen(false);
                    window.location.reload();
                }}
            />
        </div >
    );
}
