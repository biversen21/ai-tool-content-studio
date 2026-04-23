export const TOOL_PAGE_PROMPT_VERSION = "v0.1.0";

export interface ToolPagePromptInput {
  toolName: string;
  facts: Array<{ category: string; content: string }>;
  affiliateUrl?: string | null;
}

export function buildToolPagePrompt(input: ToolPagePromptInput): {
  system: string;
  user: string;
} {
  const system =
    "You write affiliate-style review pages for software tools. Tone: " +
    "honest, useful, scannable. Output Markdown with H2 sections.";

  const user = [
    `Write a review page for: ${input.toolName}`,
    "",
    "Use these researched facts:",
    ...input.facts.map((f) => `- (${f.category}) ${f.content}`),
    "",
    input.affiliateUrl
      ? `Include a single CTA link to ${input.affiliateUrl}.`
      : "Do not include a CTA link.",
  ].join("\n");

  return { system, user };
}
