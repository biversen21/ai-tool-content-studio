/*
  Warnings:

  - You are about to drop the column `content` on the `GeneratedAsset` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `GeneratedAsset` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `PublishPayload` table. All the data in the column will be lost.
  - You are about to drop the column `format` on the `PublishPayload` table. All the data in the column will be lost.
  - Added the required column `contentJson` to the `GeneratedAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `GeneratedAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payloadJson` to the `PublishPayload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payloadType` to the `PublishPayload` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GeneratedAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "toolId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentJson" TEXT NOT NULL,
    "contentMarkdown" TEXT,
    "model" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GeneratedAsset_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GeneratedAsset" ("createdAt", "id", "model", "status", "title", "toolId", "type", "updatedAt") SELECT "createdAt", "id", "model", "status", "title", "toolId", "type", "updatedAt" FROM "GeneratedAsset";
DROP TABLE "GeneratedAsset";
ALTER TABLE "new_GeneratedAsset" RENAME TO "GeneratedAsset";
CREATE INDEX "GeneratedAsset_toolId_idx" ON "GeneratedAsset"("toolId");
CREATE TABLE "new_PublishPayload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generatedAssetId" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "payloadMarkdown" TEXT,
    "payloadType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PublishPayload_generatedAssetId_fkey" FOREIGN KEY ("generatedAssetId") REFERENCES "GeneratedAsset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PublishPayload" ("createdAt", "generatedAssetId", "id", "status") SELECT "createdAt", "generatedAssetId", "id", "status" FROM "PublishPayload";
DROP TABLE "PublishPayload";
ALTER TABLE "new_PublishPayload" RENAME TO "PublishPayload";
CREATE INDEX "PublishPayload_generatedAssetId_idx" ON "PublishPayload"("generatedAssetId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
