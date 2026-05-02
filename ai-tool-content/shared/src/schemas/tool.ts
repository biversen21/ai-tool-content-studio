import { z } from "zod";
import { ToolStatus } from "../constants/status.js";

const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case");

export const ToolSchema = z.object({
  id: z.string().cuid(),
  slug: slugSchema,
  name: z.string().min(1).max(200),
  websiteUrl: z.string().url().nullable().optional(),
  category: z.string().max(120).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  affiliateUrl: z.string().url().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  status: ToolStatus.default("draft"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// POST /api/tools — slug is auto-generated from name
export const CreateToolInput = z.object({
  name: z.string().min(1).max(200),
  affiliateUrl: z.string().url().optional(),
  notes: z.string().max(2000).optional(),
});

// PATCH /api/tools/:id — all fields optional; slug can be overridden manually
export const UpdateToolInput = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: slugSchema.optional(),
  affiliateUrl: z.string().url().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  status: ToolStatus.optional(),
});

export type Tool = z.infer<typeof ToolSchema>;
export type CreateToolInput = z.infer<typeof CreateToolInput>;
export type UpdateToolInput = z.infer<typeof UpdateToolInput>;
