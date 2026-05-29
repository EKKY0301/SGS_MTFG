"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { searchAllEvents } from "@/services/events/service";
import { Event } from "@/types/event";
import { normalizeDateOnly } from "@/utils/functions";
import { useModalContext } from "@/services/modal/context/context";
import { FormModalTemplate } from "@/components/modal/FormModalTemplate";

const WEEK_DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function toDayKey(year: number, month: number, day: number) {
    const normalizedMonth = String(month).padStart(2, "0");
    const normalizedDay = String(day).padStart(2, "0");
    return `${year}-${normalizedMonth}-${normalizedDay}`;
}

function dateOnlyKeyFromValue(value: string | Date) {
    return normalizeDateOnly(value);
}

function getMonthGrid(monthDate: Date) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekDayOffset = (firstDay.getDay() + 6) % 7;

    const cells: Array<number | null> = [];

    for (let i = 0; i < firstWeekDayOffset; i++) {
        cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        cells.push(day);
    }

    while (cells.length % 7 !== 0) {
        cells.push(null);
    }

    return cells;
}

function monthTitle(date: Date) {
    return date.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
}

export default function ListaEventosPage() {
    const router = useRouter();
    const modal = useModalContext();
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [visibleMonth, setVisibleMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    useEffect(() => {
        const loadAllEvents = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await searchAllEvents();
                const items = Array.isArray(response) ? response : (response.data ?? []);
                setEvents(items);
            } catch (requestError) {
                const message = requestError instanceof Error ? requestError.message : "Ocurrio un error inesperado";
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        void loadAllEvents();
    }, []);

    const eventsByDay = useMemo(
        () =>
            events.reduce<Record<string, Array<{ id: string; name: string }>>>((acc, event) => {
                if (!event.date) {
                    return acc;
                }

                const key = dateOnlyKeyFromValue(event.date);
                if (!key) {
                    return acc;
                }

                const dayEvents = acc[key] ?? [];
                dayEvents.push({ id: event.id, name: event.name });
                acc[key] = dayEvents;
                return acc;
            }, {}),
        [events],
    );

    const monthCells = useMemo(() => getMonthGrid(visibleMonth), [visibleMonth]);

    const goPrevMonth = () => {
        setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
    };

    const goNextMonth = () => {
        setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
    };

    const goCurrentMonth = () => {
        const now = new Date();
        setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    };

    const openDayEventsModal = (date: Date, dayEvents: Array<{ id: string; name: string }>) => {
        const formattedDate = date.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

        modal.setTitle(`Eventos del ${formattedDate}`);
        modal.changeContent(
            <FormModalTemplate>
                {dayEvents.length === 0 ? (
                    <p className="text-black">No hay eventos para este dia.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {dayEvents.map((dayEvent) => (
                            <button
                                key={dayEvent.id}
                                onClick={() => {
                                    modal.toggleShown();
                                    router.push(`/nikkai/event/detail/${dayEvent.id}`);
                                }}
                                className="text-left px-3 py-2 rounded-md border border-border text-black hover:bg-black/5"
                            >
                                {dayEvent.name}
                            </button>
                        ))}
                    </div>
                )}
            </FormModalTemplate>,
        );
        modal.toggleShown();
    };

    if (isLoading) {
        return (
            <div className="w-full h-full p-5">
                <div className="w-full h-full bg-background-dark rounded-md p-8 flex items-center justify-center">Cargando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full p-5">
                <div className="w-full h-full bg-background-dark rounded-md p-8 flex items-center justify-center text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-5 overflow-y-auto pb-5">
            <div className="w-full h-full min-h-0 flex flex-col bg-background-dark rounded-md p-5 md:p-8 gap-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-text font-bold text-2xl">CALENDARIO DE EVENTOS</h1>
                    <div className="flex gap-2">
                        <button onClick={goCurrentMonth} className="px-3 py-2 bg-sidebar text-sidebar-text rounded-md border border-border hover:bg-primary-dark">
                            Hoy
                        </button>
                        <button onClick={() => router.push("/nikkai/event/add")} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            + Nuevo Evento
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <button onClick={goPrevMonth} className="px-3 py-1 rounded-md border border-border hover:bg-primary-dark">Anterior</button>
                    <h2 className="text-xl font-semibold text-text capitalize">{monthTitle(visibleMonth)}</h2>
                    <button onClick={goNextMonth} className="px-3 py-1 rounded-md border border-border hover:bg-primary-dark">Siguiente</button>
                </div>

                <div className="bg-primary-light rounded-md border border-border overflow-hidden flex-1 min-h-0 flex flex-col">
                    <div className="grid grid-cols-7 bg-background-light border-b border-border">
                        {WEEK_DAYS.map((weekDay) => (
                            <div key={weekDay} className="p-2 text-sm font-semibold text-center text-text-muted">
                                {weekDay}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 flex-1 min-h-0 overflow-y-auto pb-5">
                        {monthCells.map((day, index) => {
                            if (!day) {
                                return <div key={`empty-${index}`} className="min-h-[10vh] border border-border/50 bg-background-light" />;
                            }

                            const dateKey = toDayKey(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, day);
                            const dayEvents = eventsByDay[dateKey] ?? [];
                            const currentDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);

                            return (
                                <div key={dateKey} className="min-h-[10vh] border border-border/50 p-2 flex flex-col">
                                    <div className="flex items-start justify-between gap-2">
                                        <button
                                            onClick={() => openDayEventsModal(currentDate, dayEvents)}
                                            className="w-fit text-sm font-semibold text-text hover:underline"
                                        >
                                            {day}
                                        </button>
                                        {dayEvents.length > 0 && (
                                            <span className="w-[0.6vw] h-[0.6vw] min-w-[8px] min-h-[8px] rounded-full bg-sidebar-selected mt-1" />
                                        )}
                                    </div>

                                    {dayEvents.length > 0 && (
                                        <button
                                            onClick={() => openDayEventsModal(currentDate, dayEvents)}
                                            className="mt-auto self-end text-xs text-text-muted hover:text-text underline"
                                        >
                                            Ver mas
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
