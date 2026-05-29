"use client";

import TextInput from "@/components/Inputs/TextInput";
import { ConfirmationModal } from "@/components/modal/ConfirmationModalTemplate";
import { FormModalTemplate } from "@/components/modal/FormModalTemplate";
import TextWithLabel from "@/components/textWithLabel";
import { useEventAttendancesContext } from "@/services/event-attendances/context/context";
import { useEventContext } from "@/services/events/context/context";
import { exportEventDetailPdf } from "@/services/events/service";
import { useMemberContext } from "@/services/members/context/context";
import { useModalContext } from "@/services/modal/context/context";
import { Member } from "@/types";
import { Event, EventAttendance } from "@/types/event";
import { formatDateOnly, toDateOnlyApiValue, toDateOnlyInputValue } from "@/utils/functions";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

export default function DetalleEventoPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;

    const modal = useModalContext();
    const { list: searchMember, selectedItem: selectedMember, items: members, getById: getByIdMember } = useMemberContext();
    const searchFormData = useForm({
        defaultValues: {
            memberDocumentNumber: "",
        }
    });

    const { selectedItem, isLoading, error, getById, updateItem, deleteItem, clearError } = useEventContext();
    const [isEditing, setIsEditing] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [formData, setFormData] = useState<Partial<Event>>(selectedItem ?? {});
    const [attendances, setAttendances] = useState<EventAttendance[]>([]);

    const { createItem : createEventAttendance } = useEventAttendancesContext();

    useEffect(() => {
        clearError();
        getById(eventId);
    }, [eventId]);

    useEffect(() => {
        if (selectedItem) {
            setFormData({
                ...selectedItem,
                date: toDateOnlyInputValue(selectedItem.date),
            });
            setAttendances(selectedItem.attendances || []);
        }
    }, [selectedItem]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "maxCapacity" ? (value ? parseInt(value) : undefined) : value
        }));
    };

    const handleUpdate = async () => {
        clearError();
        try {
            const payload: Partial<Event> = {
                date: toDateOnlyApiValue(formData.date),
                name: formData.name,
                description: formData.description,
                location: formData.location,
                maxCapacity: formData.maxCapacity,
                organizedBy: formData.organizedBy,
            };

            await updateItem(eventId, payload);
            setIsEditing(false);
        } catch (err) {
            console.error("Error al actualizar evento:", err);
        }
    };

    const adjustfamilies = (attendances: EventAttendance[]) => {
        const adjustedList: any[] = [];
        attendances.forEach(attendance => {
            if(!attendance.member?.adminParent){
                console.log("Es padre");
                const { name, surname, japaneseName, japaneseSurname, memberNumber } = attendance.member ?? {};
                adjustedList.push({
                    memberNumber,
                    fullName: `${name} ${japaneseName} ${surname} ${japaneseSurname}`,
                    acompanyAmount: 0,
                    acompanyNames: [],
                });
            } else {
                const { name, surname, japaneseName, japaneseSurname, memberNumber } = attendance.member ?? {};
                const parentIndex = adjustedList.findIndex(item => item.memberNumber === attendance.member?.adminParent?.memberNumber);
                if(parentIndex !== -1) {
                    adjustedList[parentIndex].acompanyAmount += 1;
                    adjustedList[parentIndex].acompanyNames.push(`${name} ${japaneseName} ${surname} ${japaneseSurname}`);
                } else {
                    adjustedList.push({
                        memberNumber,
                        fullName: `${name} ${japaneseName} ${surname} ${japaneseSurname}`,
                        acompanyAmount: 0,
                        acompanyNames: [],
                    });
                }
            }
        });
        return adjustedList;
    }

    const alreadyAttended = useMemo(() => {
        if (!selectedItem) return [];
        const array = adjustfamilies(selectedItem.attendances || []);
        return array;
    }, [selectedItem])

    const freeAttendanceSlots = useMemo(() => {
        if (!selectedItem) return 0;
        const maxCapacity = selectedItem.maxCapacity || 0;
        const currentAttendances = Array.isArray(selectedItem.attendances)
            ? selectedItem.attendances.length
            : (typeof selectedItem.attendances === "number" ? selectedItem.attendances : 0);
        return Math.max(0, maxCapacity - currentAttendances);
    }, [selectedItem, alreadyAttended]);

    const handleDelete = async () => {
        clearError();
        try {
            await deleteItem(eventId);
            router.push("/nikkai/event/list");
        } catch (err) {
            console.error("Error al eliminar evento:", err);
        }
    };

    const handleExportEventDetailPdf = async () => {
        if (!selectedItem?.id || isExportingPdf) return;

        try {
            setIsExportingPdf(true);
            const blob = await exportEventDetailPdf(selectedItem.id);
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            const safeName = (selectedItem.name || "evento")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "")
                .slice(0, 40);

            anchor.href = url;
            anchor.download = `evento_${safeName || "detalle"}.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(url);
        } catch (exportError) {
            console.error("Error al exportar PDF de evento:", exportError);
            modal.setTitle("Error");
            modal.changeContent(
                <ConfirmationModal
                    text="No se pudo generar el PDF del evento"
                    onCancel={() => modal.toggleShown()}
                    onConfirm={() => modal.toggleShown()}
                />,
            );
            modal.toggleShown();
        } finally {
            setIsExportingPdf(false);
        }
    };

    function AddParticipantModal({
        member,
        eventId,
        initialFreeAttendanceSlots,
        initiallyAttendedMemberIds,
    }: {
        member?: Member | null;
        eventId: string;
        initialFreeAttendanceSlots: number;
        initiallyAttendedMemberIds: Set<string>;
    }) {

        const [addAssistIdList, setAddAssistIdList] = useState<string[]>([]);
        const [errorMessage, setErrorMessage] = useState<string | null>(null);

        const handleSearchMember = async () => {
            if (searchFormData.getValues("memberDocumentNumber")) {
                const searchData = await searchMember({
                    paginationData: {
                        page: 1,
                        itemsPerPage: 10,
                    },
                    filters: { documentNumber: searchFormData.getValues("memberDocumentNumber") }
                });

                if (searchData.length > 0 && searchData[0].id) {
                    const memberDetails = await getByIdMember(searchData[0].id);
                    console.log("selected member details", memberDetails);
                    modal.changeContent(
                        <AddParticipantModal
                            member={memberDetails}
                            eventId={eventId}
                            initialFreeAttendanceSlots={initialFreeAttendanceSlots}
                            initiallyAttendedMemberIds={initiallyAttendedMemberIds}
                        />,
                    );
                }
            }
        };

        const helpToggleAddAssistId = (id: string) => {
            setAddAssistIdList(prev => {
                if (prev.includes(id)) {
                    return prev.filter(current => current !== id);
                }
                return [...prev, id];
            })
        };

        const handleAddAssistances = async () => {
            if(!eventId) return;
            if(addAssistIdList.length === 0) return;
            addAssistIdList.forEach(async (memberId) => {
                try {
                    await createEventAttendance({
                        eventId,
                        memberId,
                    });
                } catch (err) {
                    console.error("Error al agregar asistencia:", err);
                }
            });
            getById(eventId);
        }

        const alreadyAttending = useCallback((id: string) => {
            return initiallyAttendedMemberIds.has(id);
        }, [initiallyAttendedMemberIds]);

        return <FormModalTemplate>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col w-full gap-4">
                    <TextInput id="searchTerm" labelText="CI del socio" {...searchFormData.register("memberDocumentNumber")} />
                    <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600" onClick={handleSearchMember}>
                        Buscar Socio
                    </button>
                </div>
                {member && <div className="flex flex-col group">
                    <div className="p-3 text-black border-text-muted border-y-2 flex flex-row items-center justify-between">
                        <p>{member.name} {member.surname}</p>
                        {!alreadyAttending(member.id ?? "") ? <input type="checkbox" className="rounded-sm" disabled={false} onClick={() => {
                            helpToggleAddAssistId(member.id ?? "")
                        }} />: <div className="text-green-500">Ya registrado</div>}
                    </div>
                    {(member?.adminDependents && member.adminDependents.length > 0) && member.adminDependents.map((dependent) => (
                        <div key={dependent.id} className="p-3 text-black border-text-muted border-b-2 flex flex-row items-center justify-between">
                            <p>{dependent.name} {dependent.surname} (Dependiente de {member.name} {member.surname})</p>
                            {!alreadyAttending(dependent.id ?? "") ? <input type="checkbox" className="rounded-sm" disabled={false} onClick={() => {
                                helpToggleAddAssistId(dependent.id ?? "")
                            }} />: <div className="text-green-500">Ya registrado</div>}
                        </div>
                    ))}
                </div>}
            </div>
            <div className="flex flex-row justify-between w-full items-center">
                <p className="text-red-500">{errorMessage}</p>
                <div className="flex flex-row gap-2">
                    <button className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 mr-2" onClick={() => modal.toggleShown()}>
                        Cancelar
                    </button>
                    {addAssistIdList.length > 0 && <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600" onClick={() => {
                        // Aquí puedes manejar la lógica para agregar las asistencias utilizando el addAssistIdList
                        console.log("IDs para agregar asistencia:", addAssistIdList);
                        if(addAssistIdList.length > initialFreeAttendanceSlots) {
                            setErrorMessage(`No hay suficientes cupos disponibles para agregar ${addAssistIdList.length} asistencias. Solo quedan ${initialFreeAttendanceSlots} cupos.`);
                            return;
                        }
                        handleAddAssistances();
                        setErrorMessage(null);
                        modal.toggleShown();
                        getById(eventId);
                    }}>
                        Agregar Asistencia
                    </button>}
                </div>
            </div>
        </FormModalTemplate>
    }

    const handleOpenAddAssistModal = useCallback(async () => {
        const event = await getById(eventId);
        const maxCapacity = event.maxCapacity || 0;
        const currentAttendances = Array.isArray(event.attendances)
            ? event.attendances.length
            : (typeof event.attendances === "number" ? event.attendances : 0);
        const attendedIds = new Set(
            Array.isArray(event.attendances)
                ? event.attendances.map((attendance) => attendance.memberId)
                : [],
        );

        modal.setTitle("Agregar Asistencia");
        modal.changeContent(
            <AddParticipantModal
                eventId={event.id}
                initialFreeAttendanceSlots={Math.max(0, maxCapacity - currentAttendances)}
                initiallyAttendedMemberIds={attendedIds}
            />,
        );
        modal.toggleShown();
    }, [eventId, getById, modal]);


    const ConfirmEditModal = <ConfirmationModal onCancel={() => {
        modal.toggleShown();
    }} onConfirm={() => {
        modal.toggleShown();
        handleUpdate();
    }} text="¿Está seguro de que desea guardar los cambios realizados en este evento?" />

    const ConfirmDeleteModal = <ConfirmationModal onCancel={() => {
        modal.toggleShown();
    }} onConfirm={() => {
        modal.toggleShown();
        handleDelete();
    }} text="¿Está seguro de que desea eliminar este evento? Esta acción no se puede deshacer." />

    if (isLoading) return <div className="w-full h-full p-5"><div className="w-full h-full bg-background-dark rounded-md p-8 flex items-center justify-center">Cargando...</div></div>
    if (error) return <div className="w-full h-full p-5"><div className="w-full h-full bg-background-dark rounded-md p-8 flex items-center justify-center text-red-500">Error: {error}</div></div>
    if (!selectedItem) return <div className="w-full h-full p-5"><div className="w-full h-full bg-background-dark rounded-md p-8 flex items-center justify-center">No se encontró el evento</div></div>

    return <div className="p-5 w-full h-full">
        <div className="w-full h-full flex flex-col rounded-md p-5 bg-background-dark">
            <div className="flex flex-row justify-between items-center mb-6">
                <h1 className="text-text text-2xl font-bold">Detalle del Evento</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportEventDetailPdf}
                        className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 disabled:bg-gray-500"
                        disabled={isExportingPdf}
                    >
                        {isExportingPdf ? "Exportando PDF..." : "Exportar PDF"}
                    </button>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        {isEditing ? "Cancelar Edición" : "Editar"}
                    </button>
                    <button
                        onClick={() => {
                            modal.setTitle("Confirmar Eliminación");
                            modal.changeContent(ConfirmDeleteModal);
                            modal.toggleShown();
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                        Eliminar
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {isEditing ? (
                <form className="flex flex-col gap-4">
                    <div className="rounded-md p-5 bg-background-dark border border-text-muted">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <TextInput
                                    id="name"
                                    name="name"
                                    labelText="Nombre del Evento"
                                    value={formData.name || ""}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-4">
                            <div className="flex-1">
                                <label htmlFor="description" className="block text-text-muted font-bold mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description || ""}
                                    onChange={handleChange}
                                    className="w-full p-2 outline-none bg-transparent border-b-2 border-black/60 text-text"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-4">
                            <div className="flex-1">
                                <TextInput
                                    id="date"
                                    name="date"
                                    labelText="Fecha"
                                    type="date"
                                    value={toDateOnlyInputValue(formData.date)}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex-1">
                                <TextInput
                                    id="location"
                                    name="location"
                                    labelText="Ubicación"
                                    value={formData.location || ""}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-4">
                            <div className="flex-1">
                                <TextInput
                                    id="maxCapacity"
                                    name="maxCapacity"
                                    labelText="Capacidad Máxima"
                                    type="number"
                                    value={formData.maxCapacity || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex-1">
                                <TextInput
                                    id="organizedBy"
                                    name="organizedBy"
                                    labelText="Organizado por"
                                    value={formData.organizedBy || ""}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                            Cancelar
                        </button>
                        <div
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 select-none cursor-pointer"
                            onClick={() => {
                                if (isLoading) return;
                                modal.setTitle("Confirmar Edición");
                                modal.changeContent(ConfirmEditModal);
                                modal.toggleShown();
                            }}
                        >
                            {isLoading ? "Guardando..." : "Guardar Cambios"}
                        </div>
                    </div>
                </form>
            ) : (
                <div className="rounded-md p-5 bg-background-dark border border-text-muted flex-1 min-h-0">
                    <div className="flex flex-col h-full gap-4 text-black">
                        <div className="flex flex-row gap-8">
                            <TextWithLabel label="Nombre">{selectedItem.name}</TextWithLabel>
                            <TextWithLabel label="Fecha">
                                {formatDateOnly(selectedItem.date, "es-PY")}
                            </TextWithLabel>
                        </div>

                        <div className="flex flex-row gap-8">
                            <TextWithLabel label="Descripción">{selectedItem.description || "-"}</TextWithLabel>
                        </div>

                        <div className="flex flex-row gap-8">
                            <TextWithLabel label="Ubicación">{selectedItem.location || "-"}</TextWithLabel>
                            <TextWithLabel label="Capacidad Máxima">{selectedItem.maxCapacity || "-"}</TextWithLabel>
                            <TextWithLabel label="Asistencias registradas">{attendances.length}</TextWithLabel>
                        </div>


                        <div className="flex flex-row gap-8 text-sm ">
                            <TextWithLabel label="Organizado por">{selectedItem.organizedBy || "-"}</TextWithLabel>
                            <TextWithLabel label="Creado">{typeof selectedItem.createdAt === 'string' ? new Date(selectedItem.createdAt).toLocaleString() : selectedItem.createdAt?.toLocaleString()}</TextWithLabel>
                        </div>
                        <div className="flex-1 min-h-0">
                            <div className="flex h-full min-h-0 flex-col gap-2">
                                <div className="flex flex-row w-full justify-between items-center">
                                    <h2 className="text-lg font-bold">Asistencias Registradas</h2>
                                    <div className="flex flex-row gap-2">
                                        {freeAttendanceSlots > 0 && <div className="px-3 py-2 bg-blue-500 text-white rounded-md">
                                            {freeAttendanceSlots} / {selectedItem.maxCapacity || 0} cupos disponibles
                                        </div>}
                                        <button onClick={handleOpenAddAssistModal} className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600" disabled={freeAttendanceSlots === 0}>
                                            {freeAttendanceSlots > 0 ? `Agregar Asistencia` : "No hay cupos disponibles"}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar pb-5">
                                    {alreadyAttended.map((attendance, index) => (
                                        <div key={`list-attendance${index}`} className="p-3 rounded-md bg-background-dark border border-text-muted mb-2">
                                            <div className="flex flex-row gap-4">
                                                <p className="w-[10%]">{attendance.memberNumber}</p>
                                                <p className="flex-1">{attendance.fullName}</p>
                                                <p className="w-[15%] text-center">{attendance.acompanyAmount>0? `${attendance.acompanyAmount} Acompañantes`:""}</p>
                                            </div>
                                            {attendance.acompanyNames.length > 0 && <div className="text-text-muted">
                                                {attendance.acompanyNames.map((name: string, index: number) => (
                                                    <div key={index} className="flex flex-row gap-4">
                                                        <p className="w-[10%]"></p>
                                                        <p className="flex-1">{name}</p>
                                                        <p className="w-[15%] text-center"></p>
                                                    </div>
                                                ))}
                                            </div>}
                                        </div>
                                    ))}
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-start mt-6">
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                    ← Volver
                </button>
            </div>
        </div>
    </div>
}
