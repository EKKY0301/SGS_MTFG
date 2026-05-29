import { clientApiRequest } from "@/services/client/apiRequest";
import { CrudService, EntityId, ListBody, ListResponse } from "@/services/shared/crud";
import { EventAttendance } from "@/types/event";

export const eventAttendancesService: CrudService<EventAttendance, Partial<EventAttendance>, Partial<EventAttendance>> = {
  list: (body?: ListBody) => clientApiRequest.post<ListResponse<EventAttendance>>("event-attendances/list", body ?? {}),
  getById: (id: EntityId) => clientApiRequest.get<EventAttendance>(`event-attendances/${id}`),
  create: (input: Partial<EventAttendance>) => clientApiRequest.post<EventAttendance>("event-attendances", input),
  update: (id: EntityId, input: Partial<EventAttendance>) => clientApiRequest.patch<EventAttendance>(`event-attendances/${id}`, input),
  remove: async (id: EntityId) => {
    await clientApiRequest.delete<unknown>(`event-attendances/${id}`);
  },
};

export function getEventAttendancesByEventId(eventId: string) {
  return clientApiRequest.get<EventAttendance[]>(`event-attendances/${eventId}`);
}

export function createEventAttendance(input: Partial<EventAttendance>) {
  return clientApiRequest.post<EventAttendance>("event-attendances", input);
}

export function updateEventAttendance(id: string, input: Partial<EventAttendance>) {
  return clientApiRequest.patch<EventAttendance>(`event-attendances/${id}`, input);
}

export async function deleteEventAttendance(id: string) {
  await clientApiRequest.delete<unknown>(`event-attendances/${id}`);
}
