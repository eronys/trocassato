import { getApiBaseUrl } from "@/utils/env";

export type ApiError = {
  status: number;
  message: string;
};

async function parseError(res: Response): Promise<ApiError> {
  let message = "Erro inesperado";
  try {
    const data = (await res.json()) as { detail?: unknown; message?: unknown };
    const detail = data?.detail ?? data?.message;
    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail)) {
      const parts = detail
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const it = item as { loc?: unknown; msg?: unknown };
          const loc = Array.isArray(it.loc) ? it.loc.filter((p) => typeof p === "string" || typeof p === "number").join(".") : "";
          const msg = typeof it.msg === "string" ? it.msg : "Erro de validação";
          return loc ? `${loc}: ${msg}` : msg;
        })
        .filter((x): x is string => typeof x === "string" && x.length > 0);
      if (parts.length > 0) message = parts.join(" | ");
    } else if (detail) {
      message = JSON.stringify(detail);
    }
  } catch {
    message = res.statusText || message;
  }
  return { status: res.status, message };
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw await parseError(res);
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof TypeError) {
      throw { status: 0, message: "Não foi possível conectar à API. Verifique se o backend está rodando na porta 8000." } satisfies ApiError;
    }
    throw err;
  }
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw await parseError(res);
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof TypeError) {
      throw { status: 0, message: "Não foi possível conectar à API. Verifique se o backend está rodando na porta 8000." } satisfies ApiError;
    }
    throw err;
  }
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw await parseError(res);
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof TypeError) {
      throw { status: 0, message: "Não foi possível conectar à API. Verifique se o backend está rodando na porta 8000." } satisfies ApiError;
    }
    throw err;
  }
}

export async function apiDelete<T>(path: string): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  try {
    const res = await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw await parseError(res);
    // alguns endpoints retornam {} / {ok:true}
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof TypeError) {
      throw { status: 0, message: "Não foi possível conectar à API. Verifique se o backend está rodando na porta 8000." } satisfies ApiError;
    }
    throw err;
  }
}
