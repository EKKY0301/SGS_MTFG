"use client";

import { ApiProvider, useApiContext } from "@/services/api/context/context";

export const EventAttendanceProvider = ApiProvider;
export const useEventAttendancesContext = () => useApiContext().eventAttendances;
