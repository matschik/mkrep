import Conf from "conf";
import md5 from "./lib/md5.js";

const config = new Conf({
  projectName: `mkrep-${md5(process.argv.at(-1))}`,
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
