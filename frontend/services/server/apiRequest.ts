async function request<TResponse>(method: "GET" | "POST" | "PATCH" | "DELETE", path: string, body?: unknown): Promise<TResponse> {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const response = await fetch(`/api/backend/${normalizedPath}`, {
    method,
    cache: "no-store",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server proxy request failed (${response.status}): ${errorText}`);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export const serverApiRequest = {
  get: <TResponse>(path: string) => request<TResponse>("GET", path),
  post: <TResponse>(path: string, body?: unknown) => request<TResponse>("POST", path, body),
  patch: <TResponse>(path: string, body?: unknown) => request<TResponse>("PATCH", path, body),
  delete: <TResponse>(path: string, body?: unknown) => request<TResponse>("DELETE", path, body),
};
