import redaxios from "redaxios";

export default class GithubAPI {
  constructor(token) {
    this.client = redaxios.create({
      baseURL: "https://api.github.com",
      headers: {
        Accept: "application/vnd.github+json",
      },
    });

    if (token) {
      this.setAuthToken(token);
    }
  }

  setAuthToken(token) {
    this.client.defaults.headers.Authorization = `token ${token}`;
  }

  async fetchCurrentUser() {
    return this.client.get("/user");
  }

  async fetchRepositoryInfo(user, repo) {
    return this.client.get(`/repos/${user}/${repo}`);
  }

  async createRepository(name, isPrivate = true) {
    return this.client.post(`/user/repos`, { name, private: isPrivate });
  }

  async updateRepository(user, repo, data) {
    return this.client.patch(`/repos/${user}/${repo}`, data);
  }

  async deleteRepository(user, repo) {
    return this.client.delete(`/repos/${user}/${repo}`);
  }

  async renameRepository(repoName, newRepoName) {
    const { data: user } = await this.fetchCurrentUser();
    const { data: updatedRepository } = await this.updateRepository(
      user.login,
      repoName,
      { name: newRepoName }
    );
    return updatedRepository;
  }

  async isRepositoryAvailable(name) {
    const {
      data: { login },
    } = await this.fetchCurrentUser();
    try {
      await this.fetchRepositoryInfo(login, name);
      return false;
    } catch (error) {
      if (error.status === 404) {
        return true;
      }
      throw error;
    }
  }
}
