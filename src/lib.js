import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import fileDirname from "./fileDirname.js";
import { gitInit } from "./git.js";

export async function createLocalRepo(path) {
  await mkdir(path);
  await gitInit(path);
  return path;
}

export async function createPackageJson(basePath, name = "new-js-project") {
  const path = join(basePath, "/package.json");
  const template = await readFile(
    `${fileDirname(import.meta.url)}/template/package.json`,
    "utf8"
  );
  await writeFile(path, template.replace("{name}", name));
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

async function assignRemoteRepoToLocalRepo() {}

async function createRepo(codePath, name) {
  await mkdir(join(codePath, name));

  // https://raw.githubusercontent.com/github/gitignore/main/Node.gitignore
}
