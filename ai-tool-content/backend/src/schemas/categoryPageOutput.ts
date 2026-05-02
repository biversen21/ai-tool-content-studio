import { z } from "zod";

export const CategoryPageOutput = z.object({
  seoTitle: z.string(),
  metaDescription: z.string(),
  title: z.string(),
  introduction: z.string(),
  whatToLookFor: z.array(z.string()),
  toolSummaries: z.array(z.object({
    name: z.string(),
    summary: z.string(),
    bestFor: z.string(),
  })),
  comparisonNotes: z.string(),
  verdict: z.string(),
  contentMarkdown: z.string(),
});

export type CategoryPageOutput = z.infer<typeof CategoryPageOutput>;
