"use client";

import { EventProvider } from "@/services/events/context/context";

export default function EventLayout({ children }: { children: React.ReactNode }) {
    return (
        <EventProvider>
            {children}
        </EventProvider>
    );
}
