import clsx from "clsx";

export default function TextWithLabel({ children, label, textStyle }: { children: React.ReactNode, label: string, textStyle?: string }) : React.ReactElement {
    return <div className="flex flex-col text-left gap-0 flex-1">
        <label className="text-text-muted">{label}</label>
        <p className={clsx(textStyle??"font-bold text-xl")}>{children}</p>
    </div>
}