import { PaginationData } from "@/types/paginationData"

interface PaginatorProps {
    paginationData?: PaginationData, // datos que son centrados en la paginación
    onPageChange?: (page: number) => void // funcion, utilizado para cambiar los datos de la lista
}

export default function Paginator({ paginationData, onPageChange }: PaginatorProps): React.ReactElement {
    const totalPages = paginationData?.totalPages ?? 1;

    return <div className="flex flex-row justify-between items-center w-full ">
        {
            paginationData ?
                <>
                    {paginationData.page > 1 ?
                    <div className="flex flex-row aspect-square w-10 select-none cursor-pointer hover:opacity-80 transition-all duration-150 bg-black rounded-full items-center justify-center text-lg" 
                        onClick={()=>{
                            if(paginationData.page <= 1) return
                            onPageChange?.(paginationData.page - 1)
                        }}>
                        <p className="text-white font-bold">
                            {"<"}
                        </p>
                    </div> 
                    :
                    <div className="flex flex-row aspect-square w-10 select-none transition-all duration-150 bg-black/50 rounded-full items-center justify-center text-lg" >
                        <p className="text-white font-bold">
                            {"<"}
                        </p>
                    </div> 
                    }
                    <div className="flex flex-row items-center">
                        {paginationData.page} / {totalPages}
                    </div>
                    {paginationData.page < totalPages ?
                    <div className="flex flex-row aspect-square w-10 select-none cursor-pointer hover:opacity-80 transition-all duration-150 bg-black rounded-full items-center justify-center text-lg"
                        onClick={() => {
                            if (paginationData.page >= totalPages) return
                            onPageChange?.(paginationData.page + 1)
                        }}>
                        <p className="text-white font-bold">
                            {">"}
                        </p>
                    </div> 
                    : 
                    <div className="flex flex-row aspect-square w-10 select-none transition-all duration-150 bg-black/50 rounded-full items-center justify-center text-lg" >
                        <p className="text-white font-bold">
                            {">"}
                        </p>
                    </div> 
                    }
                </>
                :
                <>Loading...</>
        }

    </div>
}