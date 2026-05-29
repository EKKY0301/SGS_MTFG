"use client";

import { ApiProvider, useApiContext } from "@/services/api/context/context";

export const InstitutionalRecordsProvider = ApiProvider;
export const useInstitutionalRecordsContext = () => useApiContext().institutionalRecords;
