import Conf from "conf";
import fileDirname from "./lib/fileDirname.js";
import { existsSync } from "node:fs";
import { join } from "node:path";

const isGitRepo = existsSync(join(fileDirname(import.meta.url), "../.git"));

const config = new Conf({
  projectName: isGitRepo ? "mkrep-global" : "mkrep-local",
  schema: {
    GITHUB_TOKEN: {
      type: "string",
      default: "",
    },
    BASE_DIR: {
      type: "string",
      default: "",
    },
  },
});

export default config;
