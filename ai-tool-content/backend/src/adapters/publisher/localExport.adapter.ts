import { promises as fs } from "node:fs";
import path from "node:path";
import { env } from "../../env.js";
import type {
  Publisher,
  PublishInput,
  PublishResult,
} from "./publisher.interface.js";

/**
 * LocalExportAdapter — writes payloads to ./exports/{json|markdown}/<filename>.
 * EXPORT_DIR is resolved relative to the repo root (process.cwd()) by default.
 */
export class LocalExportAdapter implements Publisher {
  constructor(private readonly rootDir: string = env.EXPORT_DIR) {}

  async write(input: PublishInput): Promise<PublishResult> {
    const subdir = input.format === "json" ? "json" : "markdown";
    const dir = path.resolve(process.cwd(), this.rootDir, subdir);
    await fs.mkdir(dir, { recursive: true });

    const filePath = path.join(dir, input.filename);
    await fs.writeFile(filePath, input.body, "utf8");

    // Return path relative to repo root for storage in PublishPayload.filePath
    const rel = path.relative(process.cwd(), filePath);
    return { filePath: rel };
  }
}
