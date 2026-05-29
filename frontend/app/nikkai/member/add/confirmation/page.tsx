"use client"

import { ConfirmationModal } from "@/components/modal/ConfirmationModalTemplate";
import TextWithLabel from "@/components/textWithLabel";
import { useMemberContext } from "@/services/members/context/context";
import { useModalContext } from "@/services/modal/context/context";
import { CreateMemberDto } from "@/types";
import { createDtoToEntity } from "@/types/member";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";

export default function ConfirmationPage({ }) {
    const { getValues, reset } = useFormContext<CreateMemberDto>();
    const { createItem } = useMemberContext();
    const values = getValues();
    const router = useRouter();
    const modal = useModalContext();

    const showMessageModal = (titleText: string, text: string) => {
        modal.setTitle(titleText);
        modal.changeContent(
            <ConfirmationModal
                text={text}
                onCancel={() => modal.toggleShown()}
                onConfirm={() => modal.toggleShown()}
            />,
        );
        modal.toggleShown();
    };
    return <div className="p-5 w-full h-full">
        <div className="w-full min-h-full flex flex-col rounded-md p-5 justify-between bg-background-dark gap-2">
            <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between">
                    <p className="text-text text-xl font-bold mb-1">確認画面 / Pantalla de Confirmación</p>
                </div>
                <div className="flex flex-col gap-2">
                        <div className="rounded-md p-5 bg-surface-card text-black">
                            <p className="text-text text-xl font-bold mb-1">本人情報 / Infromación del Socio</p>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row">
                                    <TextWithLabel label="Nombre y apellido">{values.name} {values.surname}</TextWithLabel>
                                    <TextWithLabel label="氏名">{values.japaneseSurname} {values.japaneseName} </TextWithLabel>
                                </div>
                                <div className="flex flex-row">
                                    <TextWithLabel label="性別 / Sexo" textStyle="text-md">{values.sex}</TextWithLabel>
                                    <TextWithLabel label="生年月日 / Fecha de nacimiento" textStyle="text-md">{values.birthDate}</TextWithLabel>
                                </div>
                                <div className="flex flex-row">
                                    <TextWithLabel label="身分証明番号 / CI" textStyle="text-md">{values.documentNumber}</TextWithLabel>
                                    <TextWithLabel label="納税者識別番号 / RUC" textStyle="text-md">{values.ruc}</TextWithLabel>
                                    <TextWithLabel label="電話番号 / Tel/Cel" textStyle="text-md">{values.phone}</TextWithLabel>
                                </div>
                                <TextWithLabel label="住所 / domicilio" textStyle="text-md">{values.address}</TextWithLabel>
                                <div className="flex flex-row">
                                    <TextWithLabel label="仕事 / Profesión" textStyle="text-md">{values.profession}</TextWithLabel>
                                    <TextWithLabel label="仕事電話番号 / Tel/Cel del Trabajo" textStyle="text-md">{values.workPhone}</TextWithLabel>
                                </div>
                                <TextWithLabel label="仕事場 / dirección de profeción" textStyle="text-md">{values.workAddress}</TextWithLabel>
                                <div className="flex flex-row">
                                    <TextWithLabel label="メール / E-mail" textStyle="text-md">{values.email}</TextWithLabel>
                                    <TextWithLabel label="血液型 / grupo sanguineo" textStyle="text-md">{values.bloodType}</TextWithLabel>
                                </div>
                            </div>
                        </div>
                        <p className="text-text text-xl font-bold mb-1">夫・妻の情報 / Infromación de la pareja</p>
                        {values.partner ? <div className="rounded-md p-5 bg-surface-card text-black">
                            <div className="flex flex-col gap-2">
                                <p className="text-text text-xl font-bold mb-1">{values.partner?.sex === "M" ? "夫" : "妻"}の情報 / Infromación de la pareja</p>
                                <div className="flex flex-row">
                                    <TextWithLabel label="Nombre y apellido">{values.partner?.name} {values.partner?.surname}</TextWithLabel>
                                    <TextWithLabel label="氏名">{values.partner?.japaneseSurname} {values.partner?.japaneseName} </TextWithLabel>
                                </div>
                                <div className="flex flex-row">
                                    <TextWithLabel label="性別 / Sexo" textStyle="text-md">{values.partner?.sex}</TextWithLabel>
                                    <TextWithLabel label="生年月日 / Fecha de nacimiento" textStyle="text-md">{values.partner?.birthDate}</TextWithLabel>
                                </div>
                                <div className="flex flex-row">
                                    <TextWithLabel label="身分証明番号 / CI" textStyle="text-md">{values.partner?.documentNumber}</TextWithLabel>
                                    <TextWithLabel label="納税者識別番号 / RUC" textStyle="text-md">{values.partner?.ruc}</TextWithLabel>
                                    <TextWithLabel label="電話番号 / Tel/Cel" textStyle="text-md">{values.partner?.phone}</TextWithLabel>
                                </div>
                                <TextWithLabel label="住所 / domicilio" textStyle="text-md">{values.partner?.address}</TextWithLabel>
                                <div className="flex flex-row">
                                    <TextWithLabel label="仕事 / Profesión" textStyle="text-md">{values.partner?.profession}</TextWithLabel>
                                    <TextWithLabel label="仕事電話番号 / Tel/Cel del Trabajo" textStyle="text-md">{values.partner?.workPhone}</TextWithLabel>
                                </div>
                                <TextWithLabel label="仕事場 / dirección de profeción" textStyle="text-md">{values.partner?.workAddress}</TextWithLabel>
                                <div className="flex flex-row">
                                    <TextWithLabel label="メール / E-mail" textStyle="text-md">{values.partner?.email}</TextWithLabel>
                                    <TextWithLabel label="血液型 / grupo sanguineo" textStyle="text-md">{values.partner?.bloodType}</TextWithLabel>
                                </div>
                            </div>
                        </div>
                            :
                            <p className="text-text text-md font-bold mb-1">夫・妻はいません / No tiene pareja</p>
                        }
                        <p className="text-text text-xl font-bold mb-1">子供の情報 / Infromación de los hijos</p>
                        {
                            values.children && values.children.length !== 0 ?
                                values.children.map((child: any, index: number) => {
                                    return <div className="rounded-md p-5 bg-surface-card text-black" key={`child-${index}`}>
                                        <p className="text-text text-xl font-bold mb-1">第{index + 1}子の情報 / Infromación del {index + 1}° hijo</p>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-row">
                                                <TextWithLabel label="Nombre y apellido">{child.name} {child.surname}</TextWithLabel>
                                                <TextWithLabel label="氏名">{child.japaneseSurname} {child.japaneseName} </TextWithLabel>
                                            </div>
                                            <div className="flex flex-row">
                                                <TextWithLabel label="性別 / Sexo" textStyle="text-md">{child.sex}</TextWithLabel>
                                                <TextWithLabel label="生年月日 / Fecha de nacimiento" textStyle="text-md">{child.birthDate}</TextWithLabel>
                                            </div>
                                            <div className="flex flex-row">
                                                <TextWithLabel label="身分証明番号 / CI" textStyle="text-md">{child.ci}</TextWithLabel>
                                                <TextWithLabel label="血液型 / grupo sanguineo" textStyle="text-md">{child.bloodType}</TextWithLabel>
                                                <TextWithLabel label="電話番号 / Tel/Cel" textStyle="text-md">{child.phone}</TextWithLabel>
                                            </div>
                                        </div>
                                    </div>
                                })
                                :
                                <p className="text-text text-md font-bold mb-1">子供はいません / No tiene hijos</p>
                        }
                        <p className="text-text text-xl font-bold mb-1">扶養家族の情報 / Infromación de los parientes dependientes</p>
                        {(!values.father && !values.mother) &&        //cuando no tiene ni padre ni madre dependientes
                            <p className="text-text text-md font-bold mb-1">扶養家族はいません / No tiene parientes dependientes</p>
                        }
                        {!!values.father && <div className="rounded-md p-5 bg-surface-card text-black">
                            <p className="text-text text-xl font-bold mb-1">父の情報 / Infromación del padre dependiente</p>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row">
                                    <TextWithLabel label="Nombre y apellido">{values.father?.name} {values.father?.surname}</TextWithLabel>
                                    <TextWithLabel label="氏名">{values.father?.japaneseSurname} {values.father?.japaneseName} </TextWithLabel>
                                </div>
                                <div className="flex flex-row">
                                    <TextWithLabel label="性別 / Sexo" textStyle="text-md">{values.father?.sex}</TextWithLabel>
                                    <TextWithLabel label="生年月日 / Fecha de nacimiento" textStyle="text-md">{values.father?.birthDate}</TextWithLabel>
                                </div>
                                <div className="flex flex-row">
                                    <TextWithLabel label="身分証明番号 / CI" textStyle="text-md">{values.father?.documentNumber}</TextWithLabel>
                                    <TextWithLabel label="納税者識別番号 / RUC" textStyle="text-md">{values.father?.ruc}</TextWithLabel>
                                    <TextWithLabel label="電話番号 / Tel/Cel" textStyle="text-md">{values.father?.phone}</TextWithLabel>
                                </div>
                                <TextWithLabel label="住所 / domicilio" textStyle="text-md">{values.father?.address}</TextWithLabel>
                                <div className="flex flex-row">
                                    <TextWithLabel label="仕事 / Profesión" textStyle="text-md">{values.father?.profession}</TextWithLabel>
                                    <TextWithLabel label="仕事電話番号 / Tel/Cel del Trabajo" textStyle="text-md">{values.father?.workPhone}</TextWithLabel>
                                </div>
                                <TextWithLabel label="仕事場 / dirección de profeción" textStyle="text-md">{values.father?.workAddress}</TextWithLabel>
                                <div className="flex flex-row">
                                    <TextWithLabel label="メール / E-mail" textStyle="text-md">{values.father?.email}</TextWithLabel>
                                    <TextWithLabel label="血液型 / grupo sanguineo" textStyle="text-md">{values.father?.bloodType}</TextWithLabel>
                                </div>
                            </div>
                        </div>}
                        {!!values.mother && <div className="rounded-md p-5 bg-surface-card text-black">
                            <p className="text-text text-xl font-bold mb-1">母の情報 / Infromación del madre dependiente</p>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row">
                                    <TextWithLabel label="Nombre y apellido">{values.mother?.name} {values.mother?.surname}</TextWithLabel>
                                    <TextWithLabel label="氏名">{values.mother?.japaneseSurname} {values.mother?.japaneseName} </TextWithLabel>
                                </div>
                                <div className="flex flex-row">
                                    <TextWithLabel label="性別 / Sexo" textStyle="text-md">{values.mother?.sex}</TextWithLabel>
                                    <TextWithLabel label="生年月日 / Fecha de nacimiento" textStyle="text-md">{values.mother?.birthDate}</TextWithLabel>
                                </div>
                                <div className="flex flex-row">
                                    <TextWithLabel label="身分証明番号 / CI" textStyle="text-md">{values.mother?.documentNumber}</TextWithLabel>
                                    <TextWithLabel label="納税者識別番号 / RUC" textStyle="text-md">{values.mother?.ruc}</TextWithLabel>
                                    <TextWithLabel label="電話番号 / Tel/Cel" textStyle="text-md">{values.father?.phone}</TextWithLabel>
                                </div>
                                <TextWithLabel label="住所 / domicilio" textStyle="text-md">{values.mother?.address}</TextWithLabel>
                                <div className="flex flex-row">
                                    <TextWithLabel label="仕事 / Profesión" textStyle="text-md">{values.mother?.profession}</TextWithLabel>
                                    <TextWithLabel label="仕事電話番号 / Tel/Cel del Trabajo" textStyle="text-md">{values.mother?.workPhone}</TextWithLabel>
                                </div>
                                <TextWithLabel label="仕事場 / dirección de profeción" textStyle="text-md">{values.mother?.workAddress}</TextWithLabel>
                                <div className="flex flex-row">
                                    <TextWithLabel label="メール / E-mail" textStyle="text-md">{values.mother?.email}</TextWithLabel>
                                    <TextWithLabel label="血液型 / grupo sanguineo" textStyle="text-md">{values.mother?.bloodType}</TextWithLabel>
                                </div>
                            </div>
                        </div>}
                </div>
            </div>

            <div className="flex justify-between justify-self-end mt-2">
                <Link href="/nikkai/member/add/parients" className="py-2 px-4 bg-black rounded-md text-base flex-1 text-center">← 扶養家族の情報 / Información de Parientes</Link>
                <div className="flex flex-1 gap-2 text-md items-center justify-center text-text-muted">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span className="text-text font-bold">5</span>
                </div>
                <Link href="#" className="py-2 px-4 bg-black rounded-md text-base flex-1 text-center" onClick={async () => {
                    const values = getValues();
                    const { ...payload } = values;
                    try {
                        const created = await createItem(createDtoToEntity(values));
                        if (!created) {
                            showMessageModal("Error", "Error al crear el miembro");
                        } else {
                            showMessageModal("Confirmación", "Miembro creado exitosamente");
                            reset();
                            router.push("/nikkai/member/add")
                        }
                    } catch (error) {
                        console.error('Error creating member:', error);
                    }
                }}>確認 / Confirmar →</Link>
            </div>
        </div>

    </div>
}

