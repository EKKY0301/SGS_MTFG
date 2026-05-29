"use client"
import Select from "@/components/Inputs/Select";
import TextInput from "@/components/Inputs/TextInput";
import { CreateMemberDto } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useFormContext } from "react-hook-form";

export default function ChildrenFormPage({ }) {
    const router = useRouter();
    const form = useFormContext<CreateMemberDto>();

    const { register, control, trigger, formState: { errors } } = form;

    const { fields, append } = useFieldArray({
        control,
        name: "children"
    });

    const goToNextStep = async () => {
        const fieldsToValidate = fields.flatMap((_, index) => ([
            `children.${index}.name`,
            `children.${index}.surname`,
        ])) as Array<`children.${number}.name` | `children.${number}.surname`>;

        if (!fieldsToValidate.length) {
            router.push("/nikkai/member/add/parients");
            return;
        }

        const isValid = await trigger(fieldsToValidate, { shouldFocus: true });
        if (!isValid) return;
        router.push("/nikkai/member/add/parients");
    };

    return <div className="p-5 w-full h-full">
        <div className="w-full min-h-full flex flex-col rounded-md p-5 gap-2 bg-background-dark">
            <div className="flex flex-col gap-2">
                {
                    fields.map((c, index) => {
                        return <div className="rounded-md bg-surface-card" key={index}>
                            <div className="w-full h-full flex flex-col rounded-md p-5 justify-between">
                                <div className="flex flex-col gap-2 ">
                                    <div className="flex gap-2">
                                        <TextInput
                                            id="name"
                                            {...register(`children.${index}.name`, { required: "Nombre del hijo es obligatorio" })}
                                            labelText="Nombre"
                                            className="flex-1"
                                            errorText={errors.children?.[index]?.name?.message}
                                        />
                                        <TextInput
                                            id="firstName"
                                            {...register(`children.${index}.surname`, { required: "Apellido del hijo es obligatorio" })}
                                            labelText="Apellido"
                                            className="flex-1"
                                            errorText={errors.children?.[index]?.surname?.message}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <TextInput id="japaneseName" {...register(`children.${index}.japaneseName`)} labelText="名字" className="flex-1" />
                                        <TextInput id="firstName" {...register(`children.${index}.japaneseSurname`)} labelText="名前" className="flex-1" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Select id="sex" {...register(`children.${index}.sex`)} labelText="性別 / Sexo" className="flex-1" >
                                            <option value="M" > Male / 男性 </option>
                                            <option value="F" > Female / 女性 </option>
                                        </Select>
                                        <TextInput id="birthDate" {...register(`children.${index}.birthDate`)} labelText="生年月日 / Fecha de Nacimiento" className="flex-1" type="date" />
                                        <Select id="bloodType" {...register(`children.${index}.bloodType`)} labelText="血液型 / Sexo" className="flex-1" >
                                            <option value="A+" > A(+) </option>
                                            <option value="A-" > A(-) </option>
                                            <option value="B+" > B(+) </option>
                                            <option value="B-" > B(-) </option>
                                            <option value="AB+" > AB(+) </option>
                                            <option value="AB-" > AB(-) </option>
                                            <option value="O+" > O(+) </option>
                                            <option value="O-" > O(-) </option>
                                        </Select>
                                    </div>
                                    <div className="flex gap-2">
                                        <TextInput id="ci" {...register(`children.${index}.documentNumber`)} labelText="身分証明書番号 / C.I." className="flex-1" />
                                        <TextInput id="ciExpirationDate" {...register(`children.${index}.documentExpDate`)} labelText="身分証明書期限 / Fecha de Vencimiento de C.I " className="flex-1" type="date" />
                                        <TextInput id="phone" {...register(`children.${index}.phone`)} labelText="電話・携帯番号 / Tel. Cel." className="flex-1" />
                                    </div>

                                </div>

                            </div>
                        </div>
                    })
                }

                <button
                    type="button"
                    className="flex items-center justify-center py-2 text-lg font-bold rounded-md border transition-all duration-200 hover:opacity-120 hover:bg-black/10"
                    onClick={() => { append({ name: "", surname: "" }) }}
                >
                    <span>+ Agregar un Hijo</span>
                </button>
            </div>
            <div className="flex justify-between justify-self-end mt-2">
                <Link href="/nikkai/member/add/partner" className="py-2 px-4 bg-black rounded-md text-base flex-1 text-center">← 夫・妻の情報 / Información del Socio/a</Link>
                <div className="flex flex-1 gap-2 text-md items-center justify-center text-text-muted">
                    <span>1</span>
                    <span>2</span>
                    <span className="text-text font-bold">3</span>
                    <span>4</span>
                    <span>5</span>
                </div>
                <button type="button" onClick={goToNextStep} className="py-2 px-4 bg-black rounded-md text-base flex-1 text-center" >扶養家族の情報 / Información de Parientes →</button>
            </div>
        </div>
    </div>

}
