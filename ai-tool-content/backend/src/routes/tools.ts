import { Router, type Request, type Response } from "express";
import * as toolService from "../services/tool.service.js";

export const toolsRouter = Router();

// GET /api/tools — list all tools
toolsRouter.get("/", async (_req: Request, res: Response) => {
  const tools = await toolService.listTools();
  res.json({ tools });
});

// GET /api/tools/:id — fetch one
toolsRouter.get("/:id", async (req: Request, res: Response) => {
  const tool = await toolService.getTool(req.params.id);
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }
  res.json({ tool });
});

// POST /api/tools — create
toolsRouter.post("/", async (_req: Request, res: Response) => {
  // TODO: validate req.body with CreateToolInput, then toolService.createTool(input)
  res.status(501).json({ error: "Not implemented" });
});
