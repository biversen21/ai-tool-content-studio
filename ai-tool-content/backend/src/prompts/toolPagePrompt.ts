export const TOOL_PAGE_PROMPT_VERSION = "v1.0.0";

export interface ToolPagePromptInput {
  toolName: string;
  affiliateUrl?: string | null;
  facts: Array<{ category: string; content: string; confidence?: number | null }>;
}

const SYSTEM = `You write editorial affiliate content for a software tool review site.

Rules:
- Affiliate style: honest, clear, scannable, written for someone actively evaluating tools.
- Do NOT write "I tested" or "in my experience" — this is research-based content, not hands-on review.
- For facts with confidence below 0.6, use cautious phrasing: "reportedly", "according to available information", "may offer".
- No unsupported claims. If a fact is not in the research, do not invent it.
- Optimize for buyer intent and decision support — readers want to know if this tool is right for them.
- Return ONLY a valid JSON object. No markdown fences, no explanation outside the JSON.`;

export function buildToolPagePrompt(input: ToolPagePromptInput): { system: string; user: string } {
  const factLines = input.facts.map(
    (f) => `  [${f.category}${f.confidence != null && f.confidence < 0.6 ? " low-confidence" : ""}] ${f.content}`,
  );

  const lines = [
    `Generate a tool review page for: ${input.toolName}`,
    ``,
    `Research facts:`,
    ...factLines,
    ``,
    input.affiliateUrl
      ? `Affiliate link: ${input.affiliateUrl} — weave one natural CTA using this URL.`
      : `No affiliate link available — omit CTA link.`,
    ``,
    `Return a JSON object with these exact fields:`,
    `{`,
    `  "seoTitle": string,          // ≤60 chars, includes tool name`,
    `  "metaDescription": string,   // ≤160 chars, buyer-intent focused`,
    `  "title": string,             // H1, e.g. "${input.toolName} Review: ..."`,
    `  "introduction": string,      // 2–3 sentences, what the tool is and who it's for`,
    `  "idealUsers": string[],      // 3–5 user types who benefit most`,
    `  "keyFeatures": [{ "name": string, "description": string }],  // 4–7 features`,
    `  "pricingSummary": string,    // 1–2 sentences on pricing`,
    `  "pros": string[],            // 3–5 items`,
    `  "cons": string[],            // 2–4 items`,
    `  "alternatives": string[],    // 2–4 named alternatives`,
    `  "ctaCopy": string,           // short CTA button text, e.g. "Try ${input.toolName} Free"`,
    `  "faqItems": [{ "q": string, "a": string }],  // 3–5 buyer-intent questions`,
    `  "decisionGuidance": string,  // 2–3 sentences: who should/shouldn't buy`,
    `  "verdict": string,           // 2–3 sentences final take`,
    `  "contentMarkdown": string    // full page in Markdown (H2 sections, includes all above)`,
    `}`,
  ];

  return { system: SYSTEM, user: lines.join("\n") };
}
