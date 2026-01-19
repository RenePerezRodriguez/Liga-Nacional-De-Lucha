"use client";

import { use } from "react";
import { EventForm } from "@/components/admin/event-form";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <EventForm id={id} />;
}
