import { z } from "zod";
import { PublishFormat, PublishStatus } from "../constants/status.js";

export const PublishPayloadSchema = z.object({
  id: z.string().cuid(),
  generatedAssetId: z.string().cuid(),
  format: PublishFormat,
  filePath: z.string().min(1), // relative to repo root, e.g. "exports/markdown/foo.md"
  status: PublishStatus.default("draft"),
  createdAt: z.coerce.date(),
});

export const CreatePublishPayloadInput = PublishPayloadSchema.pick({
  generatedAssetId: true,
  format: true,
});

export type PublishPayload = z.infer<typeof PublishPayloadSchema>;
export type CreatePublishPayloadInput = z.infer<typeof CreatePublishPayloadInput>;
