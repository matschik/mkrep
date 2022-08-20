import { gitAddAll, gitCommit, gitPush, gitRemoteAddOrigin } from "./git.js";
import {
  createGitIgnore,
  createLocalRepo,
  createPackageJson,
  isPathAvailable,
} from "./lib.js";
import { join } from "node:path";
import {
  createGithubRepository,
  isGithubRepositoryAvailable,
} from "./githubAPI.js";
import untildify from "untildify";
import { rm } from "node:fs";

export default async function mkrep(basePath, repoName) {
  basePath = untildify(basePath);
  const repoPath = join(basePath, repoName);

  async function exec() {
    // check if repo is available
    await Promise.all([
      isGithubRepositoryAvailable(repoName),
      isPathAvailable(repoPath),
    ]);

    // create local repo & add node.js essential files
    await createLocalRepo(repoPath);
    await Promise.all([createPackageJson(repoPath), createGitIgnore(repoPath)]);
    await gitAddAll(repoPath);
    await gitCommit(repoPath, "Initial commit");

    // create remote repo
    const {
      data: { ssh_url },
    } = await createGithubRepository(repoName);

    // push to remote repo
    await gitRemoteAddOrigin(repoPath, ssh_url);
    await gitPush(repoPath);

    console.info(`Repo created at ${repoPath}`);
  }

  try {
    await exec();
  } catch (error) {
    if (!(await isPathAvailable(repoPath))) {
      await rm(repoPath, { recursive: true, force: true });
    }
    throw error;
  }
}
