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

export default async function mkrep(basePath, repoName) {
  const repoPath = join(basePath, repoName);

  // check if repo is available
  await Promise.all([
    isGithubRepositoryAvailable(repoName),
    isPathAvailable(repoName),
  ]);

  // create remote repo
  const {
    data: { ssh_url },
  } = await createGithubRepository(repoName);

  // create local repo & add node.js essential files
  await createLocalRepo(repoPath);
  await Promise.all([createPackageJson(repoPath), createGitIgnore(repoPath)]);
  await gitAddAll(repoPath);
  await gitCommit(repoPath, "Initial commit");

  // push to remote repo
  await gitRemoteAddOrigin(repoPath, ssh_url);
  await gitPush(repoPath);
}
