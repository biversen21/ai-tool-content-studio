import type { GeneratedAsset, PatchAssetInput } from "@ai-tool-content/shared";
import { prisma } from "../db/client.js";
import { env } from "../env.js";
import { completeJson } from "./openai.service.js";
import { buildToolPagePrompt } from "../prompts/toolPagePrompt.js";
import { buildCategoryPagePrompt } from "../prompts/categoryPagePrompt.js";
import { buildComparisonPagePrompt } from "../prompts/comparisonPagePrompt.js";
import { ToolPageOutput } from "../schemas/toolPageOutput.js";
import { CategoryPageOutput } from "../schemas/categoryPageOutput.js";
import { ComparisonPageOutput } from "../schemas/comparisonPageOutput.js";

// ---- Public read helpers ----

export async function listAssets(toolId?: string): Promise<GeneratedAsset[]> {
  const rows = await prisma.generatedAsset.findMany({
    where: toolId ? { toolId } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return rows as unknown as GeneratedAsset[];
}

export async function getAsset(id: string): Promise<GeneratedAsset | null> {
  const row = await prisma.generatedAsset.findUnique({ where: { id } });
  return (row as unknown as GeneratedAsset) ?? null;
}

export async function updateAsset(id: string, input: PatchAssetInput): Promise<GeneratedAsset | null> {
  const exists = await prisma.generatedAsset.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return null;
  const row = await prisma.generatedAsset.update({ where: { id }, data: input });
  return row as unknown as GeneratedAsset;
}

export async function approveAsset(id: string): Promise<GeneratedAsset | null> {
  const asset = await prisma.generatedAsset.findUnique({ where: { id } });
  if (!asset) return null;
  const row = await prisma.generatedAsset.update({ where: { id }, data: { status: "approved" } });
  await prisma.tool.update({ where: { id: asset.toolId }, data: { status: "approved" } });
  return row as unknown as GeneratedAsset;
}

// ---- Generation entry points ----

export async function generateToolPage(toolId: string): Promise<GeneratedAsset> {
  const { tool, facts } = await loadToolAndFacts(toolId);

  const { data, model } = await completeJson(
    buildToolPagePrompt({ toolName: tool.name, affiliateUrl: tool.affiliateUrl, facts }),
    ToolPageOutput,
  );

  const slug = toSlug(`${tool.slug}-review`);
  return persist(toolId, "tool_page", data.title, slug, data, data.contentMarkdown, model);
}

export async function generateCategoryPage(toolId: string): Promise<GeneratedAsset> {
  const { tool, facts } = await loadToolAndFacts(toolId);

  const category   = extractFact(facts, "other", "Category: ") ?? tool.name;
  const subcats    = extractList(facts, "other", "Subcategories: ");
  const users      = facts.filter((f) => f.category === "audience").map((f) => f.content);
  const competitors = extractCompetitorNames(facts);
  const summary    = facts.find((f) => f.category === "other" && !f.content.includes(":"))?.content ?? "";

  const { data, model } = await completeJson(
    buildCategoryPagePrompt({ toolName: tool.name, category, subcategories: subcats, targetUsers: users, competitors, toolSummary: summary }),
    CategoryPageOutput,
  );

  const slug = toSlug(`best-${toSlug(category)}-tools`);
  return persist(toolId, "category_page", data.title, slug, data, data.contentMarkdown, model);
}

export async function generateComparisonPage(toolId: string): Promise<GeneratedAsset> {
  const { tool, facts } = await loadToolAndFacts(toolId);

  const competitors = extractCompetitorNames(facts);
  if (!competitors.length) throw new Error("No competitors found in research facts. Run research first.");
  const competitor = competitors[0];

  const { data, model } = await completeJson(
    buildComparisonPagePrompt({ toolName: tool.name, competitorName: competitor, affiliateUrl: tool.affiliateUrl, facts }),
    ComparisonPageOutput,
  );

  const slug = toSlug(`${tool.slug}-vs-${toSlug(competitor)}`);
  return persist(toolId, "comparison_page", data.title, slug, data, data.contentMarkdown, model);
}

export async function generateAll(toolId: string): Promise<GeneratedAsset[]> {
  const results: GeneratedAsset[] = [];
  // Run sequentially to avoid hammering the API and to keep errors attributable
  results.push(await generateToolPage(toolId));
  results.push(await generateCategoryPage(toolId));
  results.push(await generateComparisonPage(toolId));
  await prisma.tool.update({ where: { id: toolId }, data: { status: "generated" } });
  return results;
}

// ---- Shared helpers ----

type FactRow = { category: string; content: string; confidence?: number | null };

async function loadToolAndFacts(toolId: string): Promise<{ tool: { id: string; name: string; slug: string; affiliateUrl: string | null; notes: string | null }; facts: FactRow[] }> {
  const tool = await prisma.tool.findUnique({ where: { id: toolId } });
  if (!tool) throw new Error(`Tool ${toolId} not found`);

  const run = await prisma.researchRun.findFirst({
    where: { toolId, status: "completed" },
    orderBy: { startedAt: "desc" },
    include: { facts: { orderBy: { createdAt: "asc" } } },
  });
  if (!run) throw new Error("No completed research run found. Run research before generating content.");

  return { tool, facts: run.facts };
}

async function persist(
  toolId: string,
  type: string,
  title: string,
  slug: string,
  output: object,
  contentMarkdown: string,
  model: string,
): Promise<GeneratedAsset> {
  const row = await prisma.generatedAsset.create({
    data: {
      toolId,
      type,
      slug,
      title,
      contentJson: JSON.stringify(output),
      contentMarkdown,
      model,
      status: "generated",
    },
  });
  await prisma.tool.update({ where: { id: toolId }, data: { status: "generated" } });
  return row as unknown as GeneratedAsset;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function extractFact(facts: FactRow[], category: string, prefix: string): string | undefined {
  const match = facts.find((f) => f.category === category && f.content.startsWith(prefix));
  return match ? match.content.slice(prefix.length).trim() : undefined;
}

function extractList(facts: FactRow[], category: string, prefix: string): string[] {
  const raw = extractFact(facts, category, prefix);
  return raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

function extractCompetitorNames(facts: FactRow[]): string[] {
  return facts
    .filter((f) => f.category === "competitor" && !f.content.startsWith("Alternative:") && !f.content.startsWith("Comparison pair:"))
    .map((f) => f.content.trim())
    .filter(Boolean);
}
