import { z } from "zod";

const SourcedClaim = z.object({
  claim: z.string(),
  sourceUrl: z.string().url().optional(),
  confidence: z.number().min(0).max(1),
});

const InferredClaim = z.object({
  claim: z.string(),
  confidence: z.number().min(0).max(1),
});

export const ToolResearchOutput = z.object({
  canonical_name: z.string(),
  summary: z.string(),
  likely_category: z.string(),
  likely_subcategories: z.array(z.string()),
  likely_target_users: z.array(z.string()),
  likely_use_cases: z.array(z.string()),
  likely_key_features: z.array(z.string()),
  likely_pricing_model: z.string(),
  likely_competitors: z.array(z.string()),
  likely_alternatives: z.array(z.string()),
  likely_comparison_pairs: z.array(z.string()),
  affiliate_fit_score: z.number().int().min(1).max(10),
  monetization_notes: z.string(),
  missing_information: z.array(z.string()),
  sourced_claims: z.array(SourcedClaim),
  inferred_claims: z.array(InferredClaim),
  confidence_overall: z.number().min(0).max(1),
  confidence_notes: z.string(),
});

export type ToolResearchOutput = z.infer<typeof ToolResearchOutput>;
