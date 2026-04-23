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
  status: ToolStatus.default("draft"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateToolInput = ToolSchema.pick({
  slug: true,
  name: true,
  websiteUrl: true,
  category: true,
  description: true,
  affiliateUrl: true,
  status: true,
}).partial({ websiteUrl: true, category: true, description: true, affiliateUrl: true, status: true });

export const UpdateToolInput = CreateToolInput.partial();

export type Tool = z.infer<typeof ToolSchema>;
export type CreateToolInput = z.infer<typeof CreateToolInput>;
export type UpdateToolInput = z.infer<typeof UpdateToolInput>;
