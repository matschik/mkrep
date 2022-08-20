import redaxios from "redaxios";

const baseAPI = redaxios.create();

function api() {
  const { GITHUB_TOKEN } = process.env;

  const client = baseAPI.create({
    baseURL: "https://api.github.com",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `token ${GITHUB_TOKEN}`,
    },
  });

  return client;
}

export async function fetchGithubCurrentUser() {
  return api().get("/user");
}

export async function getGithubRepositoryInfo(user, repo) {
  return api().get(`/repos/${user}/${repo}`);
}

export async function createGithubRepository(name, isPrivate = true) {
  return api().post(`/user/repos`, { name, private: isPrivate });
}

export async function updateGithubRepository(user, repo, data) {
  return api().patch(`/repos/${user}/${repo}`, data);
}

export async function deleteGithubRepository(user, repo) {
  return api().delete(`/repos/${user}/${repo}`);
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
