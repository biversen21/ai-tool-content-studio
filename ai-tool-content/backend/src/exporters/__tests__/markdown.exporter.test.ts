import { describe, it, expect } from "vitest";
import { serializeMarkdown } from "../markdown.exporter.js";
import type { GeneratedAsset } from "@ai-tool-content/shared";

const base: GeneratedAsset = {
  id: "cltest123",
  toolId: "cltool123",
  type: "tool_page",
  slug: "my-tool-review",
  title: "My Tool Review",
  contentJson: JSON.stringify({ seoTitle: "SEO Title", metaDescription: "A great description" }),
  contentMarkdown: "# My Tool\n\nGreat tool.",
  model: "gpt-4o-mini",
  status: "generated",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
};

describe("serializeMarkdown", () => {
  it("filename is {type}/{slug}.md", () => {
    expect(serializeMarkdown(base).filename).toBe("tool_page/my-tool-review.md");
  });

  it("body starts with YAML frontmatter delimiter", () => {
    expect(serializeMarkdown(base).body).toMatch(/^---\n/);
  });

  it("frontmatter closes before markdown content", () => {
    const { body } = serializeMarkdown(base);
    const fmEnd = body.indexOf("---\n\n");
    expect(fmEnd).toBeGreaterThan(0);
  });

  it("frontmatter contains title", () => {
    expect(serializeMarkdown(base).body).toContain(`title: "${base.title}"`);
  });

  it("frontmatter contains seoTitle from contentJson", () => {
    expect(serializeMarkdown(base).body).toContain('seoTitle: "SEO Title"');
  });

  it("frontmatter contains metaDescription from contentJson", () => {
    expect(serializeMarkdown(base).body).toContain('metaDescription: "A great description"');
  });

  it("frontmatter contains slug and type", () => {
    const { body } = serializeMarkdown(base);
    expect(body).toContain(`slug: ${base.slug}`);
    expect(body).toContain(`type: ${base.type}`);
  });

  it("frontmatter contains status", () => {
    expect(serializeMarkdown(base).body).toContain(`status: ${base.status}`);
  });

  it("body includes markdown content after frontmatter", () => {
    expect(serializeMarkdown(base).body).toContain("# My Tool\n\nGreat tool.");
  });

  it("falls back to title when seoTitle missing from contentJson", () => {
    const { body } = serializeMarkdown({ ...base, contentJson: "{}" });
    expect(body).toContain(`seoTitle: "${base.title}"`);
  });

  it("falls back to empty string when metaDescription missing", () => {
    const { body } = serializeMarkdown({ ...base, contentJson: "{}" });
    expect(body).toContain('metaDescription: ""');
  });

  it("handles null contentMarkdown gracefully", () => {
    const { body } = serializeMarkdown({ ...base, contentMarkdown: null });
    expect(body).toContain("---");
    expect(body).not.toContain("null");
  });

  it("handles invalid contentJson gracefully", () => {
    expect(() => serializeMarkdown({ ...base, contentJson: "bad-json" })).not.toThrow();
  });
});
