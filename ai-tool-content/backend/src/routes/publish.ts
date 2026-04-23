import { Router, type Request, type Response } from "express";
import * as publishService from "../services/publish.service.js";

export const publishRouter = Router();

// GET /api/publish?assetId=...
publishRouter.get("/", async (req: Request, res: Response) => {
  const assetId = typeof req.query.assetId === "string" ? req.query.assetId : undefined;
  const payloads = await publishService.listPayloads(assetId);
  res.json({ payloads });
});

// POST /api/publish — create + write a publish payload to disk
publishRouter.post("/", async (_req: Request, res: Response) => {
  // TODO: validate req.body with CreatePublishPayloadInput, then publishService.publishAsset(input)
  res.status(501).json({ error: "Not implemented" });
});
