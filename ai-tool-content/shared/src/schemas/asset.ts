import { z } from "zod";
import { AssetStatus, AssetType } from "../constants/status.js";

export const GeneratedAssetSchema = z.object({
  id: z.string().cuid(),
  toolId: z.string().cuid(),
  type: AssetType,
  title: z.string().min(1).max(300),
  content: z.string().min(1), // markdown body
  metadata: z.string().nullable().optional(), // JSON-encoded blob
  model: z.string().nullable().optional(),
  status: AssetStatus.default("draft"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateGeneratedAssetInput = GeneratedAssetSchema.pick({
  toolId: true,
  type: true,
  title: true,
  content: true,
  metadata: true,
  model: true,
  status: true,
}).partial({ metadata: true, model: true, status: true });

export const UpdateGeneratedAssetInput = CreateGeneratedAssetInput.partial();

export type GeneratedAsset = z.infer<typeof GeneratedAssetSchema>;
export type CreateGeneratedAssetInput = z.infer<typeof CreateGeneratedAssetInput>;
export type UpdateGeneratedAssetInput = z.infer<typeof UpdateGeneratedAssetInput>;
