const defaultApiBase =
  process.env.NODE_ENV === "development"
    ? typeof window === "undefined"
      ? "http://127.0.0.1:8000"
      : ""
    : "https://api.guiji.online";
const rawApiBase = process.env.NEXT_PUBLIC_API_BASE || defaultApiBase;

export const API_V1_BASE = normalizeApiV1Base(rawApiBase);

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_V1_BASE}${normalizedPath}`;
}

function normalizeApiV1Base(base: string) {
  const trimmed = base.trim().replace(/\/+$/, "");
  if (!trimmed) return "/api/v1";
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
}
