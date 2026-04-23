/**
 * Tiny fetch wrapper. The Vite dev server proxies /api → backend, so relative
 * paths Just Work in dev. In a built deploy, set VITE_API_BASE_URL.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export interface HealthResponse {
  status: "ok";
  service: string;
  timestamp: string;
}

export const getHealth = () => apiGet<HealthResponse>("/api/health");
