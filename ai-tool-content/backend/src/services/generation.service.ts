import type {
  CreateGeneratedAssetInput,
  GeneratedAsset,
} from "@ai-tool-content/shared";
import { prisma } from "../db/client.js";

/**
 * Generation service — turns research + a prompt into a GeneratedAsset.
 * Composes openai.service + prompts/* modules.
 */

export async function listAssets(toolId?: string): Promise<GeneratedAsset[]> {
  const rows = await prisma.generatedAsset.findMany({
    where: toolId ? { toolId } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return rows as unknown as GeneratedAsset[];
}

export async function getAsset(id: string): Promise<GeneratedAsset | null> {
  const row = await prisma.generatedAsset.findUnique({ where: { id } });
  return (row as unknown as GeneratedAsset | null) ?? null;
}

export async function generateAsset(_input: CreateGeneratedAssetInput): Promise<GeneratedAsset> {
  // TODO: pick prompt module by asset type, call openai.service.complete(), persist result
  throw new Error("generateAsset not implemented");
}
