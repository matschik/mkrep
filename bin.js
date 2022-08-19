#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import { join } from "path";
import { isPathAvailable } from "./src/lib.js";
import dotEnvFile from "./dotEnvFile.js";
import mkrep from "./src/mkrep.js";

dotEnvFile.init();

const program = new Command();

program
  .name("mkrep")
  .description("Fast repo creation local & remote with Github")
  .version("0.1.0")
  .action(async (_, { args }) => {
    const [repoName] = args;
    await getGithubPersonalToken();
    const baseDir = await getBaseDir();
    const repoPath = join(baseDir, repoName);
    const confirmCreate = await confirmCreateRepository(repoPath);

    if (confirmCreate) {
      await mkrep(baseDir, repoName);
    }
  });

program.parse();

async function getBaseDir() {
  const { BASE_DIR } = process.env;

  let baseDir = BASE_DIR;
  let baseDirIsAvailable = baseDir ? await isPathAvailable(baseDir) : false;

  while (!baseDir || !baseDirIsAvailable) {
    baseDir = await askBaseDir();
    baseDirIsAvailable = await isPathAvailable(baseDir);
    if (!baseDirIsAvailable) {
      console.log(`${baseDir} does not exist`);
    }

    if (baseDir && baseDirIsAvailable) {
      dotEnvFile.set("BASE_DIR", baseDir);
    }
  }
  return baseDir;
}

async function getGithubPersonalToken() {
  const { GITHUB_TOKEN } = process.env;

  let value = GITHUB_TOKEN;
  let isValid = true;

  while (!value || !isValid) {
    value = (await askGithubPersonalToken()).trim();
    // TODO: check token scopes: https://github.com/orgs/community/discussions/24345#discussioncomment-3243862

    if (!value.trim()) {
      console.log(`${value} is not valid`);
    }

    if (value && isValid) {
      dotEnvFile.set("GITHUB_TOKEN", value);
    }
  }

  return value;
}

async function askGithubPersonalToken() {
  const { token } = await inquirer.prompt([
    {
      type: "input",
      name: "token",
      message: "Enter Github personal token to create repository",
    },
  ]);
  return token;
}

async function askBaseDir() {
  const { baseDir } = await inquirer.prompt([
    {
      type: "input",
      name: "baseDir",
      message: "Enter base directory to create repository",
    },
  ]);

  return baseDir;
}

async function confirmCreateRepository(repoPath) {
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Create '${repoPath}' ?`,
    },
  ]);
  return confirm;
}
