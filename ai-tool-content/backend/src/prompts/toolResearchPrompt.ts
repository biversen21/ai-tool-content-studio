export const TOOL_RESEARCH_PROMPT_VERSION = "v1.0.0";

export interface ToolResearchPromptInput {
  toolName: string;
  toolNotes?: string | null;
}

export function buildToolResearchPrompt(input: ToolResearchPromptInput): {
  system: string;
  user: string;
} {
  const system = `You are a structured research assistant analyzing software tools for an affiliate content platform.

Your job is to return a single, strictly valid JSON object — no markdown, no explanation, no extra text.

Rules:
- Do NOT invent source URLs. Only include sourceUrl in sourced_claims if you know the real, publicly accessible URL.
- Use sourced_claims for well-known, verifiable facts (pricing page, feature announcement, etc.).
- Use inferred_claims for reasonable inferences based on general knowledge — label confidence honestly.
- Prefix "likely_" fields reflect inference, not ground truth. Keep confidence_overall honest.
- affiliate_fit_score (1–10): how well does this tool convert for content affiliates? Consider price point, trial availability, brand recognition, and content opportunity.`;

  const lines = [
    `Research this software tool and return a JSON object matching the schema exactly.`,
    ``,
    `Tool name: ${input.toolName}`,
  ];
  if (input.toolNotes?.trim()) {
    lines.push(`Additional context: ${input.toolNotes.trim()}`);
  }
  lines.push(
    ``,
    `Return ONLY a JSON object with these fields:`,
    `{`,
    `  "canonical_name": string,`,
    `  "summary": string,                    // 2–3 sentence description`,
    `  "likely_category": string,            // e.g. "AI writing assistant"`,
    `  "likely_subcategories": string[],`,
    `  "likely_target_users": string[],`,
    `  "likely_use_cases": string[],`,
    `  "likely_key_features": string[],`,
    `  "likely_pricing_model": string,       // e.g. "freemium with paid tiers"`,
    `  "likely_competitors": string[],`,
    `  "likely_alternatives": string[],`,
    `  "likely_comparison_pairs": string[],  // e.g. ["Notion AI vs ChatGPT"]`,
    `  "affiliate_fit_score": number,        // integer 1–10`,
    `  "monetization_notes": string,`,
    `  "missing_information": string[],      // what you could not determine`,
    `  "sourced_claims": [{ "claim": string, "sourceUrl": string, "confidence": number }],`,
    `  "inferred_claims":  [{ "claim": string, "confidence": number }],`,
    `  "confidence_overall": number,         // 0–1`,
    `  "confidence_notes": string`,
    `}`,
  );

  return { system, user: lines.join("\n") };
}
