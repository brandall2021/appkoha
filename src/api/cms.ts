export interface Noticia {
  id: string;
  titulo: string;
  cuerpo: string;
  imagenUrl: string | null;
  fecha: string;
}

export interface LinkUtil {
  id: string;
  titulo: string;
  url: string;
  icono: string;
  orden: number;
  destacado: boolean;
}

interface RawNoticia {
  id: number | string;
  titulo?: string;
  cuerpo?: string;
  imagen?: { id: string } | null;
  fecha?: string;
}

export function normalizarNoticia(raw: RawNoticia, cmsUrl: string): Noticia {
  return {
    id: String(raw.id),
    titulo: raw.titulo ?? "",
    cuerpo: raw.cuerpo ?? "",
    imagenUrl: raw.imagen?.id ? `${cmsUrl.replace(/\/$/, "")}/assets/${raw.imagen.id}` : null,
    fecha: raw.fecha ?? "",
  };
}

export function ordenarLinks(links: LinkUtil[]): LinkUtil[] {
  return [...links].sort((a, b) => {
    if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
    if (a.orden !== b.orden) return a.orden - b.orden;
    return a.titulo.localeCompare(b.titulo);
  });
}

async function getColeccion<T>(cmsUrl: string, path: string): Promise<T[]> {
  const res = await fetch(`${cmsUrl.replace(/\/$/, "")}${path}`);
  if (!res.ok) throw new Error(`CMS ${res.status}`);
  const json = (await res.json()) as { data: T[] };
  return json.data;
}

export async function fetchNoticias(cmsUrl: string): Promise<Noticia[]> {
  const filter = encodeURIComponent(JSON.stringify({ status: { _eq: "published" } }));
  const raw = await getColeccion<RawNoticia>(
    cmsUrl,
    `/items/noticias?filter=${filter}&sort=-fecha&fields=id,titulo,cuerpo,imagen.id,fecha`
  );
  return raw.map((r) => normalizarNoticia(r, cmsUrl));
}

export async function fetchLinks(cmsUrl: string): Promise<LinkUtil[]> {
  const raw = await getColeccion<Omit<LinkUtil, "id"> & { id: number | string }>(
    cmsUrl,
    "/items/links_utiles?sort=orden"
  );
  return raw.map((r) => ({
    id: String(r.id),
    titulo: r.titulo ?? "",
    url: r.url ?? "",
    icono: r.icono || "link",
    orden: typeof r.orden === "number" ? r.orden : 99,
    destacado: Boolean(r.destacado),
  }));
}
