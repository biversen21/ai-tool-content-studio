-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "category" TEXT,
    "description" TEXT,
    "affiliateUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ResearchRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "toolId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "model" TEXT,
    "notes" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "ResearchRun_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResearchFact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "researchRunId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "confidence" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResearchFact_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeneratedAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "toolId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" TEXT,
    "model" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GeneratedAsset_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PublishPayload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generatedAssetId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PublishPayload_generatedAssetId_fkey" FOREIGN KEY ("generatedAssetId") REFERENCES "GeneratedAsset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Tool_slug_key" ON "Tool"("slug");

-- CreateIndex
CREATE INDEX "ResearchRun_toolId_idx" ON "ResearchRun"("toolId");

-- CreateIndex
CREATE INDEX "ResearchFact_researchRunId_idx" ON "ResearchFact"("researchRunId");

-- CreateIndex
CREATE INDEX "GeneratedAsset_toolId_idx" ON "GeneratedAsset"("toolId");

-- CreateIndex
CREATE INDEX "PublishPayload_generatedAssetId_idx" ON "PublishPayload"("generatedAssetId");
