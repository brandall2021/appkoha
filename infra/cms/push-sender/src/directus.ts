export interface DirectusClient {
  createItem(coleccion: string, data: Record<string, unknown>): Promise<void>;
  listItems<T>(coleccion: string, query?: string): Promise<T[]>;
  deleteItem(coleccion: string, id: string): Promise<void>;
}

export function createDirectusClient(baseUrl: string, serviceToken: string): DirectusClient {
  async function call<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${serviceToken}`,
        "content-type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) throw new Error(`Directus ${res.status}: ${await res.text()}`);
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }
  return {
    async createItem(coleccion: string, data: Record<string, unknown>) {
      await call(`/items/${coleccion}`, { method: "POST", body: JSON.stringify({ ...data }) });
    },
    async listItems<T>(coleccion: string, query = "limit=-1") {
      const out = await call<{ data: T[] }>(`/items/${coleccion}?${query}`);
      return out.data;
    },
    async deleteItem(coleccion: string, id: string) {
      await call(`/items/${coleccion}/${id}`, { method: "DELETE" });
    },
  };
}
