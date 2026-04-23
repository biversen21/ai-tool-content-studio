import type {
  CreateToolInput,
  Tool,
  UpdateToolInput,
} from "@ai-tool-content/shared";
import { prisma } from "../db/client.js";

/**
 * Tool service — owns all DB access for the Tool model.
 * Routes call into here; they do not touch Prisma directly.
 */

export async function listTools(): Promise<Tool[]> {
  const rows = await prisma.tool.findMany({ orderBy: { createdAt: "desc" } });
  return rows as unknown as Tool[];
}

export async function getTool(id: string): Promise<Tool | null> {
  const row = await prisma.tool.findUnique({ where: { id } });
  return (row as unknown as Tool | null) ?? null;
}

export async function createTool(_input: CreateToolInput): Promise<Tool> {
  // TODO: implement in next pass
  throw new Error("createTool not implemented");
}

export async function updateTool(_id: string, _input: UpdateToolInput): Promise<Tool> {
  // TODO: implement in next pass
  throw new Error("updateTool not implemented");
}
