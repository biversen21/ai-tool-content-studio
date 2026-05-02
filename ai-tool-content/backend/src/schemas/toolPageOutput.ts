import { z } from "zod";

export const ToolPageOutput = z.object({
  seoTitle: z.string(),
  metaDescription: z.string(),
  title: z.string(),
  introduction: z.string(),
  idealUsers: z.array(z.string()),
  keyFeatures: z.array(z.object({ name: z.string(), description: z.string() })),
  pricingSummary: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  alternatives: z.array(z.string()),
  ctaCopy: z.string(),
  faqItems: z.array(z.object({ q: z.string(), a: z.string() })),
  decisionGuidance: z.string(),
  verdict: z.string(),
  contentMarkdown: z.string(),
});

export type ToolPageOutput = z.infer<typeof ToolPageOutput>;
