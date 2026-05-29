"use client";

import Select from "@/components/Inputs/Select";
import TextInput from "@/components/Inputs/TextInput";
import { ConfirmationModal } from "@/components/modal/ConfirmationModalTemplate";
import { FormModalTemplate } from "@/components/modal/FormModalTemplate";
// Modal para asignar número de socio
function AssignMemberNumberModal({ currentNumber, onCancel, onConfirm }: { currentNumber?: number | null, onCancel: () => void, onConfirm: (num: number) => void }) {
    const [value, setValue] = useState(currentNumber?.toString() ?? "");
    const [error, setError] = useState("");
    const handleConfirm = () => {
        const num = Number(value);
        if (!value || isNaN(num) || num <= 0) {
            setError("Ingrese un número válido y mayor a 0");
            return;
        }
        setError("");
        onConfirm(num);
    };
    return (
        <FormModalTemplate>
            <label className="text-black">Ingrese el N° de Socio</label>
            <input
                className="w-full h-10 px-2 outline-none rounded-md border border-background-light text-text"
                type="number"
                min={1}
                value={value}
                onChange={e => setValue(e.target.value)}
                autoFocus
            />
            {error && <span className="text-red-500 text-sm">{error}</span>}
            <div className="flex justify-end gap-2">
                <button className="px-4 py-2 rounded-md bg-gray-200" onClick={onCancel}>Cancelar</button>
                <button className="px-4 py-2 rounded-md bg-blue-500 text-white" onClick={handleConfirm}>Asignar</button>
            </div>
        </FormModalTemplate>
    );
}
import TextWithLabel from "@/components/textWithLabel";
import { useGroupContext } from "@/services/groups/context/context";
import { useMemberContext } from "@/services/members/context/context";
import { useModalContext } from "@/services/modal/context/context";
import { Group } from "@/types/group";
import { formatDateOnly, toDateOnlyApiValue, toDateOnlyInputValue } from "@/utils/functions";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type AssignGroupModalContentProps = {
    groups: Group[];
    currentGroupId?: string | null;
    onCancel: () => void;
    onConfirm: (groupId: string) => void;
};

function AssignGroupModalContent({ groups, currentGroupId, onCancel, onConfirm }: AssignGroupModalContentProps) {
    const [selectedGroupId, setSelectedGroupId] = useState(currentGroupId ?? groups[0]?.id ?? "");
    const hasGroups = groups.length > 0;

    return (
        <div className="flex flex-col gap-4 text-black">
            {!hasGroups ? (
                <p>No hay grupos disponibles para asignar a este socio.</p>
            ) : (
                <>
                    <p>Seleccione el grupo que desea asignar al socio.</p>
                    <Select
                        id="groupId"
                        labelText="Grupo"
                        value={selectedGroupId}
                        onChange={(event) => setSelectedGroupId(event.target.value)}
                    >
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </Select>
                </>
            )}

            <div className="flex justify-end gap-2">
                <button className="px-4 py-2 rounded-md bg-gray-200" onClick={onCancel}>
                    Cancelar
                </button>
                {hasGroups && (
                    <button
                        className="px-4 py-2 rounded-md bg-blue-500 text-white disabled:bg-blue-300"
                        disabled={!selectedGroupId}
                        onClick={() => onConfirm(selectedGroupId)}
                    >
                        {currentGroupId ? "Reasignar" : "Asignar"}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function PrincipalPage() {
    const { selectedItem, updateItem, getById } = useMemberContext();
    const { list: listGroups } = useGroupContext();
    const [isEditing, setIsEditing] = useState(false);

    const modal = useModalContext();

    const { register, getValues, reset } = useForm({
        defaultValues: {
            id: selectedItem?.id ?? "",
            name: selectedItem?.name ?? "",
            surname: selectedItem?.surname ?? "",
            japaneseName: selectedItem?.japaneseName ?? "",
            japaneseSurname: selectedItem?.japaneseSurname ?? "",
            sex: selectedItem?.sex ?? "M",
            birthDate: toDateOnlyInputValue(selectedItem?.birthDate),
            bloodType: selectedItem?.bloodType ?? "",
            phone: selectedItem?.phone ?? "",
            documentNumber: selectedItem?.documentNumber ?? "",
            documentExpDate: toDateOnlyInputValue(selectedItem?.documentExpDate),
            ruc: selectedItem?.ruc ?? "",
            address: selectedItem?.address ?? "",
            email: selectedItem?.email ?? "",
            profession: selectedItem?.profession ?? "",
            workPhone: selectedItem?.workPhone ?? "",
            workAddress: selectedItem?.workAddress ?? "",
        },
    });

    useEffect(() => {
        reset({
            id: selectedItem?.id ?? "",
            name: selectedItem?.name ?? "",
            surname: selectedItem?.surname ?? "",
            japaneseName: selectedItem?.japaneseName ?? "",
            japaneseSurname: selectedItem?.japaneseSurname ?? "",
            sex: selectedItem?.sex ?? "M",
            birthDate: toDateOnlyInputValue(selectedItem?.birthDate),
            bloodType: selectedItem?.bloodType ?? "",
            phone: selectedItem?.phone ?? "",
            documentNumber: selectedItem?.documentNumber ?? "",
            documentExpDate: toDateOnlyInputValue(selectedItem?.documentExpDate),
            ruc: selectedItem?.ruc ?? "",
            address: selectedItem?.address ?? "",
            email: selectedItem?.email ?? "",
            profession: selectedItem?.profession ?? "",
            workPhone: selectedItem?.workPhone ?? "",
            workAddress: selectedItem?.workAddress ?? "",
        });
    }, [reset, selectedItem]);

    const onSubmit = async () => {
        if (!selectedItem || !selectedItem.id) return;
        const values = getValues();
        const payload = {
            ...values,
            birthDate: toDateOnlyApiValue(values.birthDate),
            documentExpDate: toDateOnlyApiValue(values.documentExpDate),
        };
        await updateItem(selectedItem?.id, payload)
        await getById(selectedItem.id).then(ret => {
            if (ret) {
                setIsEditing(false);
                if(ret.id){
                    reset(
                        {
                            id: ret.id,
                            name: ret?.name ?? "",
                            surname: ret?.surname ?? "",
                            japaneseName: ret?.japaneseName ?? "",
                            japaneseSurname: ret?.japaneseSurname ?? "",
                            sex: ret.sex ?? "M",
                            birthDate: toDateOnlyInputValue(ret.birthDate),
                            bloodType: ret?.bloodType ?? "",
                            phone: ret?.phone ?? "",
                            documentNumber: ret?.documentNumber ?? "",
                            documentExpDate: toDateOnlyInputValue(ret.documentExpDate),
                            ruc: ret?.ruc ?? "",
                            address: ret?.address ?? "",
                            email: ret?.email ?? "",
                            profession: ret?.profession ?? "",
                            workPhone: ret?.workPhone ?? "",
                            workAddress: ret?.workAddress ?? "",
                        }
                    )
                }
            } else {                
                modal.setTitle("Error");
                modal.changeContent(
                    <ConfirmationModal
                        text="Error al actualizar el miembro"
                        onCancel={() => modal.toggleShown()}
                        onConfirm={() => modal.toggleShown()}
                    />,
                );
                modal.toggleShown();
            }
        })
    }

    const maskDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return "";
        return formatDateOnly(dateStr);
     }

    const confirmCancelChangesModal = <ConfirmationModal onCancel={() => {modal.toggleShown()}} onConfirm={() => {
            modal.toggleShown();
            reset();
            setIsEditing(false);
        }} text="¿Estás seguro que deseas cancelar los cambios realizados a la información del socio?" />

    const confirmSaveChangesModal = <ConfirmationModal onCancel={() => {modal.toggleShown()}} onConfirm={()=>{
            onSubmit();
            modal.toggleShown();
        }} 
        text="¿Estás seguro que deseas guardar los cambios realizados a la información del socio?" />

    const openAssignGroupModal = async () => {
        if (!selectedItem?.id) return;

        try {
            const groups = await listGroups();

            modal.setTitle(selectedItem.groupId ? "Reasignar grupo" : "Asignar grupo");
            modal.changeContent(
                <AssignGroupModalContent
                    groups={groups}
                    currentGroupId={selectedItem.groupId}
                    onCancel={() => modal.toggleShown()}
                    onConfirm={async (groupId) => {
                        await updateItem(selectedItem.id!, { groupId });
                        await getById(selectedItem.id!);
                        modal.toggleShown();
                    }}
                />,
            );
            modal.toggleShown();
        } catch {
            modal.setTitle("Error");
            modal.changeContent(
                <ConfirmationModal
                    text="Error al cargar los grupos disponibles"
                    onCancel={() => modal.toggleShown()}
                    onConfirm={() => modal.toggleShown()}
                />,
            );
            modal.toggleShown();
        }
    };

    return <>
        {!selectedItem ?<div className="w-full h-full flex items-center justify-center">No se ha seleccionado ningún miembro</div>
        :
        <>
        <div className="flex flex-row justify-between items-center mb-2">
            <p className="text-black">Información del socio</p>
            <div className="flex flex-row gap-2">
                {/* Botón para asignar o quitar N° de Socio */}
                {selectedItem.memberNumber
                    ? <button className="px-4 py-2 bg-orange-500 text-white rounded-md" onClick={() => {
                        modal.setTitle("Quitar N° de Socio");
                        modal.changeContent(
                            <ConfirmationModal
                                text="¿Seguro que deseas quitar el N° de Socio?"
                                onCancel={() => modal.toggleShown()}
                                onConfirm={async () => {
                                    await updateItem(selectedItem.id!, { memberNumber: null });
                                    await getById(selectedItem.id!);
                                    modal.toggleShown();
                                }}
                            />
                        );
                        modal.toggleShown();
                    }}>
                        Quitar N° de Socio
                    </button>
                    : <button className="px-4 py-2 bg-blue-700 text-white rounded-md" onClick={() => {
                        modal.setTitle("Asignar N° de Socio");
                        modal.changeContent(
                            <AssignMemberNumberModal
                                onCancel={() => modal.toggleShown()}
                                onConfirm={async (num) => {
                                    await updateItem(selectedItem.id!, { memberNumber: num });
                                    await getById(selectedItem.id!);
                                    modal.toggleShown();
                                }}
                            />
                        );
                        modal.toggleShown();
                    }}>
                        Asignar N° de Socio
                    </button>
                }
                <button className="px-4 py-2 bg-slate-600 text-white rounded-md" onClick={openAssignGroupModal}>
                    {selectedItem.groupId ? "Reasignar grupo" : "Asignar grupo"}
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={() => {
                    if(isEditing){
                        modal.setTitle("Cancelar cambios");
                        modal.changeContent(confirmCancelChangesModal);
                        modal.toggleShown();
                    } else {
                        setIsEditing(true);
                    }
                }}>
                    {isEditing ? "Cancelar Edición" : "Editar"}
                </button>
                {isEditing && <button className="px-4 py-2 bg-green-500 text-white rounded-md" onClick={()=>{
                    modal.setTitle("Confirmar cambios");
                    modal.changeContent(confirmSaveChangesModal);
                    modal.toggleShown();
                }}>
                    Guardar
                </button>}
            </div>
        </div>
        {isEditing ?
            <div className="rounded-md p-5 bg-surface-card text-black">
                <div className="flex flex-col gap-2">
                    <p className="text-text text-xl font-bold mb-1">本人情報 / Datos Personales del Socio</p>
                    <div className="flex gap-2">
                        <TextInput id="name" {...register("name")} labelText="Nombre" className="flex-1" />
                        <TextInput id="firstName" {...register("surname")} labelText="Apellido" className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                        <TextInput id="japaneseName" {...register("japaneseName")} labelText="名字" className="flex-1" />
                        <TextInput id="firstName" {...register("japaneseSurname")} labelText="名前" className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                        <Select id="sex" {...register("sex")} labelText="性別 / Sexo" className="flex-1">
                            <option value="M">Male / 男性</option>
                            <option value="F">Female / 女性</option>
                        </Select>
                        <TextInput id="birthDate" {...register("birthDate")} labelText="生年月日 / Fecha de Nacimiento" className="flex-1" type="date" />
                        <Select id="bloodType" {...register("bloodType")} labelText="血液型 / Sexo" className="flex-1">
                            <option value="A+">A(+)</option>
                            <option value="A-">A(-)</option>
                            <option value="B+">B(+)</option>
                            <option value="B-">B(-)</option>
                            <option value="AB+">AB(+)</option>
                            <option value="AB-">AB(-)</option>
                            <option value="O+">O(+)</option>
                            <option value="O-">O(-)</option>
                        </Select>
                        <TextInput id="phone" {...register("phone")} labelText="電話・携帯番号 / Tel. Cel." className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                        <TextInput id="ci" {...register("documentNumber")} labelText="身分証明書番号 / C.I." className="flex-1" />
                        <TextInput id="ciExpirationDate" {...register("documentExpDate")} labelText="身分証明書期限 / Fecha de Vencimiento " className="flex-1" type="date" />
                        <TextInput id="ruc" {...register("ruc")} labelText="納税者識別番号 / RUC" className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                        <TextInput id="address" {...register("address")} labelText="住所 / Domicilio Particular" className="flex-[2]" />
                        <TextInput id="email" {...register("email")} labelText="メールアドレス / E-mail" className="flex-[1]" />
                    </div>
                    <p className="text-text text-xl font-bold my-1">本人の職場情報 / Datos Profecionales del Socio</p>
                    <div className="flex gap-2">
                        <TextInput id="profession" {...register("profession")} labelText="職業 / Profesión" className="flex-[2]" />
                        <TextInput id="workPhone" {...register("workPhone")} labelText="勤務先電話番号 / Tel. Cel. del Trabajo" className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                        <TextInput id="workAddress" {...register("workAddress")} labelText="勤務先 / Dirección de Trabajo" className="flex-1" />
                    </div>
                </div>
            </div>
            :
            <div className="rounded-md p-5 bg-surface-card text-black">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row">
                        <TextWithLabel label="N° de Socio">{selectedItem.memberNumber ?? "-"}</TextWithLabel>
                        <TextWithLabel label="Rol / 役割">{selectedItem.role}</TextWithLabel>
                        <TextWithLabel label="Estado / ステータス">{selectedItem.status ?? "-"}</TextWithLabel>
                    </div>
                    <div className="flex flex-row">
                        <TextWithLabel label="Nombre y apellido">{selectedItem.name} {selectedItem.surname}</TextWithLabel>
                        <TextWithLabel label="氏名">{selectedItem.japaneseSurname} {selectedItem.japaneseName}</TextWithLabel>
                    </div>
                    <div className="flex flex-row">
                        <TextWithLabel label="性別 / Sexo" textStyle="text-md">{selectedItem.sex ?? "-"}</TextWithLabel>
                        <TextWithLabel label="生年月日 / Fecha de nacimiento" textStyle="text-md">{selectedItem.birthDate ? maskDate(selectedItem.birthDate) : "-"}</TextWithLabel>
                    </div>
                    <div className="flex flex-row">
                        <TextWithLabel label="身分証明番号 / CI" textStyle="text-md">{selectedItem.documentNumber ?? "-"}</TextWithLabel>
                        <TextWithLabel label="CI Vencimiento" textStyle="text-md">{selectedItem.documentExpDate ? maskDate(selectedItem.documentExpDate) : "-"}</TextWithLabel>
                        <TextWithLabel label="納税者識別番号 / RUC" textStyle="text-md">{selectedItem.ruc ?? "-"}</TextWithLabel>
                    </div>
                    <div className="flex flex-row">
                        <TextWithLabel label="電話番号 / Tel/Cel" textStyle="text-md">{selectedItem.phone ?? "-"}</TextWithLabel>
                        <TextWithLabel label="メール / E-mail" textStyle="text-md">{selectedItem.email ?? "-"}</TextWithLabel>
                        <TextWithLabel label="血液型 / grupo sanguineo" textStyle="text-md">{selectedItem.bloodType ?? "-"}</TextWithLabel>
                    </div>
                    <TextWithLabel label="住所 / domicilio" textStyle="text-md">{selectedItem.address ?? "-"}</TextWithLabel>
                    <div className="flex flex-row">
                        <TextWithLabel label="仕事 / Profesión" textStyle="text-md">{selectedItem.profession ?? "-"}</TextWithLabel>
                        <TextWithLabel label="仕事電話番号 / Tel/Cel del Trabajo" textStyle="text-md">{selectedItem.workPhone ?? "-"}</TextWithLabel>
                    </div>
                    <TextWithLabel label="仕事場 / dirección de profeción" textStyle="text-md">{selectedItem.workAddress ?? "-"}</TextWithLabel>
                    <div className="flex flex-row">
                        <TextWithLabel label="入会日 / Fecha de ingreso" textStyle="text-md">{selectedItem.joinDate? maskDate(selectedItem.joinDate) : "-"}</TextWithLabel>
                        {selectedItem.deathDate && (
                            <TextWithLabel label="死亡日 / Fecha de fallecimiento" textStyle="text-md">{maskDate(selectedItem.deathDate)}</TextWithLabel>
                        )}
                    </div>
                </div>
            </div>
        }</>}
    </>
}
