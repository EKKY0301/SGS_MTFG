"use client";

import { ApiProvider, useApiContext } from "@/services/api/context/context";

export const MemberProvider = ApiProvider;
export const useMemberContext = () => useApiContext().members;
