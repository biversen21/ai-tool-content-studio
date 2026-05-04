import { Router, type Request, type Response } from "express";
import { CreateToolInput, UpdateToolInput } from "@ai-tool-content/shared";
import * as toolService from "../services/tool.service.js";
import * as researchService from "../services/research.service.js";
import * as generationService from "../services/generation.service.js";
import { ar } from "../lib/asyncRoute.js";

export const toolsRouter = Router();

// GET /api/tools
toolsRouter.get("/", ar(async (_req, res) => {
  const tools = await toolService.listTools();
  res.json({ tools });
}));

// POST /api/tools
toolsRouter.post("/", ar(async (req, res) => {
  const result = CreateToolInput.safeParse(req.body);
  if (!result.success) { res.status(400).json({ error: result.error.flatten() }); return; }
  const tool = await toolService.createTool(result.data);
  res.status(201).json({ tool });
}));

// POST /api/tools/:id/research
toolsRouter.post("/:id/research", ar(async (req, res) => {
  const tool = await toolService.getTool(req.params.id);
  if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }
  const notes = typeof req.body?.notes === "string" ? req.body.notes : undefined;
  const run = await researchService.startResearchRun(req.params.id, notes);
  res.status(201).json({ run });
}));

// GET /api/tools/:id/research
toolsRouter.get("/:id/research", ar(async (req, res) => {
  const tool = await toolService.getTool(req.params.id);
  if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }
  const run = await researchService.getLatestResearchRunForTool(req.params.id);
  res.json({ run });
}));

// POST /api/tools/:id/generate/tool-page
toolsRouter.post("/:id/generate/tool-page", ar(async (req, res) => {
  const tool = await toolService.getTool(req.params.id);
  if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }
  const asset = await generationService.generateToolPage(req.params.id);
  res.status(201).json({ asset });
}));

// POST /api/tools/:id/generate/category-page
toolsRouter.post("/:id/generate/category-page", ar(async (req, res) => {
  const tool = await toolService.getTool(req.params.id);
  if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }
  const asset = await generationService.generateCategoryPage(req.params.id);
  res.status(201).json({ asset });
}));

// POST /api/tools/:id/generate/comparison-page
toolsRouter.post("/:id/generate/comparison-page", ar(async (req, res) => {
  const tool = await toolService.getTool(req.params.id);
  if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }
  const asset = await generationService.generateComparisonPage(req.params.id);
  res.status(201).json({ asset });
}));

// POST /api/tools/:id/generate/all
toolsRouter.post("/:id/generate/all", ar(async (req, res) => {
  const tool = await toolService.getTool(req.params.id);
  if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }
  const assets = await generationService.generateAll(req.params.id);
  res.status(201).json({ assets });
}));

// GET /api/tools/:id/assets
toolsRouter.get("/:id/assets", ar(async (req, res) => {
  const tool = await toolService.getTool(req.params.id);
  if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }
  const assets = await generationService.listAssets(req.params.id);
  res.json({ assets });
}));

// GET /api/tools/:id
toolsRouter.get("/:id", ar(async (req, res) => {
  const tool = await toolService.getTool(req.params.id);
  if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }
  res.json({ tool });
}));

// PATCH /api/tools/:id
toolsRouter.patch("/:id", ar(async (req, res) => {
  const result = UpdateToolInput.safeParse(req.body);
  if (!result.success) { res.status(400).json({ error: result.error.flatten() }); return; }
  const tool = await toolService.updateTool(req.params.id, result.data);
  if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }
  res.json({ tool });
}));
