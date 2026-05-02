import { z } from "zod";

/**
 * Status enums.
 *
 * The DB stores these as plain strings (SQLite + Prisma keeps things simple).
 * Validation happens here, at the API edge, via Zod. Anything that touches a
 * status field — services, routes, frontend — should import from this module.
 */

export const TOOL_STATUS = ["draft", "researched", "generated", "approved", "archived"] as const;
export const RESEARCH_STATUS = ["pending", "running", "completed", "failed"] as const;
export const ASSET_STATUS = ["draft", "generated", "approved", "archived"] as const;
export const PUBLISH_STATUS = ["draft", "exported", "published", "failed"] as const;

export const ToolStatus = z.enum(TOOL_STATUS);
export const ResearchStatus = z.enum(RESEARCH_STATUS);
export const AssetStatus = z.enum(ASSET_STATUS);
export const PublishStatus = z.enum(PUBLISH_STATUS);

export type ToolStatus = z.infer<typeof ToolStatus>;
export type ResearchStatus = z.infer<typeof ResearchStatus>;
export type AssetStatus = z.infer<typeof AssetStatus>;
export type PublishStatus = z.infer<typeof PublishStatus>;

export const RESEARCH_FACT_CATEGORY = [
  "feature",
  "pricing",
  "use_case",
  "audience",
  "integration",
  "competitor",
  "claim",
  "other",
] as const;

export const ResearchFactCategory = z.enum(RESEARCH_FACT_CATEGORY);
export type ResearchFactCategory = z.infer<typeof ResearchFactCategory>;

export const ASSET_TYPE = [
  "tool_page",
  "category_page",
  "comparison_page",
] as const;

export const AssetType = z.enum(ASSET_TYPE);
export type AssetType = z.infer<typeof AssetType>;

export const PUBLISH_FORMAT = ["json", "markdown"] as const;
export const PublishFormat = z.enum(PUBLISH_FORMAT);
export type PublishFormat = z.infer<typeof PublishFormat>;
