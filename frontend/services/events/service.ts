import { clientApiRequest } from "@/services/client/apiRequest";
import { CrudService, EntityId, ListBody, ListResponse } from "@/services/shared/crud";
import { Event } from "@/types/event";

export const eventsService: CrudService<Event, Partial<Event>, Partial<Event>> = {
  list: (body?: ListBody) => clientApiRequest.post<ListResponse<Event>>("events/list", body ?? {}),
  getById: (id: EntityId) => clientApiRequest.get<Event>(`events/${id}`),
  create: (input: Partial<Event>) => clientApiRequest.post<Event>("events", input),
  update: (id: EntityId, input: Partial<Event>) => clientApiRequest.patch<Event>(`events/${id}`, input),
  remove: async (id: EntityId) => {
    await clientApiRequest.delete<unknown>(`events/${id}`);
  },
};

export function searchAllEvents() {
  return clientApiRequest.get<Event[] | { data: Event[] }>("events");
}

export async function exportEventsSearchPdf(input?: ListBody): Promise<Blob> {
  const response = await fetch("/api/backend/events/export-pdf", {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input ?? {}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PDF export failed (${response.status}): ${errorText}`);
  }

  return await response.blob();
}

export async function exportEventDetailPdf(eventId: string): Promise<Blob> {
  const response = await fetch(`/api/backend/events/${encodeURIComponent(eventId)}/export-pdf`, {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PDF export failed (${response.status}): ${errorText}`);
  }

  return await response.blob();
}
