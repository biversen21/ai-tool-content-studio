/*
  Warnings:

  - Added the required column `filePath` to the `PublishPayload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `format` to the `PublishPayload` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PublishPayload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generatedAssetId" TEXT NOT NULL,
    "payloadType" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "payloadMarkdown" TEXT,
    "format" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PublishPayload_generatedAssetId_fkey" FOREIGN KEY ("generatedAssetId") REFERENCES "GeneratedAsset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PublishPayload" ("createdAt", "generatedAssetId", "id", "payloadJson", "payloadMarkdown", "payloadType", "status") SELECT "createdAt", "generatedAssetId", "id", "payloadJson", "payloadMarkdown", "payloadType", "status" FROM "PublishPayload";
DROP TABLE "PublishPayload";
ALTER TABLE "new_PublishPayload" RENAME TO "PublishPayload";
CREATE INDEX "PublishPayload_generatedAssetId_idx" ON "PublishPayload"("generatedAssetId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
