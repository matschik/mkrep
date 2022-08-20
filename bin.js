#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import { join } from "node:path";
import { isPathAvailable } from "./src/lib.js";
import dotEnvFile from "./dotEnvFile.js";
import mkrep from "./src/mkrep.js";
import fileDirname from "./src/fileDirname.js";
import { readFileSync } from "fs";

dotEnvFile.init();

const program = new Command();

const version = JSON.parse(
  readFileSync(join(fileDirname(import.meta.url), "package.json"))
).version;

program
  .name("mkrep")
  .description("Fast repo creation local & remote with Github")
  .version(version);

program
  .command("create <repoName>")
  .description("Create local & remote repository with Github")
  .action(async (repoName) => {
    async function exec() {
      await getGithubPersonalToken();
      const baseDir = await getBaseDir();

      await mkrep(baseDir, repoName, {
        async onReadyToCreate(p) {
          await confirmCreateRepository(p);
        },
      });
    }

    exec().catch(console.error);
  });

program
  .command("reset")
  .description("Reset dotenv file")
  .action(async () => {
    await dotEnvFile.reset();
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
      console.error(`${baseDir} does not exist`);
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
      console.error(`${value} is not valid`);
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
