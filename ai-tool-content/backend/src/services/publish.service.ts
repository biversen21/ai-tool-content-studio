import type { PublishPayload } from "@ai-tool-content/shared";
import { prisma } from "../db/client.js";
import { LocalExportAdapter } from "../adapters/publisher/localExport.adapter.js";
import { serializeJson } from "../exporters/json.exporter.js";
import { serializeMarkdown, type SerializedExport } from "../exporters/markdown.exporter.js";

const publisher = new LocalExportAdapter();

export async function listPayloads(assetId?: string): Promise<PublishPayload[]> {
  const rows = await prisma.publishPayload.findMany({
    where: assetId ? { generatedAssetId: assetId } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return rows as unknown as PublishPayload[];
}

export interface PreviewResult {
  json: SerializedExport;
  markdown: SerializedExport;
}

export async function previewPayload(assetId: string): Promise<PreviewResult> {
  const asset = await prisma.generatedAsset.findUnique({ where: { id: assetId } });
  if (!asset) throw new Error(`Asset ${assetId} not found`);
  const a = asset as unknown as Parameters<typeof serializeJson>[0];
  return { json: serializeJson(a), markdown: serializeMarkdown(a) };
}

export async function exportAsset(assetId: string, format: "json" | "markdown"): Promise<PublishPayload> {
  const asset = await prisma.generatedAsset.findUnique({ where: { id: assetId } });
  if (!asset) throw new Error(`Asset ${assetId} not found`);

  const a = asset as unknown as Parameters<typeof serializeJson>[0];
  const jsonExport = serializeJson(a);
  const mdExport = serializeMarkdown(a);

  const target = format === "json" ? jsonExport : mdExport;
  const { filePath } = await publisher.write({ filename: target.filename, format, body: target.body });

  const row = await prisma.publishPayload.create({
    data: {
      generatedAssetId: assetId,
      payloadType: asset.type,
      payloadJson: jsonExport.body,
      payloadMarkdown: mdExport.body,
      format,
      filePath,
      status: "exported",
    },
  });
  return row as unknown as PublishPayload;
}
