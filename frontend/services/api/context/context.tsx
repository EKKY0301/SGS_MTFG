"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { eventsService } from "@/services/events/service";
import { eventAttendancesService } from "@/services/event-attendances/service";
import { groupsService } from "@/services/groups/service";
import { membersService } from "@/services/members/service";
import { institutionalRecordsService } from "@/services/institutional-records/service";
import { regulationsService } from "@/services/regulations/service";
import { CrudService, EntityId, ListBody, ListResponse, PaginatedListResponse } from "@/services/shared/crud";
import { Event, EventAttendance } from "@/types/event";
import { Group } from "@/types/group";
import { InstitutionalRecord } from "@/types/institutionalRecord";
import { Member } from "@/types/member";
import { PaginationData } from "@/types/paginationData";
import { Regulation } from "@/types/regulation";

export interface CrudSliceValue<TItem, TCreateInput, TUpdateInput> {
  items: TItem[];
  paginationData: PaginationData | null;
  selectedItem: TItem | null;
  isLoading: boolean;
  error: string | null;
  list: (queryParams?: ListBody) => Promise<TItem[]>;
  getById: (id: EntityId) => Promise<TItem>;
  createItem: (input: TCreateInput) => Promise<TItem>;
  updateItem: (id: EntityId, input: TUpdateInput) => Promise<TItem>;
  deleteItem: (id: EntityId) => Promise<void>;
  setSelectedItem: (item: TItem | null) => void;
  clearError: () => void;
}

export interface ApiContextValue {
  events: CrudSliceValue<Event, Partial<Event>, Partial<Event>>;
  eventAttendances: CrudSliceValue<EventAttendance, Partial<EventAttendance>, Partial<EventAttendance>>;
  groups: CrudSliceValue<Group, Partial<Group>, Partial<Group>>;
  members: CrudSliceValue<Member, Partial<Member>, Partial<Member>>;
  institutionalRecords: CrudSliceValue<InstitutionalRecord, Partial<InstitutionalRecord>, Partial<InstitutionalRecord>>;
  regulations: CrudSliceValue<Regulation, Partial<Regulation>, Partial<Regulation>>;
}

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

function updateItemInList<TItem>(items: TItem[], item: TItem, idSelector: (value: TItem) => EntityId): TItem[] {
  const itemId = idSelector(item);
  const exists = items.some((current) => idSelector(current) === itemId);

  if (!exists) {
    return [item, ...items];
  }

  return items.map((current) => (idSelector(current) === itemId ? item : current));
}

function isPaginatedResponse<TItem>(data: ListResponse<TItem>): data is PaginatedListResponse<TItem> {
  return !Array.isArray(data) && typeof data === "object" && data !== null && Array.isArray(data.items);
}

function toItems<TItem>(data: ListResponse<TItem>): TItem[] {
  return isPaginatedResponse(data) ? data.items : data;
}

function toPaginationData<TItem>(data: ListResponse<TItem>): PaginationData | null {
  if (!isPaginatedResponse(data)) {
    return null;
  }

  return {
    page: data.paginationData.page ?? 1,
    limit: data.paginationData.itemsPerPage ?? 10,
    total: data.paginationData.totalItems ?? 0,
    totalPages: Math.ceil((data.paginationData.totalItems ?? 0) / (data.paginationData.itemsPerPage ?? 10)),
  };
}

function useCrudSlice<TItem, TCreateInput, TUpdateInput>(
  service: CrudService<TItem, TCreateInput, TUpdateInput>,
  idSelector: (item: TItem) => EntityId,
): CrudSliceValue<TItem, TCreateInput, TUpdateInput> {
  const [items, setItems] = useState<TItem[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData | null>(null);
  const [selectedItem, setSelectedItem] = useState<TItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runOperation = useCallback(async <TResult,>(operation: () => Promise<TResult>): Promise<TResult> => {
    setIsLoading(true);
    setError(null);

    try {
      return await operation();
    } catch (operationError) {
      const message = operationError instanceof Error ? operationError.message : "Ocurrio un error inesperado";
      setError(message);
      throw operationError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const list = useCallback(
    async (queryParams?: ListBody) =>
      runOperation(async () => {
        const response = await service.list(queryParams);
        const normalizedItems = toItems(response);
        setItems(normalizedItems);
        setPaginationData(toPaginationData(response));
        return normalizedItems;
      }),
    [runOperation, service],
  );

  const getById = useCallback(
    async (id: EntityId) =>
      runOperation(async () => {
        const item = await service.getById(id);
        setSelectedItem(item);
        setItems((current) => updateItemInList(current, item, idSelector));
        return item;
      }),
    [idSelector, runOperation, service],
  );

  const createItem = useCallback(
    async (input: TCreateInput) =>
      runOperation(async () => {
        const item = await service.create(input);
        setSelectedItem(item);
        setItems((current) => updateItemInList(current, item, idSelector));
        return item;
      }),
    [idSelector, runOperation, service],
  );

  const updateItem = useCallback(
    async (id: EntityId, input: TUpdateInput) =>
      runOperation(async () => {
        const item = await service.update(id, input);
        setItems((current) => updateItemInList(current, item, idSelector));
        setSelectedItem((current) => {
          if (!current) {
            return current;
          }

          return idSelector(current) === id ? item : current;
        });
        return item;
      }),
    [idSelector, runOperation, service],
  );

  const deleteItem = useCallback(
    async (id: EntityId) =>
      runOperation(async () => {
        await service.remove(id);
        setItems((current) => current.filter((item) => idSelector(item) !== id));
        setSelectedItem((current) => {
          if (!current) {
            return current;
          }

          return idSelector(current) === id ? null : current;
        });
      }),
    [idSelector, runOperation, service],
  );

  const clearError = useCallback(() => setError(null), []);

  return useMemo(
    () => ({
      items,
      paginationData,
      selectedItem,
      isLoading,
      error,
      list,
      getById,
      createItem,
      updateItem,
      deleteItem,
      setSelectedItem,
      clearError,
    }),
    [clearError, createItem, deleteItem, error, getById, isLoading, items, list, paginationData, selectedItem, updateItem],
  );
}

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const events = useCrudSlice(eventsService, (event) => event.id);
  const eventAttendances = useCrudSlice(eventAttendancesService, (attendance) => attendance.id);
  const groups = useCrudSlice(groupsService, (group) => group.id);
  const members = useCrudSlice(membersService, (member) => member.id ?? "");
  const institutionalRecords = useCrudSlice(institutionalRecordsService, (record) => record.id);
  const regulations = useCrudSlice(regulationsService, (regulation) => regulation.id);

  const value = useMemo(
    () => ({
      events,
      eventAttendances,
      groups,
      members,
      institutionalRecords,
      regulations,
    }),
    [events, eventAttendances, groups, members, institutionalRecords, regulations],
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApiContext(): ApiContextValue {
  const context = useContext(ApiContext);

  if (!context) {
    throw new Error("useApiContext must be used inside ApiProvider");
  }

  return context;
}
