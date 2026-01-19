"use client";
import { use } from "react";
import { ChampionshipForm } from "@/components/admin/championship-form";
export default function EditChampionshipPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <ChampionshipForm id={id} />;
}
