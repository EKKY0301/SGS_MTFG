'use client'
import Image from "next/image";
import { useSessionContext } from "@/services/session/context/context";
import NavbarTabs from "./NavbarTabs";

const Navbar = () => {

    const { user, logout } = useSessionContext();
 
    return <div className="bg-primary w-full h-full flex px-[2.5%] shadow-md items-center justify-between">
        <Image src="/favicon.ico" alt="Logo de la asociacion" width={44} height={44} className="rounded-sm" priority />
        <div className="flex items-center flex-row h-full">
            <NavbarTabs text="NIKKAI" selected={true} />
            {/* <NavbarTabs text="GAKKO" selected={false} /> */}
        </div>
        <div className="flex flex-row gap-2">
            <h1 className="text-text font-bold text-4xl">{user?.username ?? "USER"}</h1>
            <button className="text-sm text-text/50 hover:text-text transition-colors duration-100" onClick={logout}>Cerrar sesión</button>
        </div>
    </div>
}

export default Navbar;