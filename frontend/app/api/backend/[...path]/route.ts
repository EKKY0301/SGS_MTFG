import { NextRequest } from "next/server";

const RAW_BACKEND_BASE_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "");

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const BACKEND_BASE_URL = normalizeBaseUrl(RAW_BACKEND_BASE_URL);

async function proxyRequest(request: NextRequest, path: string[]) {
  if (!BACKEND_BASE_URL) {
    return Response.json(
      {
        message: "Missing backend URL configuration",
        details: "Set BACKEND_URL (recommended) or NEXT_PUBLIC_BACKEND_URL in frontend environment variables.",
      },
      { status: 500 },
    );
  }

  const search = request.nextUrl.search || "";
  const normalizedPath = path.join("/");
  const targetUrl = `${BACKEND_BASE_URL}/${normalizedPath}${search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const cookie = request.headers.get("cookie");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (cookie) {
    headers.set("cookie", cookie);
  }

  const method = request.method;
  const shouldSendBody = method !== "GET" && method !== "HEAD";

  let backendResponse: Response;
  try {
    backendResponse = await fetch(targetUrl, {
      method,
      headers,
      body: shouldSendBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
    });
  } catch (error) {
    return Response.json(
      {
        message: "Backend unreachable from frontend proxy",
        backendBaseUrl: BACKEND_BASE_URL,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  const responseContentType = backendResponse.headers.get("content-type");
  const setCookie = backendResponse.headers.get("set-cookie");

  if (responseContentType) {
    responseHeaders.set("content-type", responseContentType);
  }

  if (setCookie) {
    responseHeaders.set("set-cookie", setCookie);
  }

  const payload = await backendResponse.arrayBuffer();

  return new Response(payload, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxyRequest(request, params.path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxyRequest(request, params.path);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxyRequest(request, params.path);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxyRequest(request, params.path);
}
