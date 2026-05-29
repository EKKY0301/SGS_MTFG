"use client"

import Select from "@/components/Inputs/Select";
import TextInput from "@/components/Inputs/TextInput";
import { CreateMemberDto } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";

export default function PrincipalFormPage({ }) {
    const router = useRouter();
    const { register, trigger, formState: { errors } } = useFormContext<CreateMemberDto>();

    const goToNextStep = async () => {
        const isValid = await trigger(["name", "surname"], { shouldFocus: true });
        if (!isValid) return;
        router.push("/nikkai/member/add/partner");
    };

    return <div className="p-5 w-full h-full">
        <div className="w-full min-h-full flex flex-col rounded-md p-5 justify-between bg-background-dark gap-2">
            <div className="flex flex-col gap-2">
                    <p className="text-text text-xl font-bold mb-1">本人情報 / Datos Personales del Socio</p>
                    <div className="flex gap-2">
                        <TextInput
                            id="name"
                            {...register("name", { required: "Nombre es obligatorio" })}
                            labelText="Nombre"
                            className="flex-1"
                            errorText={errors.name?.message}
                        />
                        <TextInput
                            id="firstName"
                            {...register("surname", { required: "Apellido es obligatorio" })}
                            labelText="Apellido"
                            className="flex-1"
                            errorText={errors.surname?.message}
                        />
                    </div>
                    <div className="flex gap-2">
                        <TextInput id="japaneseName" {...register("japaneseName")} labelText="名字" className="flex-1" />
                        <TextInput id="firstName" {...register("japaneseSurname")} labelText="名前" className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                        <Select id="sex" {...register("sex")} labelText="性別 / Sexo" className="flex-1" >
                            <option value="M" > Male / 男性 </option>
                            <option value="F" > Female / 女性 </option>
                        </Select>
                        <TextInput id="birthDate" {...register("birthDate")} labelText="生年月日 / Fecha de Nacimiento" className="flex-1" type="date" />
                        <Select id="bloodType" {...register("bloodType")} labelText="血液型 / Sexo" className="flex-1" >
                            <option value="A+" > A(+) </option>
                            <option value="A-" > A(-) </option>
                            <option value="B+" > B(+) </option>
                            <option value="B-" > B(-) </option>
                            <option value="AB+" > AB(+) </option>
                            <option value="AB-" > AB(-) </option>
                            <option value="O+" > O(+) </option>
                            <option value="O-" > O(-) </option>
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
                    <p className="text-text text-xl font-bold my-1">追加情報 / Información Adicional</p>
                    <div className="flex gap-2">
                        <TextInput id="visaStatus" {...register("visaStatus")} labelText="ビザ状態 / Estado de Visa" className="flex-1" />
                        <TextInput id="countryOrigin" {...register("countryOrigin")} labelText="出身国 / País de Origen" className="flex-1" />
                    </div>
                    <div className="flex gap-2">
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

            <div className="flex justify-between justify-self-end mt-2">
                <div className="flex-1"></div>
                <div className="flex flex-1 gap-2 text-md items-center justify-center text-text-muted">
                    <span className="text-text font-bold">1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                </div>
                <div className="flex flex-1 gap-2">
                    <button type="button" onClick={goToNextStep} className="py-2 px-4 bg-black rounded-md text-base text-center w-full">夫・妻の情報 / Información de Esposo/a →</button>
                </div>
            </div>
        </div>
    </div>
}