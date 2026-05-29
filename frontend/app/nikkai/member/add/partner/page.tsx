"use client"

import Select from "@/components/Inputs/Select";
import TextInput from "@/components/Inputs/TextInput";
import { CreateMemberDto } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export default function PartnerFormPage({ }) {
    const router = useRouter();
    const { register, setValue, getValues, trigger, formState: { errors } } = useFormContext<CreateMemberDto>();
    const [isTherePartner, setIsTherePartner] = useState<boolean>(!!getValues("partner"));

    const goToNextStep = async () => {
        if (!isTherePartner) {
            router.push("/nikkai/member/add/children");
            return;
        }

        const isValid = await trigger(["partner.name", "partner.surname"], { shouldFocus: true });
        if (!isValid) return;
        router.push("/nikkai/member/add/children");
    };

    return <div className="p-5 w-full h-full">
        <div className="w-full min-h-full flex flex-col rounded-md p-5 justify-between bg-background-dark gap-2">
            <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between">
                    <p className="text-text text-xl font-bold mb-1">夫・妻の情報 / Datos Personales del Esposo/a del Socio</p>
                    <div className="flex flex-row gap-2 items-center">
                        <input value={`${isTherePartner}`} id="checkToAddPartner" type={"checkbox"} onClick={() => { 
                            setIsTherePartner(v => !v) 
                            setValue("partner", null)
                        }}></input>
                        <label className="text-black" htmlFor="checkToAddPartner">夫・妻がいる / Tiene Pareja</label>
                    </div>
                </div>
                {isTherePartner ? <>
                    <div className="flex gap-2">
                        <TextInput
                            id="name"
                            {...register("partner.name", { required: isTherePartner ? "Nombre de pareja es obligatorio" : false })}
                            labelText="Nombre"
                            className="flex-1"
                            errorText={errors.partner?.name?.message}
                        />
                        <TextInput
                            id="firstName"
                            {...register("partner.surname", { required: isTherePartner ? "Apellido de pareja es obligatorio" : false })}
                            labelText="Apellido"
                            className="flex-1"
                            errorText={errors.partner?.surname?.message}
                        />
                    </div>
                    <div className="flex gap-2">
                        <TextInput id="japaneseName" {...register("partner.japaneseName")} labelText="名字" className="flex-1" />
                        <TextInput id="firstName" {...register("partner.japaneseSurname")} labelText="名前" className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                        <Select id="sex" {...register("partner.sex")} labelText="性別 / Sexo" className="flex-1" >
                            <option value="M" > Male / 男性 </option>
                            <option value="F" > Female / 女性 </option>
                        </Select>
                        <TextInput id="birthDate" {...register("partner.birthDate")} labelText="生年月日 / Fecha de Nacimiento" className="flex-1" type="date" />
                        <Select id="bloodType" {...register("partner.bloodType")} labelText="血液型 / Sexo" className="flex-1" >
                            <option value="A+" > A(+) </option>
                            <option value="A-" > A(-) </option>
                            <option value="B+" > B(+) </option>
                            <option value="B-" > B(-) </option>
                            <option value="AB+" > AB(+) </option>
                            <option value="AB-" > AB(-) </option>
                            <option value="O+" > O(+) </option>
                            <option value="O-" > O(-) </option>
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
                    <div className="flex gap-2">
                        <TextInput id="address" {...register("partner.address")} labelText="住所 / Domicilio" className="flex-1" />
                    </div>
                    <p className="text-text text-xl font-bold my-1">夫・妻の職場情報 / Datos Profecionales del Socio</p>
                    <div className="flex gap-2">
                        <TextInput id="profession" {...register("partner.profession")} labelText="職業 / Profesión" className="flex-[2]" />
                        <TextInput id="workPhone" {...register("partner.workPhone")} labelText="勤務先電話番号 / Tel. Cel. del Trabajo" className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                        <TextInput id="workAddress" {...register("partner.workAddress")} labelText="勤務先 / Dirección de Trabajo" className="flex-1" />
                    </div>
                    
                </> 
                : 
                <div className="flex-1 justify-center items-center flex select-none">
                    <p className="text-black">パートナー無し / Sin Pareja</p>
                </div>
                }
            </div>

            <div className="flex justify-between justify-self-end mt-2">
                <Link href="/nikkai/member/add/principal" className="py-2 px-4 bg-black rounded-md text-base flex-1 text-center">← 本人の情報 / Información del Socio/a</Link>
                <div className="flex flex-1 gap-2 text-md items-center justify-center text-text-muted">
                    <span>1</span>
                    <span className="text-text font-bold">2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                </div>
                <button type="button" onClick={goToNextStep} className="py-2 px-4 bg-black rounded-md text-base flex-1 text-center">子供の情報 / Información de Niños/as →</button>
            </div>
        </div>
    </div>
}