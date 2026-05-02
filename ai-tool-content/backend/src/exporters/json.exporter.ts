import type { GeneratedAsset } from "@ai-tool-content/shared";
import type { SerializedExport } from "./markdown.exporter.js";

/**
 * Serialize a GeneratedAsset to a structured JSON document suitable for a
 * downstream publisher (CMS, static site, etc.).
 */
export function serializeJson(asset: GeneratedAsset): SerializedExport {
  const payload = {
    id: asset.id,
    type: asset.type,
    title: asset.title,
    slug: asset.slug,
    status: asset.status,
    body: asset.contentMarkdown ?? "",
    metadata: safeParse(asset.contentJson),
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
  };

  return {
    filename: `${asset.type}/${asset.slug}.json`,
    body: JSON.stringify(payload, null, 2),
  };
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
