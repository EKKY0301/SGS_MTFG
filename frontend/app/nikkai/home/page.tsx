"use client";
import Link from "next/link";
import { useModalContext } from "@/services/modal/context/context";
import { formatDateOnly } from "@/utils/functions";

type QuickAction = {
    title: string;
    description: string;
    href: string;
};

const quickActions: QuickAction[] = [
    {
        title: "Agregar socio",
        description: "Registrar un nuevo socio principal y su familia.",
        href: "/nikkai/member/add",
    },
    {
        title: "Ver lista de socios",
        description: "Buscar y abrir el detalle de socios existentes.",
        href: "/nikkai/member/list",
    },
    {
        title: "Crear evento",
        description: "Agregar un nuevo evento para la comunidad.",
        href: "/nikkai/event/add",
    },
    {
        title: "Ver eventos",
        description: "Gestionar eventos y asistencia de participantes.",
        href: "/nikkai/event/list",
    },
    {
        title: "Calendario",
        description: "Consultar calendario de eventos y alquileres.",
        href: "/nikkai/calendar",
    },
];

import { getDashboardOverview } from "@/services/dashboard/service";
import { useEffect, useState } from "react";
import { Event } from "@/types/event";
import { Member } from "@/types";

export default function SociosPage(){
    const [weeklyEvents, setWeeklyEvents] = useState<Event[]>([]);
    const [expiredMembers, setExpiredMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const modal = useModalContext();

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const overview = await getDashboardOverview();
                setWeeklyEvents(overview.weeklyEvents ?? []);
                setExpiredMembers(overview.expiredMembers ?? []);
            } catch (error) {
                console.error("Error loading dashboard overview:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboard();
    }, []);

    return <div className="w-full h-full p-5">
        <div className="w-full h-full bg-background-dark rounded-md p-8 overflow-auto pb-5">
            <h1 className="text-text font-bold text-2xl">INICIO</h1>

            <section className="mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 text-black">
                    <div className="p-4 rounded-md border border-text-muted bg-white/40">
                        <h3 className="font-semibold text-sm uppercase tracking-wide">Eventos de la semana</h3>
                        <p className="text-2xl font-bold mt-2">{weeklyEvents.length}</p>
                        <div className="mt-3 max-h-40 overflow-y-auto overflow-x-hidden no-scrollbar pb-3">
                            {isLoading ? (
                                <p className="text-sm text-text-muted">Cargando eventos...</p>
                            ) : weeklyEvents.length === 0 ? (
                                <p className="text-sm text-text-muted">No hay eventos en esta semana.</p>
                            ) : (
                                weeklyEvents.map((event) => {
                                    const eventDate = typeof event.date === "string" ? new Date(event.date) : event.date;
                                    return (
                                        <div key={event.id} className="text-sm py-1 border-b border-text-muted/40 last:border-b-0">
                                            <span className="font-medium">{event.name}</span>
                                            <span className="text-text-muted">{" - "}{eventDate.toLocaleDateString()}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                    <div className="p-4 rounded-md border border-red-300 bg-red-50/70 cursor-pointer hover:bg-red-50 transition-colors" onClick={() => {
                        modal.setTitle("Socios con documentos vencidos");
                        modal.changeContent(
                            <div className="flex flex-col gap-4">
                                {expiredMembers.length === 0 ? (
                                    <p className="text-black text-center py-8">No hay documentos vencidos.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {expiredMembers.map((member) => (
                                            <div key={member.id} className="flex justify-between items-start p-3 bg-red-50 rounded-md border border-red-200">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-black">
                                                        {member.name} {member.surname}
                                                        {member.documentNumber ? ` - ${member.documentNumber}` : ""}
                                                    </p>
                                                    <p className="text-sm text-red-700">
                                                        Vencido: {member.documentExpDate ? formatDateOnly(member.documentExpDate) : "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                        modal.toggleShown();
                    }}>
                        <h3 className="font-semibold text-sm uppercase tracking-wide text-red-800">Documentos vencidos</h3>
                        <p className="text-2xl font-bold mt-2 text-red-700">{expiredMembers.length}</p>
                        <div className="mt-3 max-h-40 overflow-y-auto overflow-x-hidden no-scrollbar pb-3">
                            {isLoading ? (
                                <p className="text-sm text-red-700/80">Verificando documentos...</p>
                            ) : expiredMembers.length === 0 ? (
                                <p className="text-sm text-red-700/80">No hay documentos vencidos.</p>
                            ) : (
                                expiredMembers.map((member) => (
                                    <div key={member.id} className="text-sm py-1 border-b border-red-200 last:border-b-0">
                                        <span className="font-medium">{member.name} {member.surname}</span>
                                        <span className="text-red-700/80">{" - "}Vence: {member.documentExpDate ? formatDateOnly(member.documentExpDate) : "-"}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-text font-semibold text-xl">Acciones rapidas</h2>
                <p className="text-text mt-1 opacity-80">Atajos para las tareas mas usadas del sistema.</p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="rounded-md border border-white/10 bg-black/10 p-4 transition-all duration-150 hover:bg-black/20 hover:border-white/20"
                        >
                            <h3 className="text-text font-semibold text-lg">{action.title}</h3>
                            <p className="text-text mt-1 text-sm opacity-80">{action.description}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    </div>
}
