import dotenv from "dotenv";
import { rm, appendFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import fileDirname from "./src/lib/fileDirname.js";

const envPath = join(fileDirname(import.meta.url), ".env");

let parsedEnv = {};

const dotEnvFile = {
  async init() {
    const { parsed, error } = dotenv.config({ path: envPath });
    parsedEnv = parsed || {};
    if (error) {
      if (error.code === "ENOENT") {
        await writeFile(envPath, "");
      }
    }
  },
  async set(key, value) {
    if (this.has(key)) return;
    await appendFile(".env", `${key}=${value}\n`);
    this.init();
  },
  has(key) {
    return !!parsedEnv[key];
  },
  get(key) {
    return parsedEnv[key];
  },
  async reset() {
    await rm(envPath);
    parsedEnv = {};
  },
};

export default dotEnvFile;
