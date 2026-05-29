import GroupHandler from "@/components/config/GroupContainer";
import ScrollArea from "@/components/ScrollArea";
import Link from "next/link";

export default function ConfigPage(){
    return <div className="w-full h-full p-5">
        <div className="w-full h-full bg-background-dark rounded-md p-8">
            <h1 className="text-text font-bold text-2xl">LISTA DE CONFIGURACIONES</h1>
            <ScrollArea>
                <div className="w-full h-full mt-5">
                    <div className="w-full bg-background-light rounded-md mb-3 flex flex-col py-2 px-4 gap-2">
                        <span className="text-text">Grupos</span>
                        <GroupHandler />
                    </div>
                    <Link className="w-full h-12 bg-background-light rounded-md mb-3 flex items-center justify-between px-4 select-none transition-all duration-150 hover:bg-background-light/80 cursor-pointer" 
                        href="/nikkai/config/audit">
                        <span className="text-text">Historial de Modificación</span>
                        <span className="text-sm text-gray-400">→</span>
                    </Link>
                    <div className="w-full h-12 bg-background-light rounded-md mb-3 flex items-center px-4">
                        <span className="text-text">CONFIGURACIÓN 3</span>
                    </div>
                </div>
            </ScrollArea>
        </div>
    </div>
}
