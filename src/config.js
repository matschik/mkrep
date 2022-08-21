import Conf from "conf";

const config = new Conf({
  projectName: `mkrep-${md5(process.cwd())}`,
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
