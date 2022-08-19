import { execa } from "execa";

export async function gitInit(execPath) {
  await execa("git", ["init"], { cwd: execPath });
}

export async function gitRemoteAddOrigin(execPath, url) {
  await execa("git", ["remote", "add", "origin", url], {
    cwd: execPath,
  });
}

export async function gitAddAll(execPath) {
  await execa("git", ["add", "."], { cwd: execPath });
}

export async function gitCommit(execPath, message) {
  await execa("git", ["commit", "-m", message], { cwd: execPath });
}

export async function gitPush(execPath) {
  await execa("git", ["push", "-u", "origin", "main"], { cwd: execPath });
}
