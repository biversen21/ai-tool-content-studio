import { z } from "zod";

export const ComparisonPageOutput = z.object({
  seoTitle: z.string(),
  metaDescription: z.string(),
  title: z.string(),
  tldr: z.string(),
  comparisonTable: z.array(z.object({
    dimension: z.string(),
    toolA: z.string(),
    toolB: z.string(),
  })),
  deepDive: z.array(z.object({
    dimension: z.string(),
    analysis: z.string(),
  })),
  whoShouldPickA: z.string(),
  whoShouldPickB: z.string(),
  verdict: z.string(),
  contentMarkdown: z.string(),
});

export type ComparisonPageOutput = z.infer<typeof ComparisonPageOutput>;
