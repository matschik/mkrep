import Conf from "conf";
import fileDirname from "./lib/fileDirname.js";
import { readFileSync } from "node:fs";

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
