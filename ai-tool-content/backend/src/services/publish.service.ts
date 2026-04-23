import type {
  CreatePublishPayloadInput,
  PublishPayload,
} from "@ai-tool-content/shared";
import { prisma } from "../db/client.js";
import { LocalExportAdapter } from "../adapters/publisher/localExport.adapter.js";
import type { Publisher } from "../adapters/publisher/publisher.interface.js";

/**
 * Publish service — owns the export contract.
 * Picks the right exporter for the requested format, writes via the configured
 * Publisher adapter, and records the resulting PublishPayload row.
 */

// For now: only local export. Later this can be selected by config or per-call.
const publisher: Publisher = new LocalExportAdapter();

export async function listPayloads(assetId?: string): Promise<PublishPayload[]> {
  const rows = await prisma.publishPayload.findMany({
    where: assetId ? { generatedAssetId: assetId } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return rows as unknown as PublishPayload[];
}

export async function publishAsset(_input: CreatePublishPayloadInput): Promise<PublishPayload> {
  // TODO:
  // 1. load GeneratedAsset
  // 2. exporter = format === "markdown" ? markdownExporter : jsonExporter
  // 3. const { filePath } = await publisher.write(exporter.serialize(asset))
  // 4. persist PublishPayload row, status = "exported"
  void publisher;
  throw new Error("publishAsset not implemented");
}
