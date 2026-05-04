import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { ar } from "../asyncRoute.js";

const req = {} as Request;
const res = {} as Response;

describe("ar (asyncRoute wrapper)", () => {
  it("forwards thrown errors to next()", async () => {
    const error = new Error("handler failed");
    const next = vi.fn() as unknown as NextFunction;

    ar(async () => { throw error; })(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(next).toHaveBeenCalledWith(error);
  });

  it("does not call next() when handler resolves cleanly", async () => {
    const next = vi.fn() as unknown as NextFunction;

    ar(async () => { /* success */ })(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(next).not.toHaveBeenCalled();
  });

  it("forwards rejected promise (not throw) to next()", async () => {
    const error = new Error("rejected");
    const next = vi.fn() as unknown as NextFunction;

    ar(() => Promise.reject(error))(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(next).toHaveBeenCalledWith(error);
  });
});
