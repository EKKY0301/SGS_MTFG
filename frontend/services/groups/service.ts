import { clientApiRequest } from "@/services/client/apiRequest";
import { CrudService, EntityId, ListBody, ListResponse } from "@/services/shared/crud";
import { Group } from "@/types/group";

export const groupsService: CrudService<Group, Partial<Group>, Partial<Group>> = {
  list: (body?: ListBody) => clientApiRequest.post<ListResponse<Group>>("groups/list", body ?? {}),
  getById: (id: EntityId) => clientApiRequest.get<Group>(`groups/${id}`),
  create: (input: Partial<Group>) => clientApiRequest.post<Group>("groups", input),
  update: (id: EntityId, input: Partial<Group>) => clientApiRequest.patch<Group>(`groups/${id}`, input),
  remove: async (id: EntityId) => {
    await clientApiRequest.delete<unknown>(`groups/${id}`);
  },
};
