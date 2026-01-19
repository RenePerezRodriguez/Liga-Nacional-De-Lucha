"use client";
import { use } from "react";
import { NewsForm } from "@/components/admin/news-form";
export default function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <NewsForm id={id} />;
}
