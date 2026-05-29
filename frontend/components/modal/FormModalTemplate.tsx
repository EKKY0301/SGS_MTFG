type ConfirmationModalProps = {
    children: React.ReactNode;
}

export function FormModalTemplate ({ children }: ConfirmationModalProps) {
    return <div className="flex flex-col gap-5">
        {children}
    </div>
}