export type EntityId = string;

export type PaginationRequest = {
  page?: number;
  itemsPerPage?: number;
  orderBy?: string;
  order?: "asc" | "desc";
};

export type ListBody = {
  paginationData?: PaginationRequest;
  filters?: Record<string, unknown>;
};

export type ReturnPaginationDataDto = {
  page?: number | null;
  currentPage?: number | null;
  itemsPerPage?: number | null;
  totalItems?: number | null;
};

export type PaginatedListResponse<TItem> = {
  paginationData: ReturnPaginationDataDto;
  items: TItem[];
};

export type ListResponse<TItem> = TItem[] | PaginatedListResponse<TItem>;

export interface CrudService<TItem, TCreateInput, TUpdateInput> {
  list: (body?: ListBody) => Promise<ListResponse<TItem>>;
  getById: (id: EntityId) => Promise<TItem>;
  create: (input: TCreateInput) => Promise<TItem>;
  update: (id: EntityId, input: TUpdateInput) => Promise<TItem>;
  remove: (id: EntityId) => Promise<void>;
}
