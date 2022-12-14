import { rm } from "node:fs/promises";
import { join } from "node:path";
import untildify from "untildify";
import {
  gitAddAll,
  gitCommit,
  gitPush,
  gitRemoteAddOrigin,
} from "./lib/git.js";
import github from "./github.js";
import {
  createGitIgnore,
  createGitRepository,
  createPackageJson,
  isPathAvailable,
} from "./lib.js";

export default async function mkrep(basePath, repoName, { onReadyToCreate }) {
  basePath = untildify(basePath);
  const repoPath = join(basePath, repoName);

  async function exec() {
    if (!(await github.isRepositoryAvailable(repoName))) {
      throw new Error(`Github repository '${repoName}' already exists`);
    }

    if (!(await isPathAvailable(repoPath))) {
      throw new Error(`'${repoPath}' already exists`);
    }

    onReadyToCreate && (await onReadyToCreate(repoPath));

    // create local repo
    await createGitRepository(repoPath);

    // create remote repo
    const { data: githubRepository } = await github.createRepository(repoName);

    // add node.js essential files
    await Promise.all([
      createPackageJson(repoPath, githubRepository),
      createGitIgnore(repoPath),
    ]);
    await gitAddAll(repoPath);
    await gitCommit(repoPath, "Initial commit ✨");

    // push to remote repo
    await gitRemoteAddOrigin(repoPath, githubRepository.ssh_url);
    await gitPush(repoPath);
  }

  try {
    await exec();
  } catch (error) {
    if (!(await isPathAvailable(repoPath))) {
      await rm(repoPath, { recursive: true, force: true });
    }

    // if (githubRepositoryData) {
    //   const { owner, name } = githubRepositoryData;
    //   await deleteGithubRepository(owner.login, name);
    // }

    throw error;
  }

  return repoPath;
}
