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

export async function updatePackageJson(pkgJsonPath, data) {
  const content = await readFile(pkgJsonPath, "utf8");
  const pkgJson = JSON.parse(content);
  const newPkgJson = Object.assign({}, pkgJson, data);
  await writeFile(pkgJsonPath, JSON.stringify(newPkgJson, null, 2));
}

export async function renameLocalRepository(path, newName, sshURL) {
  const pathInfo = await lstat(path);
  if (!pathInfo.isDirectory()) {
    throw new Error(`'${path}' is not a directory`);
  }

  const newPath = path.split(sep).slice(0, -1).concat([newName]).join(sep);

  const pkgJsonPath = join(newPath, "package.json");

  const pkgJsonAvailable = await isPathAvailable(pkgJsonPath);

  await Promise.all([
    rename(path, newPath),
    pkgJsonAvailable
      ? updatePackageJson(pkgJsonPath, {
          name: newName,
        })
      : true,
    sshURL ? gitRemoteUpdateOrigin(newPath, sshURL) : true,
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

async function assignRemoteRepoToLocalRepo() {}

async function createRepo(codePath, name) {
  await mkdir(join(codePath, name));

  // https://raw.githubusercontent.com/github/gitignore/main/Node.gitignore
}
