import type { ResearchFact, ResearchRun } from "@ai-tool-content/shared";
import { prisma } from "../db/client.js";
import { env } from "../env.js";
import { completeJson } from "./openai.service.js";
import { buildToolResearchPrompt, TOOL_RESEARCH_PROMPT_VERSION } from "../prompts/toolResearchPrompt.js";
import { ToolResearchOutput, type ToolResearchOutput as ToolResearchOutputType } from "../schemas/researchOutput.js";

export type ResearchRunWithFacts = ResearchRun & { facts: ResearchFact[] };

export async function listResearchRuns(toolId?: string): Promise<ResearchRun[]> {
  const rows = await prisma.researchRun.findMany({
    where: toolId ? { toolId } : undefined,
    orderBy: { startedAt: "desc" },
  });
  return rows as unknown as ResearchRun[];
}

export async function getResearchRun(id: string): Promise<ResearchRunWithFacts | null> {
  const row = await prisma.researchRun.findUnique({
    where: { id },
    include: { facts: { orderBy: { createdAt: "asc" } } },
  });
  return (row as unknown as ResearchRunWithFacts) ?? null;
}

export async function getLatestResearchRunForTool(toolId: string): Promise<ResearchRunWithFacts | null> {
  const row = await prisma.researchRun.findFirst({
    where: { toolId },
    orderBy: { startedAt: "desc" },
    include: { facts: { orderBy: { createdAt: "asc" } } },
  });
  return (row as unknown as ResearchRunWithFacts) ?? null;
}

export async function startResearchRun(
  toolId: string,
  notes?: string,
): Promise<ResearchRunWithFacts> {
  const tool = await prisma.tool.findUnique({ where: { id: toolId } });
  if (!tool) throw new Error(`Tool ${toolId} not found`);

  const run = await prisma.researchRun.create({
    data: {
      toolId,
      status: "running",
      model: env.OPENAI_MODEL,
      notes: notes ?? null,
    },
  });

  try {
    const { system, user } = buildToolResearchPrompt({
      toolName: tool.name,
      toolNotes: tool.notes,
    });

    const { data: output, model, rawText } = await completeJson(
      { system, user, model: env.OPENAI_MODEL, temperature: 0.2 },
      ToolResearchOutput,
    );

    await prisma.researchFact.createMany({
      data: factsFromOutput(run.id, output),
    });

    const completedRun = await prisma.researchRun.update({
      where: { id: run.id },
      data: {
        status: "completed",
        model,
        rawPrompt: `[${TOOL_RESEARCH_PROMPT_VERSION}]\n\nSYSTEM:\n${system}\n\nUSER:\n${user}`,
        rawResponse: rawText,
        completedAt: new Date(),
      },
      include: { facts: { orderBy: { createdAt: "asc" } } },
    });

    await prisma.tool.update({
      where: { id: toolId },
      data: { status: "researched" },
    });

    return completedRun as unknown as ResearchRunWithFacts;
  } catch (err) {
    await prisma.researchRun.update({
      where: { id: run.id },
      data: { status: "failed", completedAt: new Date() },
    });
    throw err;
  }
}

// ---- Fact mapping ----

type FactInput = {
  researchRunId: string;
  category: string;
  content: string;
  sourceUrl?: string | null;
  confidence?: number | null;
};

function factsFromOutput(runId: string, o: ToolResearchOutputType): FactInput[] {
  const facts: FactInput[] = [];
  const ci = o.confidence_overall;

  // Summary and category metadata
  facts.push({ researchRunId: runId, category: "other", content: o.summary, confidence: ci });
  if (o.canonical_name !== o.summary) {
    facts.push({ researchRunId: runId, category: "other", content: `Canonical name: ${o.canonical_name}` });
  }
  facts.push({ researchRunId: runId, category: "other", content: `Category: ${o.likely_category}`, confidence: ci });
  if (o.likely_subcategories.length) {
    facts.push({ researchRunId: runId, category: "other", content: `Subcategories: ${o.likely_subcategories.join(", ")}`, confidence: ci });
  }

  // Features
  for (const f of o.likely_key_features) {
    facts.push({ researchRunId: runId, category: "feature", content: f, confidence: ci });
  }

  // Pricing
  if (o.likely_pricing_model) {
    facts.push({ researchRunId: runId, category: "pricing", content: o.likely_pricing_model, confidence: ci });
  }

  // Use cases
  for (const u of o.likely_use_cases) {
    facts.push({ researchRunId: runId, category: "use_case", content: u, confidence: ci });
  }

  // Audience
  for (const a of o.likely_target_users) {
    facts.push({ researchRunId: runId, category: "audience", content: a, confidence: ci });
  }

  // Competitors and alternatives
  for (const c of o.likely_competitors) {
    facts.push({ researchRunId: runId, category: "competitor", content: c, confidence: ci });
  }
  for (const a of o.likely_alternatives) {
    facts.push({ researchRunId: runId, category: "competitor", content: `Alternative: ${a}`, confidence: ci });
  }
  for (const cp of o.likely_comparison_pairs) {
    facts.push({ researchRunId: runId, category: "competitor", content: `Comparison pair: ${cp}`, confidence: ci });
  }

  // Sourced claims (category = claim, keep sourceUrl)
  for (const sc of o.sourced_claims) {
    facts.push({
      researchRunId: runId,
      category: "claim",
      content: sc.claim,
      sourceUrl: sc.sourceUrl ?? null,
      confidence: sc.confidence,
    });
  }

  // Inferred claims
  for (const ic of o.inferred_claims) {
    facts.push({ researchRunId: runId, category: "claim", content: ic.claim, confidence: ic.confidence });
  }

  // Monetization / affiliate
  if (o.monetization_notes) {
    facts.push({ researchRunId: runId, category: "other", content: `Monetization: ${o.monetization_notes}`, confidence: ci });
  }
  facts.push({ researchRunId: runId, category: "other", content: `Affiliate fit score: ${o.affiliate_fit_score}/10`, confidence: ci });

  // Missing information
  for (const m of o.missing_information) {
    facts.push({ researchRunId: runId, category: "other", content: `Missing info: ${m}` });
  }

  // Confidence notes
  if (o.confidence_notes) {
    facts.push({ researchRunId: runId, category: "other", content: `Confidence notes: ${o.confidence_notes}` });
  }

  return facts;
}
