import { Router, type Request, type Response } from "express";
import { PatchAssetInput } from "@ai-tool-content/shared";
import * as generationService from "../services/generation.service.js";
import * as publishService from "../services/publish.service.js";
import { ar } from "../lib/asyncRoute.js";

export const assetsRouter = Router();

// GET /api/assets?toolId=...
assetsRouter.get("/", ar(async (req, res) => {
  const toolId = typeof req.query.toolId === "string" ? req.query.toolId : undefined;
  const assets = await generationService.listAssets(toolId);
  res.json({ assets });
}));

// POST /api/assets/:id/approve
assetsRouter.post("/:id/approve", ar(async (req, res) => {
  const asset = await generationService.approveAsset(req.params.id);
  if (!asset) { res.status(404).json({ error: "Asset not found" }); return; }
  res.json({ asset });
}));

// POST /api/assets/:id/publish-preview
assetsRouter.post("/:id/publish-preview", ar(async (req, res) => {
  const preview = await publishService.previewPayload(req.params.id);
  res.json(preview);
}));

// POST /api/assets/:id/export-json
assetsRouter.post("/:id/export-json", ar(async (req, res) => {
  const payload = await publishService.exportAsset(req.params.id, "json");
  res.status(201).json({ payload });
}));

// POST /api/assets/:id/export-markdown
assetsRouter.post("/:id/export-markdown", ar(async (req, res) => {
  const payload = await publishService.exportAsset(req.params.id, "markdown");
  res.status(201).json({ payload });
}));

// GET /api/assets/:id/payloads
assetsRouter.get("/:id/payloads", ar(async (req, res) => {
  const payloads = await publishService.listPayloads(req.params.id);
  res.json({ payloads });
}));

// GET /api/assets/:id
assetsRouter.get("/:id", ar(async (req, res) => {
  const asset = await generationService.getAsset(req.params.id);
  if (!asset) { res.status(404).json({ error: "Asset not found" }); return; }
  res.json({ asset });
}));

// PATCH /api/assets/:id
assetsRouter.patch("/:id", ar(async (req, res) => {
  const result = PatchAssetInput.safeParse(req.body);
  if (!result.success) { res.status(400).json({ error: result.error.flatten() }); return; }
  const asset = await generationService.updateAsset(req.params.id, result.data);
  if (!asset) { res.status(404).json({ error: "Asset not found" }); return; }
  res.json({ asset });
}));
