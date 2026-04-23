export const COMPARISON_PAGE_PROMPT_VERSION = "v0.1.0";

export interface ComparisonPagePromptInput {
  toolA: { name: string; facts: Array<{ category: string; content: string }> };
  toolB: { name: string; facts: Array<{ category: string; content: string }> };
}

export function buildComparisonPagePrompt(input: ComparisonPagePromptInput): {
  system: string;
  user: string;
} {
  const system =
    "You write head-to-head comparison articles for software tools. Be fair, " +
    "specific, and call out tradeoffs. Output Markdown with a comparison table.";

  const renderFacts = (facts: Array<{ category: string; content: string }>) =>
    facts.map((f) => `  - (${f.category}) ${f.content}`).join("\n");

  const user = [
    `Compare ${input.toolA.name} vs ${input.toolB.name}.`,
    "",
    `${input.toolA.name} facts:`,
    renderFacts(input.toolA.facts),
    "",
    `${input.toolB.name} facts:`,
    renderFacts(input.toolB.facts),
    "",
    "Required sections: TL;DR, comparison table, deep dive per dimension, who-should-pick-which.",
  ].join("\n");

  return { system, user };
}
