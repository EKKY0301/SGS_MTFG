// Datos de paginacion alineados al backend (PaginationDataDto + respuesta paginada)
export type PaginationData = {
    page: number,
    limit: number,
    orderBy?: string,
    order?: "asc" | "desc",
    total?: number,
    totalPages?: number
}