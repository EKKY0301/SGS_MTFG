"use client";

import { ApiProvider, useApiContext } from "@/services/api/context/context";

export const GroupProvider = ApiProvider;
export const useGroupContext = () => useApiContext().groups;
