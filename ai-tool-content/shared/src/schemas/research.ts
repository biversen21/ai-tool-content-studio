import { z } from "zod";
import { ResearchStatus, ResearchFactCategory } from "../constants/status.js";

export const ResearchFactSchema = z.object({
  id: z.string().cuid(),
  researchRunId: z.string().cuid(),
  category: ResearchFactCategory,
  content: z.string().min(1),
  sourceUrl: z.string().url().nullable().optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
  createdAt: z.coerce.date(),
});

export const ResearchRunSchema = z.object({
  id: z.string().cuid(),
  toolId: z.string().cuid(),
  status: ResearchStatus.default("pending"),
  model: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  startedAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable().optional(),
});

export const StartResearchRunInput = z.object({
  toolId: z.string().cuid(),
  model: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateResearchFactInput = ResearchFactSchema.pick({
  researchRunId: true,
  category: true,
  content: true,
  sourceUrl: true,
  confidence: true,
}).partial({ sourceUrl: true, confidence: true });

export type ResearchRun = z.infer<typeof ResearchRunSchema>;
export type ResearchFact = z.infer<typeof ResearchFactSchema>;
export type StartResearchRunInput = z.infer<typeof StartResearchRunInput>;
export type CreateResearchFactInput = z.infer<typeof CreateResearchFactInput>;
