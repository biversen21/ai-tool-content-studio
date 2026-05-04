import { Router, type Request, type Response } from "express";
import * as publishService from "../services/publish.service.js";
import { ar } from "../lib/asyncRoute.js";

export const publishRouter = Router();

// GET /api/publish?assetId=...
publishRouter.get("/", ar(async (req, res) => {
  const assetId = typeof req.query.assetId === "string" ? req.query.assetId : undefined;
  const payloads = await publishService.listPayloads(assetId);
  res.json({ payloads });
}));

// POST /api/publish
publishRouter.post("/", (_req: Request, res: Response) => {
  res.status(501).json({ error: "Not implemented" });
});
