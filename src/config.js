import Conf from "conf";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import fileDirname from "./lib/fileDirname.js";

const { name } = JSON.parse(
  readFileSync(join(fileDirname(import.meta.url), "../../package.json"))
);

const config = new Conf({
  projectName: `${name}-${md5(process.cwd())}`,
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
