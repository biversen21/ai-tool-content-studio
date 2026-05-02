import type { CreateToolInput, Tool, UpdateToolInput } from "@ai-tool-content/shared";
import { prisma } from "../db/client.js";

export async function listTools(): Promise<Tool[]> {
  const rows = await prisma.tool.findMany({ orderBy: { createdAt: "desc" } });
  return rows as unknown as Tool[];
}

export async function getTool(id: string): Promise<Tool | null> {
  const row = await prisma.tool.findUnique({ where: { id } });
  return (row as unknown as Tool) ?? null;
}

export async function createTool(input: CreateToolInput): Promise<Tool> {
  const slug = await uniqueSlug(toSlug(input.name));
  const row = await prisma.tool.create({
    data: {
      slug,
      name: input.name,
      affiliateUrl: input.affiliateUrl ?? null,
      notes: input.notes ?? null,
      status: "draft",
    },
  });
  return row as unknown as Tool;
}

export async function updateTool(id: string, input: UpdateToolInput): Promise<Tool | null> {
  const exists = await prisma.tool.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return null;
  const row = await prisma.tool.update({ where: { id }, data: input });
  return row as unknown as Tool;
}

// --- slug helpers ---

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  if (!(await prisma.tool.findUnique({ where: { slug: base }, select: { id: true } }))) {
    return base;
  }
  let n = 2;
  while (true) {
    const candidate = `${base}-${n}`;
    if (!(await prisma.tool.findUnique({ where: { slug: candidate }, select: { id: true } }))) {
      return candidate;
    }
    n++;
  }
}
