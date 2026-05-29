"use client";

import Select from "@/components/Inputs/Select";
import TextInput from "@/components/Inputs/TextInput";
import { ConfirmationModal } from "@/components/modal/ConfirmationModalTemplate";
import TextWithLabel from "@/components/textWithLabel";
import { useMemberContext } from "@/services/members/context/context";
import { createRelated, establishDeathDate } from "@/services/members/service";
import { useModalContext } from "@/services/modal/context/context";
import { formatDateOnly, toDateOnlyApiValue, toDateOnlyInputValue } from "@/utils/functions";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function mapRelativeForForm(relative?: {
    name?: string | null;
    surname?: string | null;
    japaneseName?: string | null;
    japaneseSurname?: string | null;
    sex?: string | null;
    birthDate?: string | null;
    bloodType?: string | null;
    phone?: string | null;
    documentNumber?: string | null;
    documentExpDate?: string | null;
    ruc?: string | null;
    email?: string | null;
    profession?: string | null;
    workPhone?: string | null;
    workAddress?: string | null;
    deathDate?: string | null;
} | null) {
    return {
        name: relative?.name ?? "",
        surname: relative?.surname ?? "",
        japaneseName: relative?.japaneseName ?? "",
        japaneseSurname: relative?.japaneseSurname ?? "",
        sex: relative?.sex ?? "F",
        birthDate: toDateOnlyInputValue(relative?.birthDate),
        bloodType: relative?.bloodType ?? "",
        phone: relative?.phone ?? "",
        documentNumber: relative?.documentNumber ?? "",
        documentExpDate: toDateOnlyInputValue(relative?.documentExpDate),
        ruc: relative?.ruc ?? "",
        email: relative?.email ?? "",
        profession: relative?.profession ?? "",
        workPhone: relative?.workPhone ?? "",
        workAddress: relative?.workAddress ?? "",
        deathDate: toDateOnlyInputValue(relative?.deathDate),
    };
}

function mapRelativeForApi(relative: ReturnType<typeof mapRelativeForForm>) {
    return {
        ...relative,
        birthDate: toDateOnlyApiValue(relative.birthDate),
        documentExpDate: toDateOnlyApiValue(relative.documentExpDate),
        deathDate: toDateOnlyApiValue(relative.deathDate),
    };
}

export default function ParientsShowPage() {
    const { selectedItem, getById, updateItem, deleteItem } = useMemberContext();
    const modal = useModalContext();
    const [isEditing, setIsEditing] = useState(false);

    if (!selectedItem) return <div className="w-full h-full flex items-center justify-center">No se ha seleccionado ningún miembro</div>;

    const father = selectedItem.father;
    const mother = selectedItem.mother;

    const [isThereFather, setIsThereFather] = useState<boolean>(Boolean(father));
    const [isThereMother, setIsThereMother] = useState<boolean>(Boolean(mother));

    const { register, getValues, reset } = useForm({
        defaultValues: {
            hasFather: Boolean(father),
            hasMother: Boolean(mother),
            father: mapRelativeForForm(father),
            mother: mapRelativeForForm(mother),
        },
    });

    useEffect(() => {
        setIsThereFather(Boolean(father));
        setIsThereMother(Boolean(mother));
        reset({
            hasFather: Boolean(father),
            hasMother: Boolean(mother),
            father: mapRelativeForForm(father),
            mother: mapRelativeForForm(mother),
        });
    }, [father, mother, reset]);

    const handleSaveChanges = async () => {
        const { father, mother, hasFather, hasMother } = getValues();
        if (!selectedItem.id) return;

        if (hasFather && !selectedItem.father) {
            if(father.deathDate === "") {
                const { deathDate, ...fatherWithoutDeathDate } = father;
                const payload = {
                    relation: "dependent-father",
                    ...mapRelativeForApi({ ...mapRelativeForForm(), ...fatherWithoutDeathDate }),
                }
                await createRelated(selectedItem.id, payload);
            }else{
                const { deathDate: _deathDate, ...fatherWithoutDeathDate } = father;
                await createRelated(selectedItem.id, {
                    relation: "dependent-father",
                    ...mapRelativeForApi(father),
                    ...mapRelativeForApi({ ...mapRelativeForForm(), ...fatherWithoutDeathDate }),
                });
            }
        } else if(selectedItem.father) {
            if (!hasFather) {
                await deleteItem(selectedItem.father?.id ?? "");
                setIsThereFather(false);
            }else{
                const fatherId = selectedItem.father?.id;
                if(fatherId) {
                    await updateItem(fatherId, mapRelativeForApi(father));
                }
            }
        } 
        if (hasMother && !selectedItem.mother) {
            if(mother.deathDate === "") {
                const { deathDate, ...motherWithoutDeathDate } = mother;
                const payload = {
                    relation: "dependent-mother",
                    ...mapRelativeForApi({ ...mapRelativeForForm(), ...motherWithoutDeathDate }),
                }
                await createRelated(selectedItem.id, payload);
            }else{
                const { deathDate: _deathDate, ...motherWithoutDeathDate } = mother;
                await createRelated(selectedItem.id, {
                    relation: "dependent-mother",
                    ...mapRelativeForApi(mother),
                    ...mapRelativeForApi({ ...mapRelativeForForm(), ...motherWithoutDeathDate }),
                });
            }
        }else if(selectedItem.mother) {
            if(!hasMother) {
                await deleteItem(selectedItem.mother?.id ?? "");
                setIsThereMother(false);
            } else {
                const motherId = selectedItem.mother?.id;
                if(motherId) {
                    await updateItem(motherId, mapRelativeForApi(mother));
                }
            }
        }

        await rechargeData();
    }

    const rechargeData = async () => {
        if (!selectedItem.id) return;const updated = await getById(selectedItem.id);
        const updatedFather = updated?.father;
        const updatedMother = updated?.mother;
        setIsThereFather(Boolean(updated?.father));
        setIsThereMother(Boolean(updated?.mother));
        reset({
            hasFather: Boolean(updatedFather),
            hasMother: Boolean(updatedMother),
            father: mapRelativeForForm(updatedFather),
            mother: mapRelativeForForm(updatedMother),
        });
        setIsEditing(false);
        modal.changeConfirmCallback(() => {});
    }

    const cancelModalContent = <ConfirmationModal onCancel={() => {modal.toggleShown()}} onConfirm={() => {
                modal.toggleShown();
                setIsEditing(false);
                reset();
                setIsThereFather(Boolean(father));
                setIsThereMother(Boolean(mother));
            }} text="¿Estás seguro que deseas cancelar los cambios? Se perderán los cambios no guardados." />;

    const saveModalContent = <ConfirmationModal onCancel={() => {modal.toggleShown()}} onConfirm={() => {
                modal.toggleShown();
                handleSaveChanges();
            }} text="¿Estás seguro que deseas guardar los cambios? Esta acción no se puede deshacer." />;

    return <>
        <div className="flex flex-row justify-between text-black items-center mb-2">
            <p>Información de parientes dependientes</p>
            <div className="flex flex-row gap-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={() =>{
                        if(isEditing){
                            modal.setTitle("Cancelar edición");
                            modal.changeContent(cancelModalContent);
                            modal.toggleShown();
                        } else {
                            setIsEditing(true);
                        }
                     }}>
                    {isEditing ? "Cancelar Edición" : "Editar"}
                </button>
                {isEditing && <button className="px-4 py-2 bg-green-500 text-white rounded-md" onClick={()=>{
                    modal.setTitle("Guardar cambios");
                    modal.changeContent(saveModalContent);
                    modal.toggleShown();
                }}>
                    Guardar Cambios
                </button>}
            </div>
        </div>
        {isEditing ?
            <div className="flex flex-col gap-2">
                <div className="rounded-md p-5 bg-surface-card text-black">
                    <div className="flex flex-row gap-2 items-center mb-3">
                        <input value={`${isThereFather}`} id="checkToAddFather" {...register("hasFather")} type={"checkbox"} onClick={() => { setIsThereFather(v => !v); }}></input>
                        <label className="text-black" htmlFor="checkToAddFather">父 / Padre dependiente</label>
                        <input value={`${isThereMother}`} id="checkToAddMother" {...register("hasMother")} type={"checkbox"} onClick={() => { setIsThereMother(v => !v); }}></input>
                        <label className="text-black" htmlFor="checkToAddMother">母 / Madre dependiente</label>
                    </div>
                    <div className="flex flex-col gap-2">
                        {isThereFather && <div className="bg-surface-cardAlt p-5 rounded-md">
                            <div className="flex flex-row justify-between w-full items-center">
                                <p className="text-text text-xl font-bold mb-1">父の情報 / Datos Personales del Padre</p>
                                <div className="flex flex-row gap-2 items-cemter">
                                    <TextInput id="ciExpirationDate" {...register("father.deathDate")} labelText = "" className="flex-1" type="date" />
                                    { !father?.deathDate && <button className="px-2 py-1 bg-red-500 text-white rounded-md" onClick={async () => {
                                        if(!selectedItem.father?.id) return;
                                        if(!getValues("father.deathDate")) {
                                            modal.setTitle("Fecha de fallecimiento requerida");
                                            modal.changeContent(<ConfirmationModal onCancel={() => {modal.toggleShown()}} onConfirm={() => {modal.toggleShown()}} text="Por favor ingresa la fecha de fallecimiento para registrar el fallecimiento del padre." />);
                                            return;
                                        }
                                        await establishDeathDate(selectedItem.father?.id ?? "", toDateOnlyApiValue(getValues("father.deathDate")) ?? "");
                                        rechargeData();
                                    }}> Registrar Fallecimiento </button>}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <TextInput id="name" {...register("father.name")} labelText="Nombre" className="flex-1" />
                                <TextInput id="firstName" {...register("father.surname")} labelText="Apellido" className="flex-1" />
                            </div>
                            <div className="flex gap-2">
                                <TextInput id="japaneseName" {...register("father.japaneseName")} labelText="名字" className="flex-1" />
                                <TextInput id="firstName" {...register("father.japaneseSurname")} labelText="名前" className="flex-1" />
                            </div>
                            <div className="flex gap-2">
                                <TextInput id="birthDate" {...register("father.birthDate")} labelText="生年月日 / Fecha de Nacimiento" className="flex-1" type="date" />
                                <Select id="bloodType" {...register("father.bloodType")} labelText="血液型 / Sexo" className="flex-1">
                                    <option value="A+">A(+)</option>
                                    <option value="A-">A(-)</option>
                                    <option value="B+">B(+)</option>
                                    <option value="B-">B(-)</option>
                                    <option value="AB+">AB(+)</option>
                                    <option value="AB-">AB(-)</option>
                                    <option value="O+">O(+)</option>
                                    <option value="O-">O(-)</option>
                                </Select>
                                <TextInput id="phone" {...register("father.phone")} labelText="電話・携帯番号 / Tel. Cel." className="flex-1" />
                            </div>
                            <div className="flex gap-2">
                                <TextInput id="ci" {...register("father.documentNumber")} labelText="身分証明書番号 / C.I." className="flex-1" />
                                <TextInput id="ciExpirationDate" {...register("father.documentExpDate")} labelText="身分証明書期限 / Fecha de Vencimiento " className="flex-1" type="date" />
                                <TextInput id="ruc" {...register("father.ruc")} labelText="納税者識別番号 / RUC" className="flex-1" />
                            </div>
                            <div className="flex gap-2">
                                <TextInput id="email" {...register("father.email")} labelText="メールアドレス / E-mail" className="flex-[1]" />
                            </div>
                            <p className="text-text text-xl font-bold my-1">父の職場情報 / Datos Profecionales del Padre</p>
                            <div className="flex gap-2">
                                <TextInput id="profession" {...register("father.profession")} labelText="職業 / Profesión" className="flex-[2]" />
                                <TextInput id="workPhone" {...register("father.workPhone")} labelText="勤務先電話番号 / Tel. Cel. del Trabajo" className="flex-1" />
                            </div>
                            <div className="flex gap-2">
                                <TextInput id="workAddress" {...register("father.workAddress")} labelText="勤務先 / Dirección de Trabajo" className="flex-1" />
                            </div>
                        </div>}
                        {isThereMother && <div className="bg-surface-cardAlt p-5 rounded-md">
                            <div className="flex flex-row justify-between w-full items-center">
                                <p className="text-text text-xl font-bold mb-1">母の情報 / Datos Personales de la Madre</p>
                                <div className="flex flex-row gap-2 items-cemter">
                                    <TextInput id="ciExpirationDate" {...register("mother.deathDate")} labelText = "" className="flex-1" type="date" />
                                    { !mother?.deathDate && <button className="px-2 py-1 bg-red-500 text-white rounded-md" onClick={async () => {
                                        if(!selectedItem.mother?.id) return;
                                        if(!getValues("mother.deathDate")) {
                                            modal.setTitle("Fecha de fallecimiento requerida");
                                            modal.changeContent(<ConfirmationModal onCancel={() => {modal.toggleShown()}} onConfirm={() => {modal.toggleShown()}} text="Por favor ingresa la fecha de fallecimiento para registrar el fallecimiento de la madre." />);
                                            return;
                                        }
                                        await establishDeathDate(selectedItem.mother?.id ?? "", toDateOnlyApiValue(getValues("mother.deathDate")) ?? "");
                                        rechargeData();
                                    }}> Registrar Fallecimiento </button>}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <TextInput id="name" {...register("mother.name")} labelText="Nombre" className="flex-1" />
                                <TextInput id="firstName" {...register("mother.surname")} labelText="Apellido" className="flex-1" />
                            </div>
                            <div className="flex gap-2">
                                <TextInput id="japaneseName" {...register("mother.japaneseName")} labelText="名字" className="flex-1" />
                                <TextInput id="firstName" {...register("mother.japaneseSurname")} labelText="名前" className="flex-1" />
                            </div>
                            <div className="flex gap-2">
                                <Select id="sex" {...register("mother.sex")} labelText="性別 / Sexo" className="flex-1">
                                    <option value="M">Male / 男性</option>
                                    <option value="F">Female / 女性</option>
                                </Select>
                                <TextInput id="birthDate" {...register("mother.birthDate")} labelText="生年月日 / Fecha de Nacimiento" className="flex-1" type="date" />
                                <Select id="bloodType" {...register("mother.bloodType")} labelText="血液型 / Sexo" className="flex-1">
                                    <option value="A+">A(+)</option>
                                    <option value="A-">A(-)</option>
                                    <option value="B+">B(+)</option>
                                    <option value="B-">B(-)</option>
                                    <option value="AB+">AB(+)</option>
                                    <option value="AB-">AB(-)</option>
                                    <option value="O+">O(+)</option>
                                    <option value="O-">O(-)</option>
                                </Select>
                                <TextInput id="phone" {...register("mother.phone")} labelText="電話・携帯番号 / Tel. Cel." className="flex-1" />
                            </div>
                            <div className="flex gap-2">
                                <TextInput id="ci" {...register("mother.documentNumber")} labelText="身分証明書番号 / C.I." className="flex-1" />
                                <TextInput id="ciExpirationDate" {...register("mother.documentExpDate")} labelText="身分証明書期限 / Fecha de Vencimiento " className="flex-1" type="date" />
                                <TextInput id="ruc" {...register("mother.ruc")} labelText="納税者識別番号 / RUC" className="flex-1" />
                            </div>
                            <div className="flex gap-2">
                                <TextInput id="email" {...register("mother.email")} labelText="メールアドレス / E-mail" className="flex-[1]" />
                            </div>
                            <p className="text-text text-xl font-bold my-1">母の職場情報 / Datos Profecionales de la Madre</p>
                            <div className="flex gap-2">
                                <TextInput id="profession" {...register("mother.profession")} labelText="職業 / Profesión" className="flex-[2]" />
                                <TextInput id="workPhone" {...register("mother.workPhone")} labelText="勤務先電話番号 / Tel. Cel. del Trabajo" className="flex-1" />
                            </div>
                            <div className="flex gap-2">
                                <TextInput id="workAddress" {...register("mother.workAddress")} labelText="勤務先 / Dirección de Trabajo" className="flex-1" />
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
            :
            <>
                {(!father && !mother) &&
                    <div className="relative w-full h-full">
                        <p className="absolute top-[50%] -translate-y-[50%] left-[50%] -translate-x-[50%] text-text text-md font-bold mb-1">扶養家族はいません / No tiene familiares dependientes</p>
                    </div>
                }
                {father &&
                    <div className="rounded-md p-5 bg-surface-card text-black">
                        <div className="flex flex-row justify-between w-full items-center mb-3">
                            <p className="text-text text-xl flex-[2] font-bold mb-1">父の情報 / Información del padre dependiente</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row">
                                <TextWithLabel label="Nombre y apellido">{father.name} {father.surname}</TextWithLabel>
                                <TextWithLabel label="氏名">{father.japaneseSurname} {father.japaneseName}</TextWithLabel>
                            </div>
                            <div className="flex flex-row">
                                <TextWithLabel label="生年月日 / Fecha de nacimiento" textStyle="text-md">{formatDateOnly(father.birthDate)}</TextWithLabel>
                                <TextWithLabel label="身分証明書期限 / Venc. C.I." textStyle="text-md">{formatDateOnly(father.documentExpDate)}</TextWithLabel>
                            </div>
                            <div className="flex flex-row">
                                <TextWithLabel label="身分証明番号 / CI" textStyle="text-md">{father.documentNumber ?? "-"}</TextWithLabel>
                                {father.ruc !== "" && <TextWithLabel label="納税者識別番号 / RUC" textStyle="text-md">{father.ruc !== "" ? father.ruc ?? "-" : "-"}</TextWithLabel>}
                                <TextWithLabel label="電話番号 / Tel/Cel" textStyle="text-md">{father.phone !== ""? father.phone ?? "-" : "-"}</TextWithLabel>
                            {father.deathDate && <TextWithLabel label="死亡日 / Fecha de fallecimiento" textStyle="text-md">{formatDateOnly(father.deathDate)}</TextWithLabel>}
                            </div>
                        </div>
                    </div>
                }
                {mother &&
                    <div className="rounded-md p-5 bg-surface-card text-black">
                        <p className="text-text text-xl font-bold mb-1">母の情報 / Información de la madre dependiente</p>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row">
                                <TextWithLabel label="Nombre y apellido">{mother.name} {mother.surname}</TextWithLabel>
                                <TextWithLabel label="氏名">{mother.japaneseSurname} {mother.japaneseName}</TextWithLabel>
                            </div>
                            <div className="flex flex-row">
                                <TextWithLabel label="生年月日 / Fecha de nacimiento" textStyle="text-md">{formatDateOnly(mother.birthDate)}</TextWithLabel>
                                <TextWithLabel label="身分証明書期限 / Venc. C.I." textStyle="text-md">{formatDateOnly(mother.documentExpDate)}</TextWithLabel>
                            </div>
                            <div className="flex flex-row">
                                <TextWithLabel label="身分証明番号 / CI" textStyle="text-md">{mother.documentNumber ?? "-"}</TextWithLabel>
                                {mother.ruc !== "" && <TextWithLabel label="納税者識別番号 / RUC" textStyle="text-md">{mother.ruc ?? "-"}</TextWithLabel>}
                                <TextWithLabel label="電話番号 / Tel/Cel" textStyle="text-md">{mother.phone!== ""? mother.phone ?? "-" : "-"}</TextWithLabel>
                            </div>
                        </div>
                    </div>
                }
            </>
        }
    </>;
}


