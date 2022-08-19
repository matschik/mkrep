import dotenv from "dotenv";
import { appendFile, writeFile } from "node:fs/promises";

let parsedEnv = {};

const dotEnvFile = {
  async init() {
    const { parsed, error } = dotenv.config();
    parsedEnv = parsed || {};
    if (error) {
      if (error.code === "ENOENT") {
        await writeFile(".env", "");
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
};

export default dotEnvFile;
