interface ModalContainerProps {
    isOpen: boolean;
    content: React.ReactNode;
    title: string;
    toggleShown: () => void;
}

export function ModalContainer({ isOpen, content, title, toggleShown }: ModalContainerProps) {
    if (!isOpen) return null;
    return <>
        {
            isOpen && <div className="absolute w-screen h-screen bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-md flex flex-col gap-5 w-[60vw] max-h-[80vh] overflow-scroll no-scrollbar">
                    <div className="w=full px-5 py-2 flex flex-row justify-between border-b items-center border-black/10">
                        <h2 className="text-xl font-bold text-black">{title}</h2>
                        <button className="text-gray-400 bg-transparent w-10 aspect-square rounded-full hover:bg-black/25 cursor-pointer" onClick={() => {toggleShown()}}>X</button>
                    </div>
                    <div className="p-5">
                        {content}
                    </div>
                </div>
            </div>
            

        }
    </>
}