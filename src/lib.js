import {
  access,
  lstat,
  mkdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import { join, sep } from "node:path";
import fileDirname from "./fileDirname.js";
import { gitInit, gitRemoteUpdateOrigin } from "./git.js";
import { fetchGithubCurrentUser, updateGithubRepository } from "./githubAPI.js";

export async function renameGithubRepository(repoName, newRepoName) {
  const { data: user } = await fetchGithubCurrentUser();
  const { data: updatedRepository } = await updateGithubRepository(
    user.login,
    repoName,
    { name: newRepoName }
  );
  return updatedRepository;
}

export async function updateJsonFile(p, data) {
  const content = await readFile(p, "utf8");
  const json = JSON.parse(content);
  const newJson = Object.assign({}, json, data);
  await writeFile(p, JSON.stringify(newJson, null, 2));
}

export async function renameLocalRepository(path, githubRepository) {
  const pathInfo = await lstat(path);
  if (!pathInfo.isDirectory()) {
    throw new Error(`'${path}' is not a directory`);
  }

  const newPath = path
    .split(sep)
    .slice(0, -1)
    .concat([githubRepository.name])
    .join(sep);

  const pkgJsonPath = join(newPath, "package.json");

  const pkgJsonAvailable = await isPathAvailable(pkgJsonPath);

  // TODO: replace pkgjson content with github repo data

  await Promise.all([
    rename(path, newPath),
    pkgJsonAvailable ? updateJsonFile(pkgJsonPath, githubRepository) : true,
    githubRepository?.ssh_url
      ? gitRemoteUpdateOrigin(newPath, githubRepository.ssh_url)
      : true,
  ]);

  return newPath;
}

export async function createGitRepository(path) {
  await mkdir(path);
  await gitInit(path);
  return path;
}

export async function createPackageJson(basePath, data) {
  const path = join(basePath, "/package.json");
  let template = await readFile(
    `${fileDirname(import.meta.url)}/template/package.json`,
    "utf8"
  );

  for (const key of Object.keys(data)) {
    template = template.replace(`{${key}}`, data[key]);
  }

  await writeFile(path, template);
  return path;
}

export async function isPathAvailable(path) {
  try {
    await access(path);
    return false;
  } catch (error) {
    if (error.code === "ENOENT") {
      return true;
    }
    throw error;
  }
}

export async function createGitIgnore(basePath) {
  const path = join(basePath, "/.gitignore");
  const response = await fetch(
    `https://raw.githubusercontent.com/github/gitignore/main/Node.gitignore`
  );
  const content = await response.text();

  await writeFile(path, content);
  return path;
}
