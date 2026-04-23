import { env } from "./env.js";
import { createServer } from "./server.js";

const app = createServer();

const server = app.listen(env.PORT, () => {
  console.log(`[backend] listening on http://localhost:${env.PORT}`);
  console.log(`[backend] health: http://localhost:${env.PORT}/api/health`);
});

const shutdown = (signal: NodeJS.Signals) => {
  console.log(`[backend] received ${signal}, shutting down`);
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
