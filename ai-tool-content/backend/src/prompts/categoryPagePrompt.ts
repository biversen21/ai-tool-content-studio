export const CATEGORY_PAGE_PROMPT_VERSION = "v0.1.0";

export interface CategoryPagePromptInput {
  category: string;
  tools: Array<{ name: string; oneLiner: string }>;
}

export function buildCategoryPagePrompt(input: CategoryPagePromptInput): {
  system: string;
  user: string;
} {
  const system =
    "You write category landing pages that help readers compare tools in a " +
    "given software category. Output Markdown.";

  const user = [
    `Category: ${input.category}`,
    "",
    "Tools to feature:",
    ...input.tools.map((t) => `- ${t.name}: ${t.oneLiner}`),
    "",
    "Structure: intro, what to look for, the lineup (one section per tool), takeaway.",
  ].join("\n");

  return { system, user };
}
