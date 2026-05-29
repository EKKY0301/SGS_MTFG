"use client"

import List from "@/components/Lists/List";
import { useEventContext } from "@/services/events/context/context";
import { exportEventsSearchPdf } from "@/services/events/service";
import { Event } from "@/types/event";
import { formatDateOnly } from "@/utils/functions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ListaEventosPage() {
    const router = useRouter();
    const { items, isLoading, error, list, getById, paginationData } = useEventContext()

    useEffect(() => {
        list();
    }, []);

    const onPageChange = async (page: number) => {
        
    };

    const THCOMP = <>
        <th className="w-[30%]">Nombre</th>
        <th className="w-[20%]">Fecha</th>
        <th className="w-[30%]">Ubicación</th>
        <th className="w-[10%]">Capacidad</th>
        <th className="w-[5%]"></th>
    </>

    const toTdComponent = (e: Event) => <>
        <td>{e.name}</td>
        <td>{formatDateOnly(e.date, "es-PY")}</td>
        <td>{e.location ?? "-"}</td>
        <td>{`${Array.isArray(e.attendances)? e.attendances.length: e.attendances} / ${e.maxCapacity}`}</td>
        <td>{">"}</td>
    </>

    const onClickItem = (item: Event) => {
        getById(item.id);
        router.push(`/nikkai/event/detail/${item.id}`);
    }

    const handleExportPdf = async () => {
        const blob = await exportEventsSearchPdf({
            paginationData: { page: 1, itemsPerPage: 10 },
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `eventos_busqueda_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    if (isLoading) return <div className="w-full h-full p-5"><div className="w-full h-full bg-background-dark rounded-md p-8 flex items-center justify-center">Cargando...</div></div>
    if (error) return <div className="w-full h-full p-5"><div className="w-full h-full bg-background-dark rounded-md p-8 flex items-center justify-center text-red-500">Error: {error}</div></div>

    return <div className="w-full h-full p-5">
        <div className="w-full h-full flex flex-col bg-background-dark rounded-md p-8 gap-4">
            <div className="flex justify-between items-center">
                <h1 className="text-text font-bold text-2xl">LISTA DE EVENTOS</h1>
                <div className="flex gap-2">
                    <button onClick={handleExportPdf} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
                        Exportar PDF
                    </button>
                    <button onClick={() => router.push('/nikkai/event/add')} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        + Nuevo Evento
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-auto pb-5">
                <List
                    list={items}
                    thComponent={THCOMP}
                    toTdComponent={toTdComponent}
                    paginationData={paginationData ?? undefined}
                    onPageChange={onPageChange}
                    onSelectItem={onClickItem}
                />
                {items.length === 0 && (
                    <div className="text-center text-text-muted py-8">No hay eventos registrados</div>
                )}
            </div>
        </div>
    </div>
}
