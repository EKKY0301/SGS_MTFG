"use client";

import { ApiProvider, useApiContext } from "@/services/api/context/context";

export const EventProvider = ApiProvider;
export const useEventContext = () => useApiContext().events;
