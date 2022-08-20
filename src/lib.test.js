import { describe, it } from "vitest";
import { createGitRepository, isPathAvailable } from "./lib.js";
import cuid from "cuid";
import { expect } from "vitest";
import { rm, stat } from "node:fs/promises";
import { join } from "node:path";

describe("lib", () => {
  it("createGitRepository", async () => {
    const name = `test-${cuid()}`;
    const path = await createGitRepository(`./${name}`);
    expect(stat(path)).toBeTruthy();
    expect(isPathAvailable(join(path, ".git"))).toBeTruthy();
    await rm(path, { recursive: true, force: true });
  });
});
