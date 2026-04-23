import { Router, type Request, type Response } from "express";
import * as generationService from "../services/generation.service.js";

export const assetsRouter = Router();

// GET /api/assets?toolId=...
assetsRouter.get("/", async (req: Request, res: Response) => {
  const toolId = typeof req.query.toolId === "string" ? req.query.toolId : undefined;
  const assets = await generationService.listAssets(toolId);
  res.json({ assets });
});

// GET /api/assets/:id
assetsRouter.get("/:id", async (req: Request, res: Response) => {
  const asset = await generationService.getAsset(req.params.id);
  if (!asset) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }
  res.json({ asset });
});

// POST /api/assets — generate a new asset for a tool
assetsRouter.post("/", async (_req: Request, res: Response) => {
  // TODO: validate req.body, then generationService.generateAsset(input)
  res.status(501).json({ error: "Not implemented" });
});
