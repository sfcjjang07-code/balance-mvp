import { getSupabaseEnv } from "@/lib/db/env";

type QueryOptions = {
  select?: string;
  filters?: Record<string, string | number | boolean>;
  limit?: number;
};

function buildHeaders(serviceRoleKey: string) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };
}

function buildUrl(baseUrl: string, path: string, query?: QueryOptions) {
  const url = new URL(path, `${baseUrl}/`);

  if (query?.select) {
    url.searchParams.set("select", query.select);
  }

  if (typeof query?.limit === "number") {
    url.searchParams.set("limit", String(query.limit));
  }

  if (query?.filters) {
    Object.entries(query.filters).forEach(([key, value]) => {
      url.searchParams.set(key, `eq.${String(value)}`);
    });
  }

  return url.toString();
}

export async function supabaseRpc<T>(fn: string, body: Record<string, unknown> = {}) {
  const env = getSupabaseEnv();
  if (!env.isConfigured || !env.url || !env.serviceRoleKey) {
    return { data: null as T | null, error: new Error("supabase-not-configured") };
  }

  try {
    const response = await fetch(`${env.url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: buildHeaders(env.serviceRoleKey),
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      return { data: null as T | null, error: new Error(`supabase-rpc-${response.status}`) };
    }

    const data = (await response.json()) as T;
    return { data, error: null };
  } catch (error) {
    return { data: null as T | null, error: error as Error };
  }
}

export async function supabaseSelect<T>(table: string, query: QueryOptions = {}) {
  const env = getSupabaseEnv();
  if (!env.isConfigured || !env.url || !env.serviceRoleKey) {
    return { data: null as T | null, error: new Error("supabase-not-configured") };
  }

  try {
    const response = await fetch(buildUrl(env.url, `rest/v1/${table}`, query), {
      method: "GET",
      headers: buildHeaders(env.serviceRoleKey),
      cache: "no-store",
    });

    if (!response.ok) {
      return { data: null as T | null, error: new Error(`supabase-select-${response.status}`) };
    }

    const data = (await response.json()) as T;
    return { data, error: null };
  } catch (error) {
    return { data: null as T | null, error: error as Error };
  }
}
