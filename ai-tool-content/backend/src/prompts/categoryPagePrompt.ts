export const CATEGORY_PAGE_PROMPT_VERSION = "v1.0.0";

export interface CategoryPagePromptInput {
  toolName: string;
  category: string;
  subcategories: string[];
  targetUsers: string[];
  competitors: string[];
  toolSummary: string;
}

const SYSTEM = `You write editorial category landing pages for a software review site.

Rules:
- Help readers understand a software category and choose the right tool for their needs.
- Do NOT write "I tested" — this is research-based content.
- Balanced, factual tone: no vendor puffery.
- The primary tool featured is ${"`"}toolName${"`"} — give it a detailed section; treat competitors fairly.
- Optimize for informational and comparison search intent.
- Return ONLY a valid JSON object. No markdown fences, no explanation outside the JSON.`;

export function buildCategoryPagePrompt(input: CategoryPagePromptInput): { system: string; user: string } {
  const lines = [
    `Generate a category page for the "${input.category}" software category.`,
    ``,
    `Primary tool: ${input.toolName}`,
    `Summary: ${input.toolSummary}`,
    input.subcategories.length ? `Subcategories: ${input.subcategories.join(", ")}` : null,
    input.targetUsers.length   ? `Target users: ${input.targetUsers.join(", ")}` : null,
    input.competitors.length   ? `Other tools in category: ${input.competitors.join(", ")}` : null,
    ``,
    `Return a JSON object with these exact fields:`,
    `{`,
    `  "seoTitle": string,          // ≤60 chars`,
    `  "metaDescription": string,   // ≤160 chars`,
    `  "title": string,             // e.g. "Best ${input.category} Tools in 2025"`,
    `  "introduction": string,      // 2–3 sentences on the category`,
    `  "whatToLookFor": string[],   // 4–6 evaluation criteria for this category`,
    `  "toolSummaries": [{ "name": string, "summary": string, "bestFor": string }],`,
    `  "comparisonNotes": string,   // 2–3 sentences on how tools differ`,
    `  "verdict": string,           // 2–3 sentences: who should start with which tool`,
    `  "contentMarkdown": string    // full page in Markdown (H2 sections, includes all above)`,
    `}`,
  ];

  return { system: SYSTEM, user: lines.filter(Boolean).join("\n") };
}
