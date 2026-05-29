import { PaginationData } from "@/types/paginationData"
import clsx from "clsx"
import Paginator from "./Paginator";
import Filters, { FilterField, FilterValues } from "./Filters";

interface ListProps<T> {
    list: T[], //list of items to render in the table
    title?: string, //titulo que va en el h1 del componente
    thComponent: React.ReactElement, //component that will render on the th of the table, only with <></>, list of <th>...</th>
    toTdComponent: (item: T) => React.ReactElement //component that will render on the td of the table, it will receive the item as a prop
    paginationData?: PaginationData, //datos para el componente de paginación
    onPageChange?: (page: number) => void, //funcion que se ejecuta al generar un cambio en la pagina
    onSelectItem?: (item: T) => void, //funcion que se ejecuta al hacer click en un item de la lista, recibe el item como parametro
    filterFields?: FilterField[],
    filterValues?: FilterValues,
    onFiltersChange?: (values: FilterValues) => void,
    onApplyFilters?: () => void,
    showFilterApplyButton?: boolean,
}

export default function List<T>({
    title,
    list,
    thComponent,
    toTdComponent,
    paginationData,
    onPageChange,
    onSelectItem,
    filterFields,
    filterValues,
    onFiltersChange,
    onApplyFilters,
    showFilterApplyButton = true,
}: ListProps<T>): React.ReactElement {

    const handleClick = (index: number) => {
        if ((index+1) && onSelectItem) {
            const item = list[Number(index)];
            onSelectItem(item);
        } else {
            console.warn("No se pudo obtener el index del item seleccionado o no se proporcionó una función onSelectItem");
        }
    }


    return <div className="text-black w-full h-full flex flex-col gap-2 min-h-0 flex-1">
        {title && <h1 className="text-3xl font-bold">{title}</h1>}
        {filterFields && filterValues && onFiltersChange ? (
            <Filters
                fields={filterFields}
                values={filterValues}
                onFiltersChange={onFiltersChange}
                onApply={onApplyFilters}
                showApplyButton={showFilterApplyButton}
            />
        ) : null}
        <table className="w-full flex-1">
            <thead>
                <tr className={clsx('border-b border-black/20 text-left select-none')}>
                    {thComponent}
                </tr>
            </thead>
            <tbody>
                { list.length === 0 ? <tr><td colSpan={100} className="text-center">No hay datos para mostrar</td></tr> : <></>}
                { list.length < 10 ? 
                    <>
                        { list.map((item, index) => <tr className={clsx('select-none hover:bg-black/5 bg-transparent hover:cursor-pointer')} key={clsx(typeof item, "-", index)} onClick={()=>{handleClick(index)}}>{toTdComponent(item)}</tr>) }
                        { Array.from({ length: 10 - list.length }, (_, i) => <tr key={clsx("empty", "-", i)}><td colSpan={100}>&nbsp;</td></tr>) }
                    </>
                    : 
                    list.map((item, index) => <tr className={clsx('select-none hover:bg-black/5 bg-transparent hover:cursor-pointer')} key={clsx(typeof item, "-", index)} onClick={()=>{handleClick(index)}}>{toTdComponent(item)}</tr>) 
                }
                
            </tbody>
        </table>
        <Paginator paginationData={paginationData} onPageChange={onPageChange} />
    </div>
}