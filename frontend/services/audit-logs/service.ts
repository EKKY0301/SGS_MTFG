import { serverApiRequest } from "@/services/server/apiRequest";
import { AuditLog } from "@/types";

export type AuditLogSearchFilters = {
  from?: string;
  to?: string;
};

export type AuditLogSearchInput = {
  paginationData: {
    page: number;
    itemsPerPage: number;
    orderBy?: string;
    order?: "asc" | "desc";
  };
  filters?: AuditLogSearchFilters;
};

export type AuditLogSearchResponse = {
  data: AuditLog[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function searchAuditLogs(input: AuditLogSearchInput) {
  return serverApiRequest.post<AuditLogSearchResponse>("audit-logs/search", {
    paginationData: input.paginationData,
    filters: input.filters ?? {},
  });
}

export async function exportAuditLogsPdf(input: AuditLogSearchInput): Promise<Blob> {
  const response = await fetch("/api/backend/audit-logs/export-pdf", {
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
