import { Router, type Request, type Response } from "express";
import * as researchService from "../services/research.service.js";
import { ar } from "../lib/asyncRoute.js";

export const researchRouter = Router();

// GET /api/research?toolId=...
researchRouter.get("/", ar(async (req, res) => {
  const toolId = typeof req.query.toolId === "string" ? req.query.toolId : undefined;
  const runs = await researchService.listResearchRuns(toolId);
  res.json({ runs });
}));

// POST /api/research
researchRouter.post("/", (_req: Request, res: Response) => {
  res.status(501).json({ error: "Not implemented" });
});

// GET /api/research/:id
researchRouter.get("/:id", ar(async (req, res) => {
  const run = await researchService.getResearchRun(req.params.id);
  if (!run) { res.status(404).json({ error: "Research run not found" }); return; }
  res.json({ run });
}));
