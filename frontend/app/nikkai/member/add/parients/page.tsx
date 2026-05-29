"use client"

import Select from "@/components/Inputs/Select";
import TextInput from "@/components/Inputs/TextInput";
import { CreateMemberDto } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export default function Parents({ }) {
    const router = useRouter();
    const { register, getValues, setValue, trigger, formState: { errors } } = useFormContext<CreateMemberDto>();
    const {father, mother} = getValues()
    const [isThereFather, setIsThereFather] = useState<boolean>(!!father);
    const [isThereMother, setIsThereMother] = useState<boolean>(!!mother);

    const goToNextStep = async () => {
        const fieldsToValidate: Array<"father.name" | "father.surname" | "mother.name" | "mother.surname"> = [];

        if (isThereFather) {
            fieldsToValidate.push("father.name", "father.surname");
        }

        if (isThereMother) {
            fieldsToValidate.push("mother.name", "mother.surname");
        }

        if (!fieldsToValidate.length) {
            router.push("/nikkai/member/add/confirmation");
            return;
        }

        const isValid = await trigger(fieldsToValidate, { shouldFocus: true });
        if (!isValid) return;
        router.push("/nikkai/member/add/confirmation");
    };
    return <div className="p-5 w-full h-full">

        <div className="w-full min-h-full flex flex-col rounded-md p-5 justify-between bg-background-dark gap-2">
            <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between">
                    <p className="text-text text-xl font-bold mb-1">扶養家族の情報 / Datos Personales de los Parientes Dependientes</p>
                    <div className="flex flex-row gap-2 items-center">
                        <input value={`${isThereFather}`} id="checkToAddFather" type={"checkbox"} onClick={() => { 
                            setIsThereFather(v => !v)
                            if(isThereFather) setValue("father", null)
                         }}></input>
                        <label className="text-black" htmlFor="checkToAddFather">父 / Padre dependiente</label>
                        <input value={`${isThereMother}`} id="checkToAddMother" type={"checkbox"} onClick={() => {
                            setIsThereMother(v => !v) 
                            if(isThereMother) setValue("mother", null)
                        }}></input>
                        <label className="text-black" htmlFor="checkToAddMother">母 / Madre dependiente</label>
                    </div>
                </div>
                <div className="flex flex-col gap-2">

                        {(isThereFather && <>
                            <div className="bg-surface-card p-5 rounded-md" >
                                <p className="text-text text-xl font-bold mb-1">父の情報 / Datos Personales del Padre</p>
                                <div className="flex gap-2">
                                    <TextInput
                                        id="name"
                                        {...register("father.name", { required: isThereFather ? "Nombre del padre es obligatorio" : false })}
                                        labelText="Nombre"
                                        className="flex-1"
                                        errorText={errors.father?.name?.message}
                                    />
                                    <TextInput
                                        id="firstName"
                                        {...register("father.surname", { required: isThereFather ? "Apellido del padre es obligatorio" : false })}
                                        labelText="Apellido"
                                        className="flex-1"
                                        errorText={errors.father?.surname?.message}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <TextInput id="japaneseName" {...register("father.japaneseName")} labelText="名字" className="flex-1" />
                                    <TextInput id="firstName" {...register("father.japaneseSurname")} labelText="名前" className="flex-1" />
                                </div>
                                <div className="flex gap-2">
                                    <TextInput id="birthDate" {...register("father.birthDate")} labelText="生年月日 / Fecha de Nacimiento" className="flex-1" type="date" />
                                    <Select id="bloodType" {...register("father.bloodType")} labelText="血液型 / Sexo" className="flex-1" >
                                        <option value="A+" > A(+) </option>
                                        <option value="A-" > A(-) </option>
                                        <option value="B+" > B(+) </option>
                                        <option value="B-" > B(-) </option>
                                        <option value="AB+" > AB(+) </option>
                                        <option value="AB-" > AB(-) </option>
                                        <option value="O+" > O(+) </option>
                                        <option value="O-" > O(-) </option>
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
                                <div className="flex gap-2">
                                    <TextInput id="address" {...register("father.address")} labelText="住所 / Domicilio" className="flex-1" />
                                </div>
                                <p className="text-text text-xl font-bold my-1">父の職場情報 / Datos Profecionales del Padre</p>
                                <div className="flex gap-2">
                                    <TextInput id="profession" {...register("father.profession")} labelText="職業 / Profesión" className="flex-[2]" />
                                    <TextInput id="workPhone" {...register("father.workPhone")} labelText="勤務先電話番号 / Tel. Cel. del Trabajo" className="flex-1" />
                                </div>
                                <div className="flex gap-2">
                                    <TextInput id="workAddress" {...register("father.workAddress")} labelText="勤務先 / Dirección de Trabajo" className="flex-1" />
                                </div>
                            </div>
                        </>)
                        }
                        {isThereMother && <>
                            <div className="bg-surface-card p-5 rounded-md" >
                                <p className="text-text text-xl font-bold mb-1">母の情報 / Datos Personales de la Madre</p>
                                <div className="flex gap-2">
                                    <TextInput
                                        id="name"
                                        {...register("mother.name", { required: isThereMother ? "Nombre de la madre es obligatorio" : false })}
                                        labelText="Nombre"
                                        className="flex-1"
                                        errorText={errors.mother?.name?.message}
                                    />
                                    <TextInput
                                        id="firstName"
                                        {...register("mother.surname", { required: isThereMother ? "Apellido de la madre es obligatorio" : false })}
                                        labelText="Apellido"
                                        className="flex-1"
                                        errorText={errors.mother?.surname?.message}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <TextInput id="japaneseName" {...register("mother.japaneseName")} labelText="名字" className="flex-1" />
                                    <TextInput id="firstName" {...register("mother.japaneseSurname")} labelText="名前" className="flex-1" />
                                </div>
                                <div className="flex gap-2">
                                    <TextInput id="birthDate" {...register("mother.birthDate")} labelText="生年月日 / Fecha de Nacimiento" className="flex-1" type="date" />
                                    <Select id="bloodType" {...register("mother.bloodType")} labelText="血液型 / Sexo" className="flex-1" >
                                        <option value="A+" > A(+) </option>
                                        <option value="A-" > A(-) </option>
                                        <option value="B+" > B(+) </option>
                                        <option value="B-" > B(-) </option>
                                        <option value="AB+" > AB(+) </option>
                                        <option value="AB-" > AB(-) </option>
                                        <option value="O+" > O(+) </option>
                                        <option value="O-" > O(-) </option>
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
                                <div className="flex gap-2">
                                </div>
                                <p className="text-text text-xl font-bold my-1">母の職場情報 / Datos Profecionales de la Madre</p>
                                <div className="flex gap-2">
                                    <TextInput id="profession" {...register("mother.profession")} labelText="職業 / Profesión" className="flex-[2]" />
                                    <TextInput id="workPhone" {...register("mother.workPhone")} labelText="勤務先電話番号 / Tel. Cel. del Trabajo" className="flex-1" />
                                </div>
                                <div className="flex gap-2">
                                    <TextInput id="workAddress" {...register("mother.workAddress")} labelText="勤務先 / Dirección de Trabajo" className="flex-1" />
                                </div>
                            </div>
                        </>
                        }
                </div>

            </div>

            <div className="flex justify-between justify-self-end mt-2">
                <Link href="/nikkai/member/add/children" className="py-2 px-4 bg-black rounded-md text-base flex-1 text-center">← 子供の情報 / Información de los Hijos</Link>
                <div className="flex flex-1 gap-2 text-md items-center justify-center text-text-muted">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span className="text-text font-bold">4</span>
                    <span>5</span>
                </div>
                <button type="button" onClick={goToNextStep} className="py-2 px-4 bg-black rounded-md text-base flex-1 text-center" >確認画面 / Pantalla de Confirmación →</button>
            </div>
        </div>

    </div>
}
