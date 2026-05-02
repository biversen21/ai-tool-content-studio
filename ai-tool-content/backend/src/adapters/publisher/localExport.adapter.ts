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
    const fullPath = path.resolve(process.cwd(), this.rootDir, subdir, input.filename);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, input.body, "utf8");
    return { filePath: path.relative(process.cwd(), fullPath) };
  }
}
