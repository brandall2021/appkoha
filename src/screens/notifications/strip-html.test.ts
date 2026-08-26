import { describe, expect, it } from "vitest";
import { stripHtml } from "./strip-html";

describe("stripHtml", () => {
  it("removes all HTML tags", () => {
    expect(stripHtml("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });

  it("converts <p> to double newlines", () => {
    expect(stripHtml("<p>First</p><p>Second</p>")).toBe("First\n\nSecond");
  });

  it("converts <br> to newline", () => {
    expect(stripHtml("Line 1<br/>Line 2")).toBe("Line 1\nLine 2");
  });

  it("handles nested tags", () => {
    expect(stripHtml('<div><p><span class="x">Text</span></p></div>')).toBe("Text");
  });

  it("returns empty string for empty input", () => {
    expect(stripHtml("")).toBe("");
  });

  it("returns plain text unchanged", () => {
    expect(stripHtml("No tags here")).toBe("No tags here");
  });

  it("handles Directus-style rich text", () => {
    const html = '<p class="ql-align-center"><strong>Titulo</strong></p><p>Parrafo uno</p><p>Parrafo dos</p>';
    const result = stripHtml(html);
    expect(result).toContain("Titulo");
    expect(result).toContain("Parrafo uno");
    expect(result).toContain("Parrafo dos");
    expect(result).not.toMatch(/<[^>]+>/);
  });

  it("collapses multiple newlines from consecutive </p>", () => {
    const result = stripHtml("<p>A</p><p>B</p><p>C</p>");
    expect(result).toBe("A\n\nB\n\nC");
  });
});
