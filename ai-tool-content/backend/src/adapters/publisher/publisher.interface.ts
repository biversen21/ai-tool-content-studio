/**
 * Publisher contract.
 *
 * Every publishing target — local disk, a CMS, a static site repo — implements
 * this interface. The publish.service depends only on this type so we can swap
 * targets without touching business logic.
 */

export interface PublishInput {
  /** Suggested filename, no path. e.g. "my-tool-review.md" */
  filename: string;
  /** "json" | "markdown" — informs subdirectory routing for local export */
  format: "json" | "markdown";
  /** Serialized payload bytes/string ready to write */
  body: string;
}

export interface PublishResult {
  /** Path of the written artifact, relative to the repo root */
  filePath: string;
  /** Optional remote URL once non-local adapters exist */
  url?: string;
}

export interface Publisher {
  write(input: PublishInput): Promise<PublishResult>;
}
