import { clientApiRequest } from "@/services/client/apiRequest";
import { CrudService, EntityId, ListBody, ListResponse } from "@/services/shared/crud";
import { Member } from "@/types/member";

export type MemberSearchFilters = {
  search?: string;
  role?: string[];
  status?: string[];
  deceased?: boolean;
  hasJapaneseName?: boolean;
  adminParentId?: string;
  birthDateFrom?: string;
  birthDateTo?: string;
  nonPrincipalTurning18ThisYear?: boolean;
  isSeventyOrMore?: boolean;
  groupId?: string;
};

export type MemberSearchPaginationData = {
  page: number;
  itemsPerPage: number;
  orderBy?: string;
  order?: "asc" | "desc";
};

export type MemberSearchInput = {
  paginationData: MemberSearchPaginationData;
  filters?: MemberSearchFilters;
};

export const membersService: CrudService<Member, Partial<Member>, Partial<Member>> = {
  list: (body?: ListBody) => clientApiRequest.post<ListResponse<Member>>("members/list", body ?? {}),
  getById: (id: EntityId) => clientApiRequest.get<Member>(`members/${id}`),
  create: (input: Partial<Member>) => clientApiRequest.post<Member>("members", input),
  update: (id: EntityId, input: Partial<Member>) => clientApiRequest.patch<Member>(`members/${id}`, input),
  remove: async (id: EntityId) => {
    await clientApiRequest.delete<unknown>(`members/${id}`);
  },
};

export function searchMembers(input: MemberSearchInput) {
  return clientApiRequest.post<{ data: Member[]; page: number; limit: number; total: number; totalPages: number }>(
    "members/search",
    {
      paginationData: input.paginationData,
      filters: input.filters ?? {},
    },
  );
}

export async function exportMembersSearchPdf(input: MemberSearchInput): Promise<Blob> {
  const response = await fetch("/api/backend/members/export-pdf", {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paginationData: input.paginationData,
      filters: input.filters ?? {},
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PDF export failed (${response.status}): ${errorText}`);
  }

  return await response.blob();
}

export function createChildren(id: string, input: unknown) {
  return clientApiRequest.post(`members/${id}/children`, {
    children: input,
  });
}

export function createRelated(id: string, input: unknown) {
  return clientApiRequest.post(`members/${id}/related`, input);
}

export function establishDeathDate(id: string, deathDate: string) {
  return clientApiRequest.patch(`members/${id}/deceased`, {
    deathDate,
  });
}
