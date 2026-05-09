export function getApiBaseUrl(): string {
  const v = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (v && v.trim().length > 0) return v.trim().replace(/\/$/, "")
  // Mesmo prefixo que `api` em api/app/main.py; no dev o Vite repassa /api → :8000
  return "/api"
}
