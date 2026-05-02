import { z } from "zod";
import { PublishFormat, PublishStatus } from "../constants/status.js";

export const PublishPayloadSchema = z.object({
  id: z.string().cuid(),
  generatedAssetId: z.string().cuid(),
  payloadType: z.string(),               // asset type: tool_page | category_page | comparison_page
  payloadJson: z.string(),               // serialized JSON export body
  payloadMarkdown: z.string().nullable().optional(),
  format: PublishFormat,                 // which format was written to disk
  filePath: z.string().min(1),           // relative to repo root, e.g. "exports/json/tool_page/foo.json"
  status: PublishStatus.default("draft"),
  createdAt: z.coerce.date(),
});

export const CreatePublishPayloadInput = PublishPayloadSchema.pick({
  generatedAssetId: true,
  format: true,
});

export type PublishPayload = z.infer<typeof PublishPayloadSchema>;
export type CreatePublishPayloadInput = z.infer<typeof CreatePublishPayloadInput>;
