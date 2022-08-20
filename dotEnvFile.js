import dotenv from "dotenv";
import { rm, appendFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import fileDirname from "./src/fileDirname.js";

let parsedEnv = {};

const dotEnvFile = {
  getPath() {
    return join(fileDirname(import.meta.url), ".env");
  },
  async init() {
    const { parsed, error } = dotenv.config();
    parsedEnv = parsed || {};
    if (error) {
      if (error.code === "ENOENT") {
        await writeFile(this.getPath());
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
    await rm(this.getPath());
    parsedEnv = {};
  },
};

export default dotEnvFile;
