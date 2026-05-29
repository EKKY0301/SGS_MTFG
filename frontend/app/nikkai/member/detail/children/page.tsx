"use client";

import Select from "@/components/Inputs/Select";
import TextInput from "@/components/Inputs/TextInput";
import { ConfirmationModal } from "@/components/modal/ConfirmationModalTemplate";
import ScrollArea from "@/components/ScrollArea";
import TextWithLabel from "@/components/textWithLabel";
import { useMemberContext } from "@/services/members/context/context";
import { createChildren } from "@/services/members/service";
import { useModalContext } from "@/services/modal/context/context";
import { Member } from "@/types/member";
import { formatDateOnly, toDateOnlyApiValue, toDateOnlyInputValue } from "@/utils/functions";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

type ChildrenFormValues = {
    children: Partial<Member>[];
    newChildren: Partial<Member>[];
};

export default function PartnerShowPage() {
    const { selectedItem, getById, updateItem, deleteItem } = useMemberContext();
    const modal = useModalContext();
    const [isEditing, setIsEditing] = useState(false);
    
    const fixTime = (m: Member) :Member => {
        if (m.birthDate) m.birthDate = toDateOnlyInputValue(m.birthDate);
        if (m.documentExpDate) m.documentExpDate = toDateOnlyInputValue(m.documentExpDate);
        return m;
    }

    const mapChildForApi = (child: Partial<Member>): Partial<Member> => ({
        ...child,
        birthDate: toDateOnlyApiValue(child.birthDate),
        documentExpDate: toDateOnlyApiValue(child.documentExpDate),
    });

    const [children, setChildren] = useState<Partial<Member>[]>(() => {
        if (!selectedItem || !selectedItem.adminDependents) return [];
        return selectedItem.adminDependents.map((child) => fixTime(child)).filter((c)=>{
            if(c.role === "child") return true;
            return false;
        });
    });

    if (!selectedItem) return <div className="w-full h-full flex items-center justify-center">No se ha seleccionado ningún miembro</div>

    const childrenList = useCallback(()=> {
        if (!selectedItem || !selectedItem.adminDependents) return [];
        return selectedItem.adminDependents.map((child) => fixTime(child)).filter((c)=>{
            if(c.role === "child") return true;
            return false;
        });
    }, [selectedItem]);
    
    const form = useForm<ChildrenFormValues>({
        defaultValues: {
            children: childrenList(),
            newChildren: [],
        },
    });

    const { register, control } = form;

    const { fields, remove } = useFieldArray({
        control,
        name: "children",
    });

    const { fields: newChildrenFields, remove: newChildrenRemove, append } = useFieldArray({
        control,
        name: "newChildren",
    });

    useEffect(() => {
        const mappedChildren = childrenList();
        setChildren(mappedChildren);
        form.reset({
            children: mappedChildren,
            newChildren: [],
        });
    }, [childrenList, form, selectedItem]);

    const handleSaveChildren = async () => {
        if (!selectedItem) return;
        const updatedChildren = form.getValues("children");
        const newChildren = form.getValues("newChildren");
        if (selectedItem.id) {
            const originalIds = (selectedItem.adminDependents ?? []).map((c) => c.id).filter(Boolean) as string[];
            const keptIds = updatedChildren.map((c) => c.id).filter(Boolean) as string[];
            const removedIds = originalIds.filter((id) => !keptIds.includes(id));

            await Promise.all(removedIds.map((id) => deleteItem(id)));

            await Promise.all(
                updatedChildren
                    .filter((element) => element.id)
                    .map((element) => updateItem(element.id as string, mapChildForApi(element))),
            );

            if (newChildren.length > 0) {
                await createChildren(selectedItem.id, newChildren.map(mapChildForApi));
            }

            const refreshedMember = await getById(selectedItem.id);
            const mapped = refreshedMember.adminDependents?.map((child) => fixTime(child)) ?? [];
            form.reset({
                children: childrenList(),
                newChildren: [],
            });
            setIsEditing(false);
        }
    };

    const handleRemoveChildren = async (index: number) => {
        try{
            const childToRemove = form.getValues(`children.${index}`);
            deleteItem(childToRemove.id || "");
        }catch(error){
            console.error("Error al eliminar el hijo: ", error);
        }finally{
            if(!selectedItem.id) return 
            const refreshedMember = await getById(selectedItem.id);
            const mapped = refreshedMember.adminDependents?.map((child) => fixTime(child)) ?? [];
            setChildren(mapped);
            form.reset({
                children: mapped,
                newChildren: [],
            });
            setIsEditing(false);
        }
    }

    const ConfirmSaveChildrenModal = <ConfirmationModal onCancel={() => {modal.toggleShown()}} onConfirm={() => {
        modal.toggleShown();
        handleSaveChildren();
    }} text="¿Estás seguro que deseas guardar los cambios realizados a los hijos?" />

    const ConfirmCnacelChangesModal = <ConfirmationModal onCancel={() => {modal.toggleShown()}} onConfirm={() => {
        modal.toggleShown();
        form.reset({
            children: childrenList(),
            newChildren: [],
        });
        setIsEditing(false);
    }} text="¿Estás seguro que deseas cancelar los cambios realizados a los hijos?" />

    const ConfirmDeleteChildrenModal = <ConfirmationModal onCancel={() => {modal.toggleShown()}} onConfirm={() => {
        modal.toggleShown();
    }} text="¿Estás seguro que deseas eliminar este hijo?" />
        

    return <>
        <div className="flex flex-row text-black justify-between items-center">
            <p> Lista de Hijos</p>
            <div className="flex flex-row gap-2 mb-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={() => {
                    if(isEditing){
                        modal.setTitle("Cancelar cambios");
                        modal.changeContent(ConfirmCnacelChangesModal);
                        modal.toggleShown();
                    } else {
                        setIsEditing(true);
                    }
                }}>
                    {isEditing ? "Cancelar Edición" : "Editar"}
                </button>
                {isEditing && <button className="px-4 py-2 bg-green-500 text-white rounded-md" onClick={()=>{
                    modal.setTitle("Confirmar cambios");
                    modal.changeContent(ConfirmSaveChildrenModal);
                    modal.toggleShown();
                }}>
                    Guardar Cambios
                </button>}
            </div>
        </div>
        {isEditing ?
            <div className="flex flex-col gap-2 h-full">
                <ScrollArea>
                    {fields.map((field, index) => (
                        <div className="rounded-md bg-surface-card mb-2" key={field.id}>
                            <div className="w-full h-full flex flex-col rounded-md p-5 gap-2">
                                <p className="text-text text-xl font-bold mb-1">第{index + 1}子の情報 / Información del {index + 1}° hijo</p>
                                <div className="flex gap-2">
                                    <TextInput id={`children${index}name`} {...register(`children.${index}.name`)} labelText="Nombre" className="flex-1" />
                                    <TextInput id={`children${index}surname`} {...register(`children.${index}.surname`)} labelText="Apellido" className="flex-1" />
                                </div>
                                <div className="flex gap-2">
                                    <TextInput id={`children${index}japaneseName`} {...register(`children.${index}.japaneseName`)} labelText="名字" className="flex-1" />
                                    <TextInput id={`children${index}japaneseSurname`} {...register(`children.${index}.japaneseSurname`)} labelText="名前" className="flex-1" />
                                </div>
                                <div className="flex gap-2">
                                    <Select id={`children${index}sex`}  {...register(`children.${index}.sex`)} labelText="性別 / Sexo" className="flex-1">
                                        <option value="M">Male / 男性</option>
                                        <option value="F">Female / 女性</option>
                                    </Select>
                                    <TextInput id={`children${index}birthDate`} {...register(`children.${index}.birthDate`)} labelText="生年月日 / Fecha de Nacimiento" className="flex-1" type="date" />
                                    <Select id={`children${index}bloodType`} {...register(`children.${index}.bloodType`)} labelText="血液型 / Grupo Sanguíneo" className="flex-1">
                                        <option value="A+">A(+)</option>
                                        <option value="A-">A(-)</option>
                                        <option value="B+">B(+)</option>
                                        <option value="B-">B(-)</option>
                                        <option value="AB+">AB(+)</option>
                                        <option value="AB-">AB(-)</option>
                                        <option value="O+">O(+)</option>
                                        <option value="O-">O(-)</option>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <TextInput id={`children${index}documentNumber`} {...register(`children.${index}.documentNumber`)} labelText="身分証明書番号 / C.I." className="flex-1" />
                                    <TextInput id={`children${index}documentExpDate`} {...register(`children.${index}.documentExpDate`)} labelText="身分証明書期限 / Venc. C.I." className="flex-1" type="date" />
                                    <TextInput id={`children${index}phone`} {...register(`children.${index}.phone`)} labelText="電話・携帯番号 / Tel. Cel." className="flex-1" />
                                </div>
                                <button
                                    type="button"
                                    className="self-end px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                                    onClick={() => {
                                        modal.setTitle("Confirmar eliminación");
                                        modal.changeContent(ConfirmDeleteChildrenModal);
                                        modal.toggleShown();
                                        handleRemoveChildren(index);
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                    {newChildrenFields.map((child, index) => (
                        <div className="rounded-md bg-surface-card mb-2" key={`new-child-${index}`}>
                            <div className="w-full h-full flex flex-col rounded-md p-5 gap-2">
                                <p className="text-text text-xl font-bold mb-1">第{index + 1 + fields.length}子の情報 / Información del {index + 1 + fields.length}° hijo</p>
                                <div className="flex gap-2">
                                    <TextInput id={`newchildren${index}name`} {...register(`newChildren.${index}.name`)} labelText="Nombre" className="flex-1" />
                                    <TextInput id={`newchildren${index}surname`} {...register(`newChildren.${index}.surname`)} labelText="Apellido" className="flex-1" />
                                </div>
                                <div className="flex gap-2">
                                    <TextInput id={`newchildren${index}japaneseName`} {...register(`newChildren.${index}.japaneseName`)} labelText="名字" className="flex-1" />
                                    <TextInput id={`newchildren${index}japaneseSurname`} {...register(`newChildren.${index}.japaneseSurname`)} labelText="名前" className="flex-1" />
                                </div>
                                <div className="flex gap-2">
                                    <Select id={`newchildren${index}sex`}  {...register(`newChildren.${index}.sex`)} labelText="性別 / Sexo" className="flex-1">
                                        <option value="M">Male / 男性</option>
                                        <option value="F">Female / 女性</option>
                                    </Select>
                                    <TextInput id={`newchildren${index}birthDate`} {...register(`newChildren.${index}.birthDate`)} labelText="生年月日 / Fecha de Nacimiento" className="flex-1" type="date" />
                                    <Select id={`newchildren${index}bloodType`} {...register(`newChildren.${index}.bloodType`)} labelText="血液型 / Grupo Sanguíneo" className="flex-1">
                                        <option value="A+">A(+)</option>
                                        <option value="A-">A(-)</option>
                                        <option value="B+">B(+)</option>
                                        <option value="B-">B(-)</option>
                                        <option value="AB+">AB(+)</option>
                                        <option value="AB-">AB(-)</option>
                                        <option value="O+">O(+)</option>
                                        <option value="O-">O(-)</option>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <TextInput id={`newchildren${index}documentNumber`} {...register(`newChildren.${index}.documentNumber`)} labelText="身分証明書番号 / C.I." className="flex-1" />
                                    <TextInput id={`newchildren${index}documentExpDate`} {...register(`newChildren.${index}.documentExpDate`)} labelText="身分証明書期限 / Venc. C.I." className="flex-1" type="date" />
                                    <TextInput id={`newchildren${index}phone`} {...register(`newChildren.${index}.phone`)} labelText="電話・携帯番号 / Tel. Cel." className="flex-1" />
                                </div>
                                <button
                                    type="button"
                                    className="self-end px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                                    onClick={() =>{ 
                                        modal.setTitle("Confirmar eliminación");
                                        modal.changeContent(ConfirmDeleteChildrenModal);
                                        modal.toggleShown();
                                        newChildrenRemove(index)
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </ScrollArea>
                <button
                    type="button"
                    className="flex items-center justify-center py-2 text-xl font-bold rounded-md border transition-all duration-200 hover:bg-black/10"
                    onClick={() => { append({}) }}
                >
                    + Agregar un Hijo
                </button>
            </div>
            :
            children.length !== 0 ?
                children.map((child, index: number) => {
                    return <div className="rounded-md p-5 bg-surface-card text-black mb-2" key={`child-${index}`}>
                        <p className="text-text text-xl font-bold mb-1">第{index + 1}子の情報 / Información del {index + 1}° hijo</p>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row">
                                <TextWithLabel label="Nombre y apellido">{child.name} {child.surname}</TextWithLabel>
                                <TextWithLabel label="氏名">{child.japaneseSurname} {child.japaneseName}</TextWithLabel>
                            </div>
                            <div className="flex flex-row">
                                <TextWithLabel label="性別 / Sexo" textStyle="text-md">{child.sex ?? "-"}</TextWithLabel>
                                <TextWithLabel label="生年月日 / Fecha de nacimiento" textStyle="text-md">{formatDateOnly(child.birthDate)}</TextWithLabel>
                            </div>
                            <div className="flex flex-row">
                                <TextWithLabel label="身分証明番号 / CI" textStyle="text-md">{child.documentNumber ?? "-"}</TextWithLabel>
                                <TextWithLabel label="血液型 / grupo sanguineo" textStyle="text-md">{child.bloodType ?? "-"}</TextWithLabel>
                                <TextWithLabel label="電話番号 / Tel/Cel" textStyle="text-md">{child.phone ?? "Sin numero registrado"}</TextWithLabel>
                            </div>
                        </div>
                    </div>
                })
                :
                <div className="relative w-full h-full">
                    <p className="absolute top-[50%] -translate-y-[50%] left-[50%] -translate-x-[50%] text-text text-md font-bold mb-1">子供はいません / No tiene hijos</p>
                </div>
        }
    </>
}
