import type { GitHubProfile, GitHubRepo } from './types';

export type GitHubResult = {
  profile: GitHubProfile | null;
  repos: GitHubRepo[];
  rateLimited: boolean;
  error?: string;
};

const GITHUB_HEADERS = {
  Accept: 'application/vnd.github+json'
};

export async function fetchGitHubProfile(username: string): Promise<GitHubResult> {
  try {
    const profileRes = await fetch(`https://api.github.com/users/${username}`, {
      headers: GITHUB_HEADERS
    });

    if (profileRes.status === 403) {
      const body = await profileRes.json().catch(() => ({}));
      return { profile: null, repos: [], rateLimited: true, error: body?.message };
    }

    if (!profileRes.ok) {
      return { profile: null, repos: [], rateLimited: false, error: 'Profile not found.' };
    }

    const profile = (await profileRes.json()) as GitHubProfile;

    const repoRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=50&sort=updated`,
      { headers: GITHUB_HEADERS }
    );

    let repos: GitHubRepo[] = [];
    let rateLimited = false;

    if (repoRes.status === 403) {
      rateLimited = true;
    } else if (repoRes.ok) {
      repos = (await repoRes.json()) as GitHubRepo[];
    }

    return { profile, repos, rateLimited };
  } catch (error) {
    return {
      profile: null,
      repos: [],
      rateLimited: false,
      error: error instanceof Error ? error.message : 'Network error.'
    };
  }
}
