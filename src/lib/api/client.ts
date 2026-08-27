import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api";

let tokenProvider: (() => Promise<string | null>) | null = null;

export function setTokenProvider(provider: () => Promise<string | null>) {
  tokenProvider = provider;
}

interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  noAuth?: boolean;
}

async function buildHeaders(opts: {
  noAuth?: boolean;
  contentType?: string;
}): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": opts.contentType ?? "application/json",
  };

  if (!opts.noAuth && tokenProvider) {
    const token = await tokenProvider();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, noAuth, headers: customHeaders, ...rest } = options;
  const headers = {
    ...(await buildHeaders({ noAuth })),
    ...customHeaders,
  };

  const init: RequestInit = { ...rest, headers };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, init);

  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      (json as Record<string, unknown> | null)?.message ??
      `HTTP ${res.status}`;
    const err = new Error(String(msg));
    (err as Error & { status: number; errors?: unknown }).status = res.status;
    (err as Error & { status: number; errors?: unknown }).errors =
      (json as Record<string, unknown> | null)?.errors;
    throw err;
  }

  return json as T;
}
