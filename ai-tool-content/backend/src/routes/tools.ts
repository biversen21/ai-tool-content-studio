import { Router, type Request, type Response } from "express";
import { CreateToolInput, UpdateToolInput } from "@ai-tool-content/shared";
import * as toolService from "../services/tool.service.js";
import * as researchService from "../services/research.service.js";

export const toolsRouter = Router();

// GET /api/tools
toolsRouter.get("/", async (_req: Request, res: Response) => {
  const tools = await toolService.listTools();
  res.json({ tools });
});

// POST /api/tools
toolsRouter.post("/", async (req: Request, res: Response) => {
  const result = CreateToolInput.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  const tool = await toolService.createTool(result.data);
  res.status(201).json({ tool });
});

// POST /api/tools/:id/research — start a research run (defined before /:id to avoid ambiguity)
toolsRouter.post("/:id/research", async (req: Request, res: Response) => {
  const tool = await toolService.getTool(req.params.id);
  if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }
  const notes = typeof req.body?.notes === "string" ? req.body.notes : undefined;
  const run = await researchService.startResearchRun(req.params.id, notes);
  res.status(201).json({ run });
});

// GET /api/tools/:id/research — latest run + facts
toolsRouter.get("/:id/research", async (req: Request, res: Response) => {
  const tool = await toolService.getTool(req.params.id);
  if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }
  const run = await researchService.getLatestResearchRunForTool(req.params.id);
  res.json({ run });
});

// GET /api/tools/:id
toolsRouter.get("/:id", async (req: Request, res: Response) => {
  const tool = await toolService.getTool(req.params.id);
  if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }
  res.json({ tool });
});

// PATCH /api/tools/:id
toolsRouter.patch("/:id", async (req: Request, res: Response) => {
  const result = UpdateToolInput.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  const tool = await toolService.updateTool(req.params.id, result.data);
  if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }
  res.json({ tool });
});
