"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteImageFromStorage } from "@/lib/storage-utils";
import Link from "next/link";
import { Plus, Pencil, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";

import { DocumentData } from "firebase/firestore";

interface Product extends DocumentData {
    id: string;
    name: string;
    category: string;
    price: string;
    status: string;
    image?: string;
}

export default function StoreAdminPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "productos"), orderBy("name"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`¿Eliminar producto: ${name}?`)) {
            try {
                const product = products.find(p => p.id === id);
                if (product?.image) {
                    await deleteImageFromStorage(product.image);
                }
                await deleteDoc(doc(db, "productos", id));
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">Gestión de Tienda</h1>
                    <p className="text-gray-400 text-sm">Inventario de Merchandising.</p>
                </div>
                <Link href="/admin/tienda/nuevo" className="bg-lnl-red text-white px-4 py-2 rounded font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-red-700 transition-colors">
                    <Plus className="w-5 h-5" /> Nuevo Producto
                </Link>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/50 text-xs font-bold uppercase text-gray-500">
                            <tr>
                                <th className="p-4">Producto</th>
                                <th className="p-4">Categoría</th>
                                <th className="p-4">Precio</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Cargando inventario...</td></tr>
                            ) : products.map((p) => (
                                <tr key={p.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-800 rounded relative overflow-hidden">
                                            {p.image ? <Image src={p.image} alt={p.name} fill className="object-cover" /> : <ShoppingBag className="p-2 w-full h-full text-zinc-600" />}
                                        </div>
                                        <span className="font-bold text-white whitespace-nowrap">{p.name}</span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">{p.category}</td>
                                    <td className="p-4 text-sm font-bold text-white whitespace-nowrap">Bs. {p.price}</td>
                                    <td className="p-4">
                                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${p.status === 'active' ? 'bg-green-900/20 text-green-500' :
                                            p.status === 'soldout' ? 'bg-red-900/20 text-red-500' : 'bg-blue-900/20 text-blue-500'
                                            }`}>
                                            {p.status === 'active' ? 'En Stock' : p.status === 'soldout' ? 'Agotado' : 'Preventa'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/tienda/${p.id}`} className="p-2 bg-zinc-800 rounded hover:bg-white hover:text-black"><Pencil className="w-4 h-4" /></Link>
                                            <button onClick={() => handleDelete(p.id, p.name)} className="p-2 bg-zinc-800 rounded hover:bg-red-600 hover:text-white"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
