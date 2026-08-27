import { apiFetch } from "./client";

export interface NoticiaApi {
  id: number;
  titulo: string;
  resumen: string;
  cuerpo: string;
  imagen_url: string | null;
  fecha: string;
}

export function fetchNews(): Promise<{ data: NoticiaApi[] }> {
  return apiFetch<{ data: NoticiaApi[] }>("/v1/news", { noAuth: true });
}

export function fetchNewsById(id: string | number): Promise<{ data: NoticiaApi }> {
  return apiFetch<{ data: NoticiaApi }>(`/v1/news/${id}`, { noAuth: true });
}
