import { z } from "zod";
import { AssetStatus, AssetType } from "../constants/status.js";

export const GeneratedAssetSchema = z.object({
  id: z.string().cuid(),
  toolId: z.string().cuid(),
  type: AssetType,
  slug: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  contentJson: z.string().min(1),     // JSON-stringified structured output
  contentMarkdown: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  status: AssetStatus.default("draft"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateGeneratedAssetInput = GeneratedAssetSchema.pick({
  toolId: true,
  type: true,
  slug: true,
  title: true,
  contentJson: true,
  contentMarkdown: true,
  model: true,
  status: true,
}).partial({ contentMarkdown: true, model: true, status: true });

export const UpdateGeneratedAssetInput = CreateGeneratedAssetInput.partial();

export type GeneratedAsset = z.infer<typeof GeneratedAssetSchema>;
export type CreateGeneratedAssetInput = z.infer<typeof CreateGeneratedAssetInput>;
export type UpdateGeneratedAssetInput = z.infer<typeof UpdateGeneratedAssetInput>;
