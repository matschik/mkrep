import redaxios from "redaxios";

const { GITHUB_TOKEN } = process.env;

const api = redaxios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
    Authorization: `token ${GITHUB_TOKEN}`,
  },
});

export async function fetchGithubCurrentUser() {
  return api.get("/user");
}

export async function getGithubRepositoryInfo(user, repo) {
  return api.get(`/repos/${user}/${repo}`);
}

export async function createGithubRepository(name, isPrivate = true) {
  return api.post(`/user/repos`, { name, private: isPrivate });
}

export async function isGithubRepositoryAvailable(name) {
  const {
    data: { login },
  } = await fetchGithubCurrentUser();
  try {
    await getGithubRepositoryInfo(login, name);
    return false;
  } catch (error) {
    if (error.status === 404) {
      return true;
    }
    throw error;
  }
}
