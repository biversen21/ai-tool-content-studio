export const COMPARISON_PAGE_PROMPT_VERSION = "v1.0.0";

export interface ComparisonPagePromptInput {
  toolName: string;
  competitorName: string;
  affiliateUrl?: string | null;
  facts: Array<{ category: string; content: string; confidence?: number | null }>;
}

const SYSTEM = `You write head-to-head comparison articles for a software review site.

Rules:
- Fair, specific, tradeoff-focused. Do NOT favour one tool without factual justification.
- Research data is provided for the primary tool only. Use your general knowledge for the competitor — note where you are inferring.
- Do NOT write "I tested" — this is research-based content.
- For low-confidence facts (marked), use cautious phrasing.
- Optimize for comparison and "vs" search intent.
- Return ONLY a valid JSON object. No markdown fences, no explanation outside the JSON.`;

export function buildComparisonPagePrompt(input: ComparisonPagePromptInput): { system: string; user: string } {
  const factLines = input.facts.map(
    (f) => `  [${f.category}${f.confidence != null && f.confidence < 0.6 ? " low-confidence" : ""}] ${f.content}`,
  );

  const lines = [
    `Generate a comparison page: ${input.toolName} vs ${input.competitorName}`,
    ``,
    `Research facts for ${input.toolName}:`,
    ...factLines,
    ``,
    `${input.competitorName}: use your general knowledge — note inferences clearly.`,
    input.affiliateUrl
      ? `Affiliate link for ${input.toolName}: ${input.affiliateUrl}`
      : null,
    ``,
    `Return a JSON object with these exact fields:`,
    `{`,
    `  "seoTitle": string,          // ≤60 chars, includes both names`,
    `  "metaDescription": string,   // ≤160 chars`,
    `  "title": string,             // e.g. "${input.toolName} vs ${input.competitorName}: ..."`,
    `  "tldr": string,              // 2 sentences: bottom line up front`,
    `  "comparisonTable": [{ "dimension": string, "toolA": string, "toolB": string }],  // 6–10 rows`,
    `  "deepDive": [{ "dimension": string, "analysis": string }],  // 4–6 dimensions`,
    `  "whoShouldPickA": string,    // 2–3 sentences on who picks ${input.toolName}`,
    `  "whoShouldPickB": string,    // 2–3 sentences on who picks ${input.competitorName}`,
    `  "verdict": string,           // 2–3 sentences final take`,
    `  "contentMarkdown": string    // full page in Markdown (includes table, sections, all above)`,
    `}`,
  ];

  return { system: SYSTEM, user: lines.filter(Boolean).join("\n") };
}
