type ConfirmationModalProps = {
    onConfirm: () => void;
    onCancel: () => void;
    text: string;
}

export function ConfirmationModal ({ onConfirm, onCancel, text }: ConfirmationModalProps) {
    return <div className="flex flex-col gap-5">
        <p className="text-black text-lg">{text}</p>
        <div className="flex flex-row gap-2 justify-end">
            <button className="px-4 py-2 bg-red-400 rounded-md" onClick={onCancel}>Cancelar</button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md" onClick={onConfirm}>Confirmar</button>
        </div>
    </div>
}