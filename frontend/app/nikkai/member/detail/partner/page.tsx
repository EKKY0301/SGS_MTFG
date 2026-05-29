"use client";

import Select from "@/components/Inputs/Select";
import TextInput from "@/components/Inputs/TextInput";
import { ConfirmationModal } from "@/components/modal/ConfirmationModalTemplate";
import TextWithLabel from "@/components/textWithLabel";
import { useMemberContext } from "@/services/members/context/context";
import { useModalContext } from "@/services/modal/context/context";
import { formatDateOnly, toDateOnlyApiValue, toDateOnlyInputValue } from "@/utils/functions";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

export default function PartnerShowPage() {
    const { selectedItem, updateItem } = useMemberContext();
    const modal = useModalContext();
    const [isEditing, setIsEditing] = useState(false);
    const [spouse, setSpouse] = useState(selectedItem?.partner ?? null);
    if (!selectedItem) return <div className="w-full h-full flex items-center justify-center">No se ha seleccionado ningún miembro</div>

    useEffect(() => {
        setSpouse(selectedItem.partner ?? null);
    }, [selectedItem.partner])

    const { register, getValues, setValue, reset } = useForm({
        defaultValues: {
            hasPartner: Boolean(spouse),
            partner: {
                name: spouse?.name ?? "",
                surname: spouse?.surname ?? "",
                japaneseName: spouse?.japaneseName ?? "",
                japaneseSurname: spouse?.japaneseSurname ?? "",
                sex: spouse?.sex ?? "M",
                birthDate: toDateOnlyInputValue(spouse?.birthDate),
                bloodType: spouse?.bloodType ?? "",
                phone: spouse?.phone ?? "",
                documentNumber: spouse?.documentNumber ?? "",
                documentExpDate: toDateOnlyInputValue(spouse?.documentExpDate),
                ruc: spouse?.ruc ?? "",
                email: spouse?.email ?? "",
                profession: spouse?.profession ?? "",
                workPhone: spouse?.workPhone ?? "",
                workAddress: spouse?.workAddress ?? "",
            },
        },
    });

    useEffect(() => {
        reset({
            hasPartner: Boolean(spouse),
            partner: {
                name: spouse?.name ?? "",
                surname: spouse?.surname ?? "",
                japaneseName: spouse?.japaneseName ?? "",
                japaneseSurname: spouse?.japaneseSurname ?? "",
                sex: spouse?.sex ?? "M",
                birthDate: toDateOnlyInputValue(spouse?.birthDate),
                bloodType: spouse?.bloodType ?? "",
                phone: spouse?.phone ?? "",
                documentNumber: spouse?.documentNumber ?? "",
                documentExpDate: toDateOnlyInputValue(spouse?.documentExpDate),
                ruc: spouse?.ruc ?? "",
                email: spouse?.email ?? "",
                profession: spouse?.profession ?? "",
                workPhone: spouse?.workPhone ?? "",
                workAddress: spouse?.workAddress ?? "",
            },
        });
    }, [reset, spouse]);

    const onSubmit = () => {
        if (!isEditing) return;

        const values = getValues();

        if (!!spouse && spouse.id) {
            const payload = {
                ...values.partner,
                birthDate: toDateOnlyApiValue(values.partner.birthDate),
                documentExpDate: toDateOnlyApiValue(values.partner.documentExpDate),
            };

            updateItem(spouse.id, payload).then(ret => {
                setIsEditing(false);
                setValue("partner", {
                    name: ret?.name ?? "",
                    surname: ret?.surname ?? "",
                    japaneseName: ret?.japaneseName ?? "",
                    japaneseSurname: ret?.japaneseSurname ?? "",
                    sex: ret?.sex ?? "M",
                    birthDate: toDateOnlyInputValue(ret?.birthDate),
                    bloodType: ret?.bloodType ?? "",
                    phone: ret?.phone ?? "",
                    documentNumber: ret?.documentNumber ?? "",
                    documentExpDate: toDateOnlyInputValue(ret?.documentExpDate),
                    ruc: ret?.ruc ?? "",
                    email: ret?.email ?? "",
                    profession: ret?.profession ?? "",
                    workPhone: ret?.workPhone ?? "",
                    workAddress: ret?.workAddress ?? "",
                });
                setSpouse(ret ?? null);
            }).catch(() => {
                modal.setTitle("Error");
                modal.changeContent(
                    <ConfirmationModal
                        text="Error al actualizar la información de la pareja"
                        onCancel={() => modal.toggleShown()}
                        onConfirm={() => modal.toggleShown()}
                    />,
                );
                modal.toggleShown();
            })
        }
    }

    const ConfirmCancelChangesModal = <ConfirmationModal onCancel={() => {modal.toggleShown()}} onConfirm={() => {
        modal.toggleShown();
        reset()
        setIsEditing(false);
        }} text="¿Estás seguro que deseas cancelar los cambios realizados a la información de la pareja?" />

    const ConfirmSaveChangesModal = <ConfirmationModal onCancel={() => {modal.toggleShown()}} onConfirm={() => {
        modal.toggleShown();
        onSubmit();
        }} text="¿Estás seguro que deseas guardar los cambios realizados a la información de la pareja?" />


    return <>
        <div className="flex flex-row justify-between items-center mb-2">
            <p className="text-black">Información de la pareja</p>
            <div className="flex flex-row gap-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={() => {
                    if(isEditing){
                        modal.setTitle("Cancelar cambios");
                        modal.changeContent(ConfirmCancelChangesModal);
                        modal.toggleShown();
                    } else {
                        setIsEditing(true);
                    }
                }}>
                    {isEditing ? "Cancelar Edición" : "Editar"}
                </button>
                {isEditing && <button className="px-4 py-2 bg-green-500 text-white rounded-md" onClick={() =>{
                    modal.setTitle("Confirmar cambios");
                    modal.changeContent(ConfirmSaveChangesModal);
                    modal.toggleShown();
                }} >
                    Guardar
                </button>}
            </div>
        </div>
        {isEditing ?
            <div className="rounded-md p-5 bg-surface-card text-black">
                <div className="flex flex-col gap-2 flex-1">
                    <p className="text-text text-xl font-bold mb-1">夫・妻の情報 / Datos Personales del Esposo/a del Socio</p>
                    <div className="flex gap-2">
                        <TextInput id="name" {...register("partner.name")} labelText="Nombre" className="flex-1" />
                        <TextInput id="firstName" {...register("partner.surname")} labelText="Apellido" className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                        <TextInput id="japaneseName" {...register("partner.japaneseName")} labelText="名字" className="flex-1" />
                        <TextInput id="firstName" {...register("partner.japaneseSurname")} labelText="名前" className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                        <Select id="sex" {...register("partner.sex")} labelText="性別 / Sexo" className="flex-1">
                            <option value="M">Male / 男性</option>
                            <option value="F">Female / 女性</option>
                        </Select>
                        <TextInput id="birthDate" {...register("partner.birthDate")} labelText="生年月日 / Fecha de Nacimiento" className="flex-1" type="date" />
                        <Select id="bloodType" {...register("partner.bloodType")} labelText="血液型 / Sexo" className="flex-1">
                            <option value="A+">A(+)</option>
                            <option value="A-">A(-)</option>
                            <option value="B+">B(+)</option>
                            <option value="B-">B(-)</option>
                            <option value="AB+">AB(+)</option>
                            <option value="AB-">AB(-)</option>
                            <option value="O+">O(+)</option>
                            <option value="O-">O(-)</option>
                        </Select>
                        <TextInput id="phone" {...register("partner.phone")} labelText="電話・携帯番号 / Tel. Cel." className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                        <TextInput id="ci" {...register("partner.documentNumber")} labelText="身分証明書番号 / C.I." className="flex-1" />
                        <TextInput id="ciExpirationDate" {...register("partner.documentExpDate")} labelText="身分証明書期限 / Fecha de Vencimiento " className="flex-1" type="date" />
                        <TextInput id="ruc" {...register("partner.ruc")} labelText="納税者識別番号 / RUC" className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                        <TextInput id="email" {...register("partner.email")} labelText="メールアドレス / E-mail" className="flex-[1]" />
                    </div>
                    <p className="text-text text-xl font-bold my-1">夫・妻の職場情報 / Datos Profecionales del Socio</p>
                    <div className="flex gap-2">
                        <TextInput id="profession" {...register("partner.profession")} labelText="職業 / Profesión" className="flex-[2]" />
                        <TextInput id="workPhone" {...register("partner.workPhone")} labelText="勤務先電話番号 / Tel. Cel. del Trabajo" className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                        <TextInput id="workAddress" {...register("partner.workAddress")} labelText="勤務先 / Dirección de Trabajo" className="flex-1" />
                    </div>
                </div>
            </div>
            :
            spouse ? <div className="rounded-md p-5 bg-surface-card text-black">
                <div className="flex flex-col gap-2">
                    <p className="text-text text-xl font-bold mb-1">{(spouse.sex ?? "M") === "M" ? "夫" : "妻"}の情報 / Información de la pareja</p>
                    <div className="flex flex-row">
                        <TextWithLabel label="Nombre y apellido">{spouse.name} {spouse.surname}</TextWithLabel>
                        <TextWithLabel label="氏名">{spouse.japaneseSurname} {spouse.japaneseName}</TextWithLabel>
                    </div>
                    <div className="flex flex-row">
                        <TextWithLabel label="性別 / Sexo" textStyle="text-md">{spouse.sex ?? "-"}</TextWithLabel>
                        <TextWithLabel label="生年月日 / Fecha de nacimiento" textStyle="text-md">{spouse.birthDate ? formatDateOnly(spouse.birthDate) : "-"}</TextWithLabel>
                    </div>
                    <div className="flex flex-row">
                        <TextWithLabel label="身分証明番号 / CI" textStyle="text-md">{spouse.documentNumber ?? "-"}</TextWithLabel>
                        <TextWithLabel label="身分証明書期限 / Fecha de Vencimiento" textStyle="text-md">{spouse.documentExpDate ? formatDateOnly(spouse.documentExpDate) : "-"}</TextWithLabel>
                        {spouse.ruc &&
                            <TextWithLabel label="納税者識別番号 / RUC" textStyle="text-md">{spouse.ruc}</TextWithLabel>
                        }
                        <TextWithLabel label="電話番号 / Tel/Cel" textStyle="text-md">{spouse.phone ?? "-"}</TextWithLabel>
                    </div>
                    {spouse.address &&
                        <TextWithLabel label="住所 / domicilio" textStyle="text-md">{spouse.address}</TextWithLabel>
                    }
                    {spouse.profession &&
                        <>
                            <div className="flex flex-row">
                                <TextWithLabel label="仕事 / Profesión" textStyle="text-md">{spouse.profession}</TextWithLabel>
                                <TextWithLabel label="仕事電話番号 / Tel/Cel del Trabajo" textStyle="text-md">{spouse.workPhone ?? "-"}</TextWithLabel>
                            </div>
                            <TextWithLabel label="仕事場 / dirección de profeción" textStyle="text-md">{spouse.workAddress ?? "-"}</TextWithLabel>
                        </>
                    }
                    <div className="flex flex-row">
                        <TextWithLabel label="メール / E-mail" textStyle="text-md">{spouse.email ?? "Sin email"}</TextWithLabel>
                        <TextWithLabel label="血液型 / grupo sanguineo" textStyle="text-md">{spouse.bloodType ?? "-"}</TextWithLabel>
                    </div>
                </div>
            </div>
                :
                <div className="relative w-full h-full">
                    <p className="absolute top-[50%] -translate-y-[50%] left-[50%] -translate-x-[50%] text-text text-md font-bold mb-1">夫・妻はいません / No tiene pareja</p>
                </div>
        }
    </>
}
