"use client";

import { use } from "react";
import { WrestlerForm } from "@/components/admin/wrestler-form";

export default function EditWrestlerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <WrestlerForm id={id} />;
}
