import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";

import { toolsRouter } from "./routes/tools.js";
import { researchRouter } from "./routes/research.js";
import { assetsRouter } from "./routes/assets.js";
import { publishRouter } from "./routes/publish.js";

export function createServer(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  // Health endpoint — used by the frontend placeholder on mount.
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "ai-tool-content-backend",
      timestamp: new Date().toISOString(),
    });
  });

  // Feature routers (stubs — wired here so URLs are real even before logic exists).
  app.use("/api/tools", toolsRouter);
  app.use("/api/research", researchRouter);
  app.use("/api/assets", assetsRouter);
  app.use("/api/publish", publishRouter);

  // 404
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Not found" });
  });

  // Centralized error handler
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[error]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  });

  return app;
}
