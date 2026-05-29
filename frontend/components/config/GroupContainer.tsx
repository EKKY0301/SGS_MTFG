"use client";

import { useModalContext } from "@/services/modal/context/context";
import { ConfirmationModal } from "../modal/ConfirmationModalTemplate";
import { useGroupContext } from "@/services/groups/context/context";
import { useEffect, useMemo, useState } from "react";
import { FormModalTemplate } from "../modal/FormModalTemplate";
import TextInput from "../Inputs/TextInput";
import { set, useForm } from "react-hook-form";
import { Group } from "@/types";

export default function GroupContainer() {
    const { list, items, createItem, deleteItem, updateItem } = useGroupContext();
    const modal = useModalContext();

    useEffect(() => {
        list();
    }, [list]);

    const { register, getValues, reset } = useForm({
        defaultValues: {
            name: "",
        }
    })

    const handleEditGroup = (item: Group) => {
        reset({
            name: item.name,
        })
        modal.setTitle("Editar Grupo");
        modal.changeContent(<EditGroupModalContent item={item} />);
        modal.toggleShown();
    }

    const handleCreate = () => {
        const payload = getValues();
        createItem(payload);
        modal.toggleShown();
        list();
        reset();
    }

    const createGroupModalContent = <FormModalTemplate>
        <TextInput id="createGroupName" {...register("name")} labelText="Nombre" />
        <p className="text-black">Estas Seguro Crear un nuevo grupo con este nombre?</p>
        <div className="flex flex-row gap-2 justify-end">
            <button className="px-4 py-2 bg-red-400 rounded-md" onClick={() => {
                modal.toggleShown()
                reset()
            }}>Cancelar</button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md" onClick={handleCreate}>Confirmar</button>
        </div>
    </FormModalTemplate>

    function EditGroupModalContent({ item }: { item: Group }) {
        return <FormModalTemplate>
            <TextInput id="editGroupName" {...register("name")} labelText="Nombre" />
            <p className="text-black">Estas Seguro de Editar el nombre de este grupo?</p>
            <div className="flex flex-row justify-between">
                <button className="px-4 py-2 bg-red-400 rounded-md" onClick={async () => {
                    if (!item) return;
                    await deleteItem(item.id);
                    modal.toggleShown();
                    await list();
                    reset({
                        name: "",
                    });
                }}>Eliminar Grupo</button>
                <div className="flex flex-row gap-2 justify-end">
                    <button className="px-4 py-2 bg-red-400 rounded-md" onClick={() => {
                        modal.toggleShown();
                        reset({
                            name: "",
                        });
                    }}>Cancelar</button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md" onClick={async () => {
                        if (!item) return;
                        const payload = getValues();
                        await updateItem(item.id, payload);
                        modal.toggleShown();
                        await list();
                        reset({
                            name: "",
                        });
                    }}>Confirmar</button>
                </div>
            </div>
        </FormModalTemplate>
    }

    return <div className="flex flex-row flex-wrap gap-2">
        {items.map((item) => <p key={item.id} className="bg-background-dark text-black p-2 rounded-md flex items-center justify-center cursor-pointer" onClick={() => { handleEditGroup(item) }}>{item.name}</p>)}

        <div className="p-2 bg-background-dark rounded-md flex items-center justify-center cursor-pointer">
            <button className="text-text" onClick={() => {
                modal.setTitle("Crear Grupo");
                modal.changeContent(createGroupModalContent);
                modal.toggleShown();
            }}>Crear Grupo</button>
        </div>
    </div>
}