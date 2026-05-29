import { serverApiRequest } from "@/services/server/apiRequest";

export type LoginCredentials = {
  username: string;
  password: string;
};

export type SessionUser = {
  id?: string;
  username?: string;
  role?: string;
};

export async function loginWithServerAuth(credentials: LoginCredentials): Promise<SessionUser> {
  const response = await serverApiRequest.post<SessionUser>("auth/login", credentials);
  if (!response) {
    throw new Error("No se pudo iniciar sesión");
  }
  return response;
}

export async function logoutWithServerAuth(): Promise<void> {
  await serverApiRequest.post<unknown>("auth/logout", {});
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    return await serverApiRequest.get<SessionUser>("auth/me");
  } catch {
    return null;
  }
}
