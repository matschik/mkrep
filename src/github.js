import config from "./config.js";
import GithubAPI from "./lib/GithubAPI.js";

const githubAPI = new GithubAPI(config.get("githubToken"));

export default githubAPI;
