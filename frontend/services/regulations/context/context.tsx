"use client";

import { ApiProvider, useApiContext } from "@/services/api/context/context";

export const RegulationsProvider = ApiProvider;
export const useRegulationsContext = () => useApiContext().regulations;
