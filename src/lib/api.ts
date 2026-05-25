const rawApiBase = process.env.NEXT_PUBLIC_API_BASE || "https://api.guiji.online";

export const API_V1_BASE = normalizeApiV1Base(rawApiBase);

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_V1_BASE}${normalizedPath}`;
}

function normalizeApiV1Base(base: string) {
  const trimmed = base.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
}
