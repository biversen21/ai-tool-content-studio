/**
 * Prompt: research a single Tool.
 * Versioned here so we can iterate without touching service code.
 */

export const TOOL_RESEARCH_PROMPT_VERSION = "v0.1.0";

export interface ToolResearchPromptInput {
  toolName: string;
  toolWebsite?: string | null;
  category?: string | null;
}

export function buildToolResearchPrompt(input: ToolResearchPromptInput): {
  system: string;
  user: string;
} {
  const system =
    "You are a careful research assistant. Extract verifiable facts about " +
    "a software tool. Categorize each fact (feature | pricing | pro | con | " +
    "use_case | integration | other). Cite sources where possible.";

  const user = [
    `Tool: ${input.toolName}`,
    input.toolWebsite ? `Website: ${input.toolWebsite}` : null,
    input.category ? `Category: ${input.category}` : null,
    "",
    "Return a JSON array of facts with fields: { category, content, sourceUrl?, confidence? }.",
  ]
    .filter(Boolean)
    .join("\n");

  return { system, user };
}
