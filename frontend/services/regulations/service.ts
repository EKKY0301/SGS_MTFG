import { clientApiRequest } from "@/services/client/apiRequest";
import { CrudService, EntityId, ListBody, ListResponse } from "@/services/shared/crud";
import { Regulation } from "@/types/regulation";
import { toDateOnlyApiValue } from "@/utils/functions";

export const regulationsService: CrudService<Regulation, Partial<Regulation>, Partial<Regulation>> = {
  list: (body?: ListBody) => clientApiRequest.post<ListResponse<Regulation>>("regulations/search", body ?? {}),
  getById: (id: EntityId) => clientApiRequest.get<Regulation>(`regulations/${id}`),
  create: (input: Partial<Regulation>) => clientApiRequest.post<Regulation>("regulations", input),
  update: (id: EntityId, input: Partial<Regulation>) => clientApiRequest.patch<Regulation>(`regulations/${id}`, input),
  remove: async (id: EntityId) => {
    await clientApiRequest.delete<unknown>(`regulations/${id}`);
  },
};

export async function uploadRegulationPdf(input: {
  title: string;
  type: string;
  version: string;
  effectiveDate?: string;
  description?: string;
  file: File;
}) {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("type", input.type);
  formData.append("version", input.version);
  const effectiveDate = toDateOnlyApiValue(input.effectiveDate);
  if (effectiveDate) {
    formData.append("effectiveDate", effectiveDate);
  }
  if (input.description) {
    formData.append("description", input.description);
  }
  formData.append("file", input.file);

  const response = await fetch(`/api/backend/regulations/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<Regulation>;
}

export async function downloadRegulationPdf(id: string): Promise<Blob> {
  const response = await fetch(`/api/backend/regulations/${id}/download`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.blob();
}
