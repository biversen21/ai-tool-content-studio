import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../db/client.js", () => ({
  prisma: {
    tool: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "../../db/client.js";
import { listTools, getTool, createTool, updateTool } from "../tool.service.js";

// Cast to access mock functions
const db = prisma.tool as {
  findMany: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

const fakeTool = {
  id: "cltest123",
  slug: "my-tool",
  name: "My Tool",
  websiteUrl: null,
  category: null,
  description: null,
  affiliateUrl: null,
  notes: null,
  status: "draft",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ---- listTools ----

describe("listTools", () => {
  it("returns rows ordered by createdAt desc", async () => {
    db.findMany.mockResolvedValue([fakeTool]);
    const result = await listTools();
    expect(result).toEqual([fakeTool]);
    expect(db.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: "desc" } });
  });

  it("returns empty array when no tools exist", async () => {
    db.findMany.mockResolvedValue([]);
    expect(await listTools()).toEqual([]);
  });
});

// ---- getTool ----

describe("getTool", () => {
  it("returns the tool when found", async () => {
    db.findUnique.mockResolvedValue(fakeTool);
    const result = await getTool("cltest123");
    expect(result).toEqual(fakeTool);
    expect(db.findUnique).toHaveBeenCalledWith({ where: { id: "cltest123" } });
  });

  it("returns null when not found", async () => {
    db.findUnique.mockResolvedValue(null);
    expect(await getTool("missing")).toBeNull();
  });
});

// ---- createTool ----

describe("createTool", () => {
  it("creates a tool with slug derived from name", async () => {
    db.findUnique.mockResolvedValue(null); // slug available
    db.create.mockResolvedValue({ ...fakeTool, slug: "my-tool", name: "My Tool" });

    await createTool({ name: "My Tool" });

    expect(db.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: "my-tool", name: "My Tool", status: "draft" }),
      }),
    );
  });

  it("appends -2 when base slug is taken", async () => {
    db.findUnique
      .mockResolvedValueOnce(fakeTool) // "my-tool" taken
      .mockResolvedValueOnce(null);    // "my-tool-2" free
    db.create.mockResolvedValue({ ...fakeTool, slug: "my-tool-2" });

    await createTool({ name: "My Tool" });

    expect(db.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: "my-tool-2" }),
      }),
    );
  });

  it("appends -3 when -2 is also taken", async () => {
    db.findUnique
      .mockResolvedValueOnce(fakeTool) // base taken
      .mockResolvedValueOnce(fakeTool) // -2 taken
      .mockResolvedValueOnce(null);    // -3 free
    db.create.mockResolvedValue({ ...fakeTool, slug: "my-tool-3" });

    await createTool({ name: "My Tool" });

    expect(db.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: "my-tool-3" }),
      }),
    );
  });

  it("strips special characters from the name when forming slug", async () => {
    db.findUnique.mockResolvedValue(null);
    db.create.mockResolvedValue({ ...fakeTool, slug: "hello-world" });

    await createTool({ name: "Hello, World!" });

    expect(db.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: "hello-world" }),
      }),
    );
  });

  it("stores affiliateUrl and notes when provided", async () => {
    db.findUnique.mockResolvedValue(null);
    db.create.mockResolvedValue(fakeTool);

    await createTool({ name: "Tool", affiliateUrl: "https://example.com", notes: "great tool" });

    expect(db.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ affiliateUrl: "https://example.com", notes: "great tool" }),
      }),
    );
  });
});

// ---- updateTool ----

describe("updateTool", () => {
  it("returns null when tool does not exist", async () => {
    db.findUnique.mockResolvedValue(null);
    const result = await updateTool("missing", { name: "New Name" });
    expect(result).toBeNull();
    expect(db.update).not.toHaveBeenCalled();
  });

  it("calls update and returns result when tool exists", async () => {
    db.findUnique.mockResolvedValue({ id: "cltest123" });
    db.update.mockResolvedValue({ ...fakeTool, name: "Updated Name" });

    const result = await updateTool("cltest123", { name: "Updated Name" });

    expect(result?.name).toBe("Updated Name");
    expect(db.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "cltest123" } }),
    );
  });
});
