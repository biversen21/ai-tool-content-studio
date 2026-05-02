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
  const slug = asset.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const frontmatter = [
    "---",
    `title: ${JSON.stringify(asset.title)}`,
    `type: ${asset.type}`,
    `status: ${asset.status}`,
    `createdAt: ${asset.createdAt.toISOString()}`,
    "---",
    "",
  ].join("\n");

  return {
    filename: `${slug || asset.id}.md`,
    body: frontmatter + (asset.contentMarkdown ?? ""),
  };
}
