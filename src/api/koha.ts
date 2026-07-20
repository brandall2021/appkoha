import type { KohaConfig, Biblio, Patron, Checkout, Hold, AccountLine, Item } from "../types";

class KohaAPI {
  private config: KohaConfig;
  private token: string | null = null;

  constructor(config: KohaConfig) {
    this.config = config;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config.libraryId) {
      headers["x-koha-library"] = this.config.libraryId;
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    } else if (this.config.authType === "basic" && this.config.username && this.config.password) {
      const encoded = btoa(`${this.config.username}:${this.config.password}`);
      headers["Authorization"] = `Basic ${encoded}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}/api/v1${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async loginPatron(userid: string, password: string): Promise<Patron> {
    const patrons = await this.request<Patron[]>(
      `/patrons?userid=${encodeURIComponent(userid)}`,
      { method: "GET" }
    );

    if (patrons.length === 0) {
      throw new Error("Usuario no encontrado");
    }

    const patron = patrons[0];

    try {
      const authUrl = `${this.config.baseUrl}/api/v1/auth`;
      const authResponse = await fetch(authUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid, password }),
      });

      if (authResponse.ok) {
        const authData = await authResponse.json();
        this.token = authData.access_token;
      }
    } catch {
      // Auth endpoint may not be available
    }

    return patron;
  }

  async searchBiblios(
    query: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<{ biblios: Biblio[]; total: number }> {
    const encodedQuery = encodeURIComponent(JSON.stringify({ title: { "-like": `%${query}%` } }));
    const data = await this.request<Biblio[]>(
      `/public/biblios?q=${encodedQuery}&page.page=${page}&page.size=${perPage}`,
      { method: "GET" }
    );

    return {
      biblios: Array.isArray(data) ? data : [],
      total: Array.isArray(data) ? data.length : 0,
    };
  }

  async getBiblio(biblioId: number): Promise<Biblio> {
    return this.request<Biblio>(`/biblios/${biblioId}`, {
      method: "GET",
      headers: { "x-koha-embed": "items" },
    });
  }

  async getBiblioItems(biblioId: number): Promise<{ items: Item[] }> {
    return this.request<{ items: Item[] }>(
      `/biblios/${biblioId}/items`,
      { method: "GET" }
    );
  }

  async getPatronCheckouts(patronId: number): Promise<Checkout[]> {
    return this.request<Checkout[]>(
      `/patrons/${patronId}/checkouts`,
      { method: "GET" }
    );
  }

  async getPatronHolds(patronId: number): Promise<Hold[]> {
    return this.request<Hold[]>(
      `/patrons/${patronId}/holds`,
      { method: "GET" }
    );
  }

  async getPatronAccount(patronId: number): Promise<AccountLine[]> {
    return this.request<AccountLine[]>(
      `/patrons/${patronId}/account`,
      { method: "GET" }
    );
  }

  async renewCheckout(checkoutId: number): Promise<Checkout> {
    return this.request<Checkout>(
      `/checkouts/${checkoutId}/renewals`,
      { method: "POST" }
    );
  }

  async placeHold(biblioId: number, patronId: number): Promise<Hold> {
    return this.request<Hold>("/holds", {
      method: "POST",
      body: JSON.stringify({ biblio_id: biblioId, patron_id: patronId }),
    });
  }

  async cancelHold(holdId: number): Promise<void> {
    return this.request<void>(`/holds/${holdId}`, { method: "DELETE" });
  }

  async getLibraries(): Promise<any[]> {
    return this.request<any[]>("/libraries", { method: "GET" });
  }

  async getItemTypes(): Promise<any[]> {
    return this.request<any[]>("/item_types", { method: "GET" });
  }

  async getCategories(): Promise<any[]> {
    return this.request<any[]>("/categories", { method: "GET" });
  }

  async searchByISBN(isbn: string): Promise<Biblio | null> {
    try {
      const encodedQuery = encodeURIComponent(JSON.stringify({ isbn }));
      const data = await this.request<Biblio[]>(
        `/biblios?q=${encodedQuery}`,
        { method: "GET" }
      );
      return Array.isArray(data) && data.length > 0 ? data[0] : null;
    } catch {
      return null;
    }
  }
}

let kohaApi: KohaAPI | null = null;

export function initKohaAPI(config: KohaConfig): KohaAPI {
  kohaApi = new KohaAPI(config);
  return kohaApi;
}

export function getKohaAPI(): KohaAPI {
  if (!kohaApi) {
    throw new Error("KohaAPI not initialized. Call initKohaAPI first.");
  }
  return kohaApi;
}

export { KohaAPI };
