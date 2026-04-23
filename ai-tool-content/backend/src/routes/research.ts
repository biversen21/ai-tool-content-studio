import { Router, type Request, type Response } from "express";
import * as researchService from "../services/research.service.js";

export const researchRouter = Router();

// GET /api/research?toolId=...
researchRouter.get("/", async (req: Request, res: Response) => {
  const toolId = typeof req.query.toolId === "string" ? req.query.toolId : undefined;
  const runs = await researchService.listResearchRuns(toolId);
  res.json({ runs });
});

// POST /api/research — start a new run
researchRouter.post("/", async (_req: Request, res: Response) => {
  // TODO: validate req.body with StartResearchRunInput, then researchService.startResearchRun(input)
  res.status(501).json({ error: "Not implemented" });
});

// GET /api/research/:id
researchRouter.get("/:id", async (req: Request, res: Response) => {
  const run = await researchService.getResearchRun(req.params.id);
  if (!run) {
    res.status(404).json({ error: "Research run not found" });
    return;
  }
  res.json({ run });
});
