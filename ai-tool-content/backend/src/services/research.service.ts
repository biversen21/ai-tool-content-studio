import type { ResearchRun, StartResearchRunInput } from "@ai-tool-content/shared";
import { prisma } from "../db/client.js";

/**
 * Research service — orchestrates ResearchRun lifecycle and ResearchFact persistence.
 * Will eventually call into openai.service for the actual research step.
 */

export async function listResearchRuns(toolId?: string): Promise<ResearchRun[]> {
  const rows = await prisma.researchRun.findMany({
    where: toolId ? { toolId } : undefined,
    orderBy: { startedAt: "desc" },
  });
  return rows as unknown as ResearchRun[];
}

export async function getResearchRun(id: string): Promise<ResearchRun | null> {
  const row = await prisma.researchRun.findUnique({
    where: { id },
    include: { facts: true },
  });
  return (row as unknown as ResearchRun | null) ?? null;
}

export async function startResearchRun(_input: StartResearchRunInput): Promise<ResearchRun> {
  // TODO: create run with status=pending, kick off async work, transition to running/completed/failed
  throw new Error("startResearchRun not implemented");
}
