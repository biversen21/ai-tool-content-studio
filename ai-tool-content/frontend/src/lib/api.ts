const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null) as { error?: unknown } | null;
    const detail = data?.error ? JSON.stringify(data.error) : `${res.status} ${res.statusText}`;
    throw new Error(`POST ${path} → ${detail}`);
  }
  return res.json() as Promise<T>;
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null) as { error?: unknown } | null;
    const detail = data?.error ? JSON.stringify(data.error) : `${res.status} ${res.statusText}`;
    throw new Error(`PATCH ${path} → ${detail}`);
  }
  return res.json() as Promise<T>;
}

export interface Tool {
  id: string;
  slug: string;
  name: string;
  websiteUrl: string | null;
  category: string | null;
  description: string | null;
  affiliateUrl: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthResponse {
  status: "ok";
  service: string;
  timestamp: string;
}

export const getHealth = () => apiGet<HealthResponse>("/api/health");
export const getTools = () => apiGet<{ tools: Tool[] }>("/api/tools");
export const getTool = (id: string) => apiGet<{ tool: Tool }>(`/api/tools/${id}`);
export const createTool = (body: { name: string; affiliateUrl?: string; notes?: string }) =>
  apiPost<{ tool: Tool }>("/api/tools", body);
export const updateTool = (id: string, body: { name?: string; slug?: string; affiliateUrl?: string | null; notes?: string | null; status?: string }) =>
  apiPatch<{ tool: Tool }>(`/api/tools/${id}`, body);
