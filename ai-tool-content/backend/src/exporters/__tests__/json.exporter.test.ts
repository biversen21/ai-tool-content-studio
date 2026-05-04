import { describe, it, expect } from "vitest";
import { serializeJson } from "../json.exporter.js";
import type { GeneratedAsset } from "@ai-tool-content/shared";

const base: GeneratedAsset = {
  id: "cltest123",
  toolId: "cltool123",
  type: "tool_page",
  slug: "my-tool-review",
  title: "My Tool Review",
  contentJson: JSON.stringify({ seoTitle: "SEO Title", metaDescription: "A great tool" }),
  contentMarkdown: "# My Tool\n\nGreat tool.",
  model: "gpt-4o-mini",
  status: "generated",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
};

describe("serializeJson", () => {
  it("filename is {type}/{slug}.json", () => {
    expect(serializeJson(base).filename).toBe("tool_page/my-tool-review.json");
  });

  it("body is valid JSON", () => {
    expect(() => JSON.parse(serializeJson(base).body)).not.toThrow();
  });

  it("body contains expected top-level fields", () => {
    const out = JSON.parse(serializeJson(base).body);
    expect(out.id).toBe(base.id);
    expect(out.title).toBe(base.title);
    expect(out.slug).toBe(base.slug);
    expect(out.type).toBe(base.type);
    expect(out.status).toBe(base.status);
  });

  it("body field contains contentMarkdown", () => {
    const out = JSON.parse(serializeJson(base).body);
    expect(out.body).toBe(base.contentMarkdown);
  });

  it("metadata is parsed from contentJson", () => {
    const out = JSON.parse(serializeJson(base).body);
    expect(out.metadata.seoTitle).toBe("SEO Title");
  });

  it("handles invalid contentJson by keeping raw string as metadata", () => {
    const out = JSON.parse(serializeJson({ ...base, contentJson: "not-json" }).body);
    expect(out.metadata).toBe("not-json");
  });

  it("body field is empty string when contentMarkdown is null", () => {
    const out = JSON.parse(serializeJson({ ...base, contentMarkdown: null }).body);
    expect(out.body).toBe("");
  });

  it("works with category_page type", () => {
    const { filename } = serializeJson({ ...base, type: "category_page", slug: "best-ai-tools" });
    expect(filename).toBe("category_page/best-ai-tools.json");
  });
});
