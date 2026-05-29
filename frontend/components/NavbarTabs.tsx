import { clsx } from "clsx";

const NavbarTabs = ({ text, selected }: { text: string, selected: boolean }) => {
    return <div className={clsx(
            "text-text text-2xl px-5 flex-1 h-full flex items-center select-none hover:font-bold hover:border-b-[0.3vw] hover:border-text transition-all duration-100 cursor-pointer", 
            selected && "font-bold border-b-[0.3vw] border-text")
        }>
        <p>
            {text}
        </p>
    </div>
}

export default NavbarTabs;

