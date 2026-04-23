export const PUBLISH_PAYLOAD_PROMPT_VERSION = "v0.1.0";

export interface PublishPayloadPromptInput {
  assetType: string;
  title: string;
  markdown: string;
}

/**
 * Used when we want the model to shape a GeneratedAsset into a structured
 * publish payload (e.g. extract frontmatter, SEO fields, etc.) before export.
 */
export function buildPublishPayloadPrompt(input: PublishPayloadPromptInput): {
  system: string;
  user: string;
} {
  const system =
    "You convert a Markdown article into a publish-ready JSON payload with " +
    "fields: title, slug, description, tags[], body (markdown). Return JSON only.";

  const user = [
    `Asset type: ${input.assetType}`,
    `Title: ${input.title}`,
    "",
    "Markdown:",
    input.markdown,
  ].join("\n");

  return { system, user };
}
