import {
  access,
  lstat,
  mkdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import { join, sep } from "node:path";
import { GITIGNORE_TEMPLATE_URL } from "./constants.js";
import fileDirname from "./lib/fileDirname.js";
import { gitInit, gitRemoteUpdateOrigin } from "./lib/git.js";
import sortPackageJson from "sort-package-json";

async function applyGithubRepositoryDataToPkgJson(
  pkgJsonPath,
  githubRepository
) {
  const { name, description, html_url, full_name, issues_url } =
    githubRepository;
  await updateJsonFile(pkgJsonPath, {
    name,
    description: description || "",
    homepage: html_url || "",
    repository: `github:${full_name}`,
    bugs: {
      url: issues_url,
    },
  });

  const content = await readFile(pkgJsonPath, "utf8");
  await writeFile(pkgJsonPath, sortPackageJson(content), "utf8");
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

  await Promise.all([
    rename(path, newPath),
    pkgJsonAvailable
      ? applyGithubRepositoryDataToPkgJson(pkgJsonPath, githubRepository)
      : true,
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

export async function createPackageJson(basePath, githubRepository) {
  const path = join(basePath, "/package.json");
  const template = await readFile(
    `${fileDirname(import.meta.url)}/template/package.json`,
    "utf8"
  );

  await writeFile(path, template);

  await applyGithubRepositoryDataToPkgJson(path, githubRepository);

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
  const response = await fetch(GITIGNORE_TEMPLATE_URL);
  const content = await response.text();

  await writeFile(path, content);
  return path;
}
