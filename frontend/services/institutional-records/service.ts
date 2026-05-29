import { clientApiRequest } from "@/services/client/apiRequest";
import { CrudService, EntityId, ListBody, ListResponse } from "@/services/shared/crud";
import { InstitutionalRecord } from "@/types/institutionalRecord";
import { toDateOnlyApiValue } from "@/utils/functions";

export const institutionalRecordsService: CrudService<InstitutionalRecord, Partial<InstitutionalRecord>, Partial<InstitutionalRecord>> = {
  list: (body?: ListBody) => clientApiRequest.post<ListResponse<InstitutionalRecord>>("institutional-records/search", body ?? {}),
  getById: (id: EntityId) => clientApiRequest.get<InstitutionalRecord>(`institutional-records/${id}`),
  create: (input: Partial<InstitutionalRecord>) => clientApiRequest.post<InstitutionalRecord>("institutional-records", input),
  update: (id: EntityId, input: Partial<InstitutionalRecord>) =>
    clientApiRequest.patch<InstitutionalRecord>(`institutional-records/${id}`, input),
  remove: async (id: EntityId) => {
    await clientApiRequest.delete<unknown>(`institutional-records/${id}`);
  },
};

export async function uploadInstitutionalRecordPdf(input: {
  title: string;
  type: string;
  recordDate: string;
  description?: string;
  file: File;
}) {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("type", input.type);
  const recordDate = toDateOnlyApiValue(input.recordDate);
  if (recordDate) {
    formData.append("recordDate", recordDate);
  }
  if (input.description) {
    formData.append("description", input.description);
  }
  formData.append("file", input.file);

  const response = await fetch(`/api/backend/institutional-records/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<InstitutionalRecord>;
}

export async function downloadInstitutionalRecordPdf(id: string): Promise<Blob> {
  const response = await fetch(`/api/backend/institutional-records/${id}/download`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.blob();
}
