import { describe, expect, it } from "vitest";
import { normalizarNoticia, ordenarLinks, type LinkUtil } from "./cms";

describe("normalizarNoticia", () => {
  it("mapea campos directus y arma URL de imagen", () => {
    const raw = {
      id: 12,
      titulo: "Nuevos horarios",
      cuerpo: "<p>Abierto hasta las 22</p>",
      imagen: { id: "img-1" },
      fecha: "2026-08-24T10:00:00Z",
      status: "published",
    };
    const n = normalizarNoticia(raw, "https://cms.example.com");
    expect(n).toEqual({
      id: "12",
      titulo: "Nuevos horarios",
      cuerpo: "<p>Abierto hasta las 22</p>",
      imagenUrl: "https://cms.example.com/assets/img-1",
      fecha: "2026-08-24T10:00:00Z",
    });
  });

  it("tolera noticia sin imagen", () => {
    const n = normalizarNoticia({ id: 1, titulo: "t" }, "http://x");
    expect(n.imagenUrl).toBeNull();
  });
});

describe("ordenarLinks", () => {
  it("destacados primero, luego por orden y titulo", () => {
    const links: LinkUtil[] = [
      { id: "a", titulo: "Campus", url: "", icono: "laptop", orden: 1, destacado: false },
      { id: "b", titulo: "Biblio", url: "", icono: "library", orden: 2, destacado: false },
      { id: "c", titulo: "Guaraní", url: "", icono: "school", orden: 9, destacado: true },
    ];
    const out = ordenarLinks(links);
    expect(out.map((l) => l.id)).toEqual(["c", "a", "b"]);
  });
});
