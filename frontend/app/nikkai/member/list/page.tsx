"use client"

import Filters, { FilterField, FilterValues } from "@/components/Lists/Filters";
import List from "@/components/Lists/List";
import TabbedContainer from "@/components/TabbedContainer";
import { useGroupContext } from "@/services/groups/context/context";
import { useMemberContext } from "@/services/members/context/context";
import { MemberSearchFilters } from "@/services/members/service";
import { exportMembersSearchPdf } from "@/services/members/service";
import { useModalContext } from "@/services/modal/context/context";
import { Group } from "@/types/group";
import { Member } from "@/types/member";
import { PaginationData } from "@/types/paginationData";
import { toDateOnlyRangeEnd, toDateOnlyRangeStart } from "@/utils/functions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type MemberFiltersModalContentProps = {
    fields: FilterField[];
    initialValues: FilterValues;
    onApply: (values: FilterValues) => Promise<void>;
};

function MemberFiltersModalContent({ fields, initialValues, onApply }: MemberFiltersModalContentProps) {
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

export default function ListaSociosPage() {
    const router = useRouter();
    const modal = useModalContext();
    const { items, paginationData, list, getById } = useMemberContext();
    const { items: groupItems, list: listGroups } = useGroupContext();
    const [visibleItems, setVisibleItems] = useState<Member[]>([]);
    const [visiblePaginationData, setVisiblePaginationData] = useState<PaginationData | null>(null);
    const [filters, setFilters] = useState<FilterValues>({});
    const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);

    const filterFields: FilterField[] = [
        { id: "search", label: "Busqueda general", type: "text", placeholder: "Nombre, apellido, nombre japones..." },
        { id: "documentNumber", label: "Nro documento", type: "text", placeholder: "Ej: 1234567" },
        {
            id: "status",
            label: "Estado",
            type: "select",
            options: [
                { label: "Activo", value: "active" },
                { label: "Inactivo", value: "inactive" },
            ],
        },
        {
            id: "deceased",
            label: "Fallecido",
            type: "select",
            options: [
                { label: "Si", value: "true" },
                { label: "No", value: "false" },
            ],
        },
        { id: "adminParentId", label: "Por ID del socio", type: "text", placeholder: "UUID" },
        { id: "birthDateFrom", label: "Nacimiento desde", type: "date" },
        { id: "birthDateTo", label: "Nacimiento hasta", type: "date" },
        {
            id: "nonPrincipalTurning18ThisYear",
            label: "No principal que cumple 18",
            type: "checkbox",
        },
        {
            id: "isSeventyOrMore",
            label: "70 años o mas",
            type: "checkbox",
        },
    ];

    const mapFiltersToApi = (values: FilterValues): MemberSearchFilters => {
        const normalized = Object.entries(values).reduce<Record<string, string>>((acc, [key, value]) => {
            if (value === undefined || value === null) {
                return acc;
            }

            const textValue = `${value}`.trim();
            if (!textValue) {
                return acc;
            }

            acc[key] = textValue;
            return acc;
        }, {});

        return {
            ...(normalized.search ? { search: normalized.search } : {}),
            ...(normalized.documentNumber ? { documentNumber: normalized.documentNumber } : {}),
            ...(normalized.status ? { status: [normalized.status] } : {}),
            ...(normalized.deceased ? { deceased: normalized.deceased === "true" } : {}),
            ...(normalized.hasJapaneseName ? { hasJapaneseName: normalized.hasJapaneseName === "true" } : {}),
            ...(normalized.adminParentId ? { adminParentId: normalized.adminParentId } : {}),
            ...(normalized.birthDateFrom ? { birthDateFrom: toDateOnlyRangeStart(normalized.birthDateFrom) } : {}),
            ...(normalized.birthDateTo ? { birthDateTo: toDateOnlyRangeEnd(normalized.birthDateTo) } : {}),
            ...(normalized.nonPrincipalTurning18ThisYear ? { nonPrincipalTurning18ThisYear: normalized.nonPrincipalTurning18ThisYear === "true" } : {}),
            ...(normalized.isSeventyOrMore ? { isSeventyOrMore: normalized.isSeventyOrMore === "true" } : {}),
        };
    };

    const listMembers = async (page: number, values: FilterValues, groupId?: string) => {
        await list({
            paginationData: { page, itemsPerPage: 10 },
            filters: { ...mapFiltersToApi(values), ...(groupId ? { groupId } : {}) },
        });
    };

    useEffect(() => {
        listGroups({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listGroups]);

    useEffect(() => {
        listMembers(1, filters, selectedGroupId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [list]);

    useEffect(() => {
        setVisibleItems(items);
    }, [items]);

    useEffect(() => {
        setVisiblePaginationData(paginationData);
    }, [paginationData]);

    const onPageChange = async (page: number) => {
        await listMembers(page, filters, selectedGroupId);
    };

    const onTabChange = async (tabIndex: number) => {
        const newGroupId = tabIndex === 0 ? undefined : (groupItems as Group[])[tabIndex - 1]?.id;
        setSelectedGroupId(newGroupId);
        await listMembers(1, filters, newGroupId);
    };

    const openFiltersModal = () => {
        modal.setTitle("Filtros de socios");
        modal.changeContent(
            <MemberFiltersModalContent
                fields={filterFields}
                initialValues={filters}
                onApply={async (newFilters) => {
                    setFilters(newFilters);
                    await listMembers(1, newFilters, selectedGroupId);
                    modal.toggleShown();
                }}
            />,
        );

        if (!modal.shown) {
            modal.toggleShown();
        }
    };

    const handleExportPdf = async () => {
        const blob = await exportMembersSearchPdf({
            paginationData: { page: 1, itemsPerPage: 10 },
            filters: {
                ...mapFiltersToApi(filters),
                ...(selectedGroupId ? { groupId: selectedGroupId } : {}),
            },
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `socios_busqueda_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    const THCOMP = <>
        <th className="w-[15%]">N° Socio</th>
        <th>Nombre y Apellido</th>
        <th className="w-[5%]"></th>
    </>;

    const toTdComponent = (m: Member) => <>
        <td>{m.memberNumber ?? "-"}</td>
        <td>{m.name} {m.japaneseName} {m.japaneseSurname} {m.surname}</td>
        <td>{">"}</td>
    </>;

    const onClickItem = (item: Member) => {
        if (item && item.id) {
            getById(item.id);
            router.push(`/nikkai/member/detail?id=${item.id}`);
        }
    }

    const groupTabs = ["Todos", ...(groupItems as Group[]).map((g) => g.name)];

    return <div className="w-full h-full p-5">
        <div className="w-full h-full bg-background-dark rounded-md p-8 flex flex-col">
            <div className="w-full flex justify-between mb-3">
                <h1 className="text-black font-bold text-2xl">LISTA DE SOCIOS</h1>
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
            <TabbedContainer tabs={groupTabs} onTabChange={onTabChange} />
            <List
                list={visibleItems}
                thComponent={THCOMP}
                toTdComponent={toTdComponent}
                paginationData={visiblePaginationData ?? undefined}
                onPageChange={onPageChange}
                onSelectItem={onClickItem}
            />
        </div>
    </div>
}