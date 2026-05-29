"use client"

import ScrollArea from "@/components/ScrollArea";
import TabContainer from "@/components/TabbedContainer";
import { DETAIL_LINKS } from "@/datas/detailLinkList";
import { useMemberContext } from "@/services/members/context/context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const memberId = searchParams.get("id");
    const { selectedItem, getById, isLoading } = useMemberContext();

    useEffect(() => {
        if (!memberId) {
            return;
        }

        if (selectedItem?.id === memberId) {
            return;
        }

        getById(memberId).catch(() => {
            router.push("/nikkai/member/list");
        });
    }, [getById, memberId, router, selectedItem?.id]);

    const onTabChange = (index: number) => {
        const href = DETAIL_LINKS[index];
        router.push(memberId ? `${href}?id=${memberId}` : href);
    };

    return <div className="p-5 w-full h-full">
        <div className="w-full h-full flex flex-col rounded-md p-5 bg-background-dark">
            <TabContainer tabs={["本人情報", "夫・妻の情報", "子供の情報", "扶養家族の情報"]} onTabChange={onTabChange} />
            {
                selectedItem ?
                    <>
                        <div className="flex flex-col gap-2 max-h-[90%] h-[90%]">
                            <div className="flex flex-col gap-2 flex-1 max-h-[100%] h-full">
                                <ScrollArea>
                                    {children}
                                </ScrollArea>
                            </div>
                        </div>

                        {/* <div className="flex justify-between justify-self-end">
                            <Link href="parients" className="py-2 px-4 bg-black rounded-md text-xl flex-1 text-center">← 扶養家族の情報 / Información de Parientes</Link>
                            <div className="flex flex-1 gap-2 text-md items-center justify-center text-text-muted">
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                                <span className="text-text font-bold">5</span>
                            </div>
                            <Link href="#" className="py-2 px-4 bg-black rounded-md text-xl flex-1 text-center">確認 / Confirmar →</Link>
                        </div> */}
                    </>
                    :
                    <>
                        <p className="text-2xl font-bold text-center">{isLoading && memberId ? "Cargando socio..." : "No se ha seleccionado ningún miembro"}</p>
                    </>
            }
        </div>

    </div>
}
