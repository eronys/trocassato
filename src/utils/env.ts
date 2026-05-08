export function getApiBaseUrl(): string {
  const v = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (v && v.trim().length > 0) return v.trim().replace(/\/$/, "")
  return ""
}
