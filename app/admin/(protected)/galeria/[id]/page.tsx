"use client";
import { use } from "react";
import { GalleryForm } from "@/components/admin/gallery-form";
export default function EditGalleryItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <GalleryForm id={id} />;
}
