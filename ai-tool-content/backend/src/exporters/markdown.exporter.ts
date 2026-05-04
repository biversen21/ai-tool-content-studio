import type { GeneratedAsset } from "@ai-tool-content/shared";

export interface SerializedExport {
  filename: string;
  body: string;
}

/**
 * Serialize a GeneratedAsset to a Markdown file with simple YAML frontmatter.
 * Kept minimal — the publish service composes this with a Publisher adapter.
 */
export function serializeMarkdown(asset: GeneratedAsset): SerializedExport {
  const parsed = (() => {
    try { return JSON.parse(asset.contentJson) as Record<string, unknown>; }
    catch { return null; }
  })();

  const seoTitle = (parsed?.seoTitle as string | undefined) ?? asset.title;
  const metaDescription = (parsed?.metaDescription as string | undefined) ?? "";

  const frontmatter = [
    "---",
    `title: ${JSON.stringify(asset.title)}`,
    `seoTitle: ${JSON.stringify(seoTitle)}`,
    `metaDescription: ${JSON.stringify(metaDescription)}`,
    `type: ${asset.type}`,
    `slug: ${asset.slug}`,
    `status: ${asset.status}`,
    `createdAt: ${asset.createdAt.toISOString()}`,
    "---",
    "",
    "",
  ].join("\n");

  return {
    filename: `${asset.type}/${asset.slug}.md`,
    body: frontmatter + (asset.contentMarkdown ?? ""),
  };
}
