const RAW_CLIENT_BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "/api/backend";

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const CLIENT_BACKEND_BASE_URL = normalizeBaseUrl(RAW_CLIENT_BACKEND_BASE_URL);

async function request<TResponse>(method: "GET" | "POST" | "PATCH" | "DELETE", path: string, body?: unknown): Promise<TResponse> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${CLIENT_BACKEND_BASE_URL}${normalizedPath}`, {
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
    throw new Error(`Client request failed (${response.status}): ${errorText}`);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export const clientApiRequest = {
  get: <TResponse>(path: string) => request<TResponse>("GET", path),
  post: <TResponse>(path: string, body?: unknown) => request<TResponse>("POST", path, body),
  patch: <TResponse>(path: string, body?: unknown) => request<TResponse>("PATCH", path, body),
  delete: <TResponse>(path: string, body?: unknown) => request<TResponse>("DELETE", path, body),
};
