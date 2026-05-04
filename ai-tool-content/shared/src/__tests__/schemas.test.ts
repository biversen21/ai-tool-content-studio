import { describe, it, expect } from "vitest";
import { CreateToolInput, UpdateToolInput } from "../schemas/tool.js";
import { PatchAssetInput } from "../schemas/asset.js";
import { TOOL_STATUS, ASSET_STATUS, ASSET_TYPE, PUBLISH_FORMAT } from "../constants/status.js";

// ---- CreateToolInput ----

describe("CreateToolInput", () => {
  it("accepts minimal valid input", () => {
    expect(CreateToolInput.safeParse({ name: "My Tool" }).success).toBe(true);
  });

  it("rejects missing name", () => {
    expect(CreateToolInput.safeParse({}).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(CreateToolInput.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects name over 200 chars", () => {
    expect(CreateToolInput.safeParse({ name: "a".repeat(201) }).success).toBe(false);
  });

  it("accepts optional affiliateUrl", () => {
    expect(CreateToolInput.safeParse({ name: "Tool", affiliateUrl: "https://example.com" }).success).toBe(true);
  });

  it("rejects invalid affiliateUrl", () => {
    expect(CreateToolInput.safeParse({ name: "Tool", affiliateUrl: "not-a-url" }).success).toBe(false);
  });

  it("accepts optional notes", () => {
    expect(CreateToolInput.safeParse({ name: "Tool", notes: "some notes" }).success).toBe(true);
  });

  it("rejects notes over 2000 chars", () => {
    expect(CreateToolInput.safeParse({ name: "Tool", notes: "a".repeat(2001) }).success).toBe(false);
  });
});

// ---- UpdateToolInput ----

describe("UpdateToolInput", () => {
  it("accepts empty object — all fields optional", () => {
    expect(UpdateToolInput.safeParse({}).success).toBe(true);
  });

  it("accepts valid status", () => {
    expect(UpdateToolInput.safeParse({ status: "approved" }).success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(UpdateToolInput.safeParse({ status: "invalid-status" }).success).toBe(false);
  });

  it("accepts valid kebab-case slug", () => {
    expect(UpdateToolInput.safeParse({ slug: "my-tool" }).success).toBe(true);
  });

  it("rejects slug with uppercase letters", () => {
    expect(UpdateToolInput.safeParse({ slug: "My-Tool" }).success).toBe(false);
  });

  it("rejects slug with spaces", () => {
    expect(UpdateToolInput.safeParse({ slug: "my tool" }).success).toBe(false);
  });

  it("accepts null affiliateUrl to clear it", () => {
    expect(UpdateToolInput.safeParse({ affiliateUrl: null }).success).toBe(true);
  });

  it("accepts null notes to clear it", () => {
    expect(UpdateToolInput.safeParse({ notes: null }).success).toBe(true);
  });
});

// ---- PatchAssetInput ----

describe("PatchAssetInput", () => {
  it("accepts empty object — all fields optional", () => {
    expect(PatchAssetInput.safeParse({}).success).toBe(true);
  });

  it("accepts all valid fields together", () => {
    expect(PatchAssetInput.safeParse({
      title: "New Title",
      slug: "new-slug",
      contentMarkdown: "# Hello",
      status: "approved",
    }).success).toBe(true);
  });

  it("rejects empty title", () => {
    expect(PatchAssetInput.safeParse({ title: "" }).success).toBe(false);
  });

  it("rejects title over 300 chars", () => {
    expect(PatchAssetInput.safeParse({ title: "a".repeat(301) }).success).toBe(false);
  });

  it("rejects invalid status value", () => {
    expect(PatchAssetInput.safeParse({ status: "published" }).success).toBe(false);
  });

  it("accepts null contentMarkdown to clear it", () => {
    expect(PatchAssetInput.safeParse({ contentMarkdown: null }).success).toBe(true);
  });

  it("rejects empty contentJson", () => {
    expect(PatchAssetInput.safeParse({ contentJson: "" }).success).toBe(false);
  });
});

// ---- Status constants ----

describe("status constants", () => {
  it("TOOL_STATUS contains all expected values", () => {
    expect(TOOL_STATUS).toContain("draft");
    expect(TOOL_STATUS).toContain("researched");
    expect(TOOL_STATUS).toContain("generated");
    expect(TOOL_STATUS).toContain("approved");
    expect(TOOL_STATUS).toContain("archived");
  });

  it("ASSET_STATUS contains all expected values", () => {
    expect(ASSET_STATUS).toContain("draft");
    expect(ASSET_STATUS).toContain("generated");
    expect(ASSET_STATUS).toContain("approved");
    expect(ASSET_STATUS).toContain("archived");
  });

  it("ASSET_TYPE contains all three page types", () => {
    expect(ASSET_TYPE).toContain("tool_page");
    expect(ASSET_TYPE).toContain("category_page");
    expect(ASSET_TYPE).toContain("comparison_page");
  });

  it("PUBLISH_FORMAT contains json and markdown", () => {
    expect(PUBLISH_FORMAT).toContain("json");
    expect(PUBLISH_FORMAT).toContain("markdown");
  });
});
