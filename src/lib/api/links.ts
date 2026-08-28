import { apiFetch } from "./client";

export interface LinkUtilApi {
  id: number;
  titulo: string;
  url: string;
  icono: string | null;
  orden: number;
  destacado: boolean;
}

export function fetchLinks(): Promise<{ data: LinkUtilApi[] }> {
  return apiFetch<{ data: LinkUtilApi[] }>("/v1/links", { noAuth: true });
}
