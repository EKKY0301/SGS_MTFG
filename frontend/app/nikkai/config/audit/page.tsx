"use client"

import Filters, { FilterField, FilterValues } from "@/components/Lists/Filters";
import List from "@/components/Lists/List";
import { exportAuditLogsPdf, searchAuditLogs } from "@/services/audit-logs/service";
import { useModalContext } from "@/services/modal/context/context";
import { AuditLog, PaginationData } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";

type AuditFiltersModalContentProps = {
    fields: FilterField[];
    initialValues: FilterValues;
    onApply: (values: FilterValues) => Promise<void>;
};

function AuditFiltersModalContent({ fields, initialValues, onApply }: AuditFiltersModalContentProps) {
    const [localFilters, setLocalFilters] = useState<FilterValues>(initialValues);

    return (
        <div className="flex flex-col gap-3">
            <Filters
                fields={fields}
                values={localFilters}
                onFiltersChange={setLocalFilters}
                onApply={() => onApply(localFilters)}
                showApplyButton
            />
        </div>
    );
}

const filterFields: FilterField[] = [
    { id: "from", label: "Desde", type: "date" },
    { id: "to", label: "Hasta", type: "date" },
];

function toDateStartIso(dateStr: string): string {
    return `${dateStr}T00:00:00.000Z`;
}

function toDateEndIso(dateStr: string): string {
    return `${dateStr}T23:59:59.999Z`;
}

function getCurrentYearRange() {
    const year = new Date().getFullYear();
    const from = `${year}-01-01`;
    const to = `${year}-12-31`;
    return { from, to };
}

function toDisplayDate(dateValue: string | Date): string {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("es-AR");
}

export default function AuditPage() {
    const modal = useModalContext();
    const [items, setItems] = useState<AuditLog[]>([]);
    const [paginationData, setPaginationData] = useState<PaginationData | null>(null);
    const [filters, setFilters] = useState<FilterValues>({});

    const mapFiltersToApi = useCallback((values: FilterValues) => {
        const fromValue = typeof values.from === "string" ? values.from.trim() : "";
        const toValue = typeof values.to === "string" ? values.to.trim() : "";

        return {
            ...(fromValue ? { from: toDateStartIso(fromValue) } : {}),
            ...(toValue ? { to: toDateEndIso(toValue) } : {}),
        };
    }, []);

    const handleExportPdf = async () => {
        const fromValue = typeof filters.from === "string" ? filters.from.trim() : "";
        const toValue = typeof filters.to === "string" ? filters.to.trim() : "";

        const exportFilterValues: FilterValues =
            !fromValue && !toValue
                ? { ...filters, ...getCurrentYearRange() }
                : filters;

        const blob = await exportAuditLogsPdf({
            paginationData: { page: 1, itemsPerPage: 10 },
            filters: mapFiltersToApi(exportFilterValues),
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `auditoria_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    const listAuditLogs = useCallback(
        async (page: number, values: FilterValues) => {
            const response = await searchAuditLogs({
                paginationData: { page, itemsPerPage: 10 },
                filters: mapFiltersToApi(values),
            });

            setItems(response.data);
            setPaginationData({
                page: response.page,
                limit: response.limit,
                total: response.total,
                totalPages: response.totalPages,
            });
        },
        [mapFiltersToApi],
    );

    useEffect(() => {
        listAuditLogs(1, filters);
    }, [filters, listAuditLogs]);

    const onPageChange = async (page: number) => {
        await listAuditLogs(page, filters);
    };

    const openFiltersModal = () => {
        modal.setTitle("Filtros de auditoria");
        modal.changeContent(
            <AuditFiltersModalContent
                fields={filterFields}
                initialValues={filters}
                onApply={async (newFilters) => {
                    setFilters(newFilters);
                    modal.toggleShown();
                }}
            />,
        );

        if (!modal.shown) {
            modal.toggleShown();
        }
    };

    const THCOMP = useMemo(
        () => (
            <>
                <th className="w-[20%]">Fecha</th>
                <th className="w-[20%]">Usuario</th>
                <th className="w-[20%]">Entidad</th>
                <th className="w-[20%]">Accion</th>
                <th className="w-[20%]">ID Entidad</th>
            </>
        ),
        [],
    );

    const toTdComponent = (auditLog: AuditLog) => (
        <>
            <td>{toDisplayDate(auditLog.createdAt)}</td>
            <td>{auditLog.user?.username ?? "-"}</td>
            <td>{auditLog.entity}</td>
            <td>{auditLog.action}</td>
            <td>{auditLog.entityId}</td>
        </>
    );

    return (
        <div className="w-full h-full p-5">
            <div className="w-full h-full bg-background-dark rounded-md p-8 flex flex-col">
                <div className="w-full flex justify-between mb-3">
                    <h1 className="text-black font-bold text-2xl">HISTORIAL DE AUDITORIA</h1>
                    <div className="flex gap-2">
                        <button
                            className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            onClick={handleExportPdf}
                        >
                            Exportar PDF
                        </button>
                        <button
                            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            onClick={openFiltersModal}
                        >
                            Filtros
                        </button>
                    </div>
                </div>
                <List
                    list={items}
                    thComponent={THCOMP}
                    toTdComponent={toTdComponent}
                    paginationData={paginationData ?? undefined}
                    onPageChange={onPageChange}
                />
            </div>
        </div>
    );
}
