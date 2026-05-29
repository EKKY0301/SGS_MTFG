"use client"

import TextInput from "@/components/Inputs/TextInput";
import { useEventContext } from "@/services/events/context/context";
import { Event } from "@/types/event";
import { toDateOnlyApiValue, toDateOnlyInputValue } from "@/utils/functions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddEventoPage() {
    const router = useRouter();
    const { createItem, isLoading, error, clearError } = useEventContext();
    
    const [formData, setFormData] = useState<Partial<Event>>({
        name: "",
        description: "",
        date: "",
        location: "",
        maxCapacity: undefined,
        organizedBy: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "maxCapacity" ? (value ? parseInt(value) : undefined) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        try {
            const payload: Partial<Event> = {
                ...formData,
                date: toDateOnlyApiValue(formData.date),
            };
            await createItem(payload);
            router.push("/nikkai/event/list");
        } catch (err) {
            console.error("Error al crear evento:", err);
        }
    };

    return <div className="p-5 w-full h-full">
        <div className="w-full h-full flex flex-col rounded-md p-5 justify-between bg-background-dark">
            <div className="flex flex-col gap-4">
                <h1 className="text-text text-2xl font-bold">Crear Nuevo Evento</h1>
                
                {error && (
                    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <TextInput
                                id="name"
                                name="name"
                                labelText="Nombre del Evento *"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
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

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <TextInput
                                id="date"
                                name="date"
                                labelText="Fecha *"
                                type="date"
                                value={toDateOnlyInputValue(formData.date)}
                                onChange={handleChange}
                                required
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

                    <div className="flex gap-4">
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

                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isLoading ? "Guardando..." : "Guardar Evento"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
}
