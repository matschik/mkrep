import { describe, it } from "vitest";
import { createLocalRepo, isPathAvailable } from "./lib.js";
import cuid from "cuid";
import { expect } from "vitest";
import { rm, stat } from "node:fs/promises";
import { join } from "node:path";

describe("lib", () => {
  it("createLocalRepo", async () => {
    const name = `test-${cuid()}`;
    const path = await createLocalRepo(`./${name}`);
    expect(stat(path)).toBeTruthy();
    expect(isPathAvailable(join(path, ".git"))).toBeTruthy();
    await rm(path, { recursive: true, force: true });
  });
});
