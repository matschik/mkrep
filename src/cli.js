import { Command } from "commander";
import { execa } from "execa";
import inquirer from "inquirer";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import untildify from "untildify";
import config from "./config.js";
import fileDirname from "./lib/fileDirname.js";
import github from "./github.js";
import { isPathAvailable, renameLocalRepository } from "./lib.js";
import mkrep from "./mkrep.js";
import { exec } from "node:child_process";

export default function executeCLI() {
  const program = new Command();

  const version = JSON.parse(
    readFileSync(join(fileDirname(import.meta.url), "../package.json"))
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
        const githubToken = await getGithubPersonalToken();
        github.setAuthToken(githubToken);
        const baseDir = await getBaseDir();

        const repoPath = await mkrep(baseDir, repoName, {
          async onReadyToCreate(p) {
            const confirm = await confirmCreateRepository(p);
            if (!confirm) {
              throw new Error("Aborted");
            }
          },
        });
        console.info(`✨ Repo created at ${repoPath}`);

        const { confirm } = await inquirer.prompt([
          {
            type: "confirm",
            name: "confirm",
            message: `Do you want to open your new repository '${repoName}' with VSCode ?`,
          },
        ]);

        if (confirm) {
          await execa("code", [repoPath]);
        } else {
          console.info(
            `You can open your new repository via 'mkrep open my-project'`
          );
        }
      }

      exec().catch(console.error);
    });

  program
    .command("rename <repoName> <newRepoName>")
    .description("Rename repository local & remote on Github")
    .action(async (repoName, newRepoName) => {
      async function exec() {
        const baseDir = await getBaseDir();
        const repoPath = join(baseDir, repoName);
        const updatedRepository = await github.renameRepository(
          repoName,
          newRepoName
        );

        const newRepoPath = await renameLocalRepository(
          repoPath,
          updatedRepository
        );

        console.info(`✨ Repo renamed at ${newRepoPath}`);
      }

      exec().catch(console.error);
    });

  program
    .command("reset")
    .description("Reset configuration")
    .action(() => {
      config.clear();
    });

  program
    .command("open <repoName>")
    .description("Open on VSCode")
    .action(async (repoName) => {
      async function exec() {
        const baseDir = await getBaseDir();
        const p = join(baseDir, repoName);
        if (await isPathAvailable(p)) {
          console.error(`${p} not found`);
          return;
        }
        await execa("code", [p]);
      }

      exec().catch(console.error);
    });

  program.parse();
}

async function getBaseDir() {
  let baseDir = config.get("BASE_DIR");
  let baseDirIsAvailable = baseDir ? await isPathAvailable(baseDir) : false;

  while (!baseDir || !baseDirIsAvailable) {
    baseDir = await askBaseDir();
    baseDirIsAvailable = await isPathAvailable(baseDir);
    if (!baseDirIsAvailable) {
      console.error(`${baseDir} does not exist`);
    }

    if (baseDir && baseDirIsAvailable) {
      config.set("BASE_DIR", baseDir);
    }
  }

  return untildify(baseDir);
}

async function getGithubPersonalToken() {
  let value = config.get("GITHUB_TOKEN");
  let isValid = true;

  while (!value || !isValid) {
    value = (await askGithubPersonalToken()).trim();
    // TODO: check token scopes: https://github.com/orgs/community/discussions/24345#discussioncomment-3243862

    if (!value.trim()) {
      console.error(`${value} is not valid`);
    }

    if (value && isValid) {
      config.set("GITHUB_TOKEN", value);
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
