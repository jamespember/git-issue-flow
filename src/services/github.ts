import { GitHubIssue } from '../types/github';
import { ConfigService } from './configService';

const GITHUB_API_URL = import.meta.env.VITE_GITHUB_API_URL || 'https://api.github.com';

class GitHubService {
  private getConfig() {
    return ConfigService.load();
  }

  private get token() {
    const config = this.getConfig();
    return config.github.token || '';
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    if (!this.token) {
      throw new Error('GitHub access token not configured. Please set up your token in Settings.');
    }

    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('GitHub authentication failed. Please check your access token in Settings.');
      }
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded or insufficient permissions. Please check your token permissions.');
      }
      if (response.status === 404) {
        throw new Error('Repository not found. Please check your repository configuration in Settings.');
      }
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  }

  async searchIssues({ owner, repo, query, per_page = 30 }: {
    owner: string;
    repo: string;
    query: string;
    per_page?: number;
  }): Promise<GitHubIssue[]> {
    const config = this.getConfig();
    
    // Construct the full search query with repo scope and various exclusions
    const priorityExclusions = config.workflow.excludePrioritized 
      ? `-label:${config.labels.priority.high} -label:${config.labels.priority.medium} -label:${config.labels.priority.low}`
      : '';
    
    const groomedExclusions = config.workflow.excludeGroomed 
      ? config.labels.groomed.map(label => `-label:"${label}"`).join(' ')
      : '';
    
    const dependencyExclusions = config.workflow.excludeDependencies 
      ? config.labels.exclude.map(label => `-label:"${label}"`).join(' ')
      : '';
      
    const fullQuery = `repo:${owner}/${repo} ${query} ${priorityExclusions} ${groomedExclusions} ${dependencyExclusions}`.trim();
    
    const queryParams = new URLSearchParams({
      q: fullQuery,
      per_page: per_page.toString(),
    });

    const url = `${GITHUB_API_URL}/search/issues?${queryParams}`;
    const response = await this.fetchWithAuth(url);
    
    // GitHub search completed successfully
    
    // GitHub search API returns results in a different format
    const issues: GitHubIssue[] = response.items || [];
    
    // Only need to filter out pull requests now (GitHub search doesn't distinguish)
    return issues.filter(issue => !('pull_request' in issue));
  }

  async searchAllIssues({ owner, repo, query, per_page = 100 }: {
    owner: string;
    repo: string;
    query: string;
    per_page?: number;
  }): Promise<GitHubIssue[]> {
    // For health analysis, we want ALL issues without filtering out prioritized ones
    const fullQuery = `repo:${owner}/${repo} ${query}`;
    
    let allIssues: GitHubIssue[] = [];
    let page = 1;
    let hasMorePages = true;
    
    // Starting paginated fetch for all issues
    
    while (hasMorePages) {
      const queryParams = new URLSearchParams({
        q: fullQuery,
        per_page: per_page.toString(),
        page: page.toString(),
      });

      const url = `${GITHUB_API_URL}/search/issues?${queryParams}`;
      
      try {
        const response = await this.fetchWithAuth(url);
        
        // Fetched page with issues
        
        // GitHub search API returns results in a different format
        const pageIssues: GitHubIssue[] = response.items || [];
        
        // Only add issues, not pull requests
        const filteredIssues = pageIssues.filter(issue => !('pull_request' in issue));
        allIssues = [...allIssues, ...filteredIssues];
        
        // Check if we have more pages
        hasMorePages = pageIssues.length === per_page && allIssues.length < response.total_count;
        
        if (hasMorePages) {
          page++;
          // Add a small delay to be nice to GitHub's API
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Safety check: don't fetch more than 1000 issues to avoid hitting rate limits
        if (allIssues.length >= 1000) {
          // Reached issue limit, stopping pagination
          hasMorePages = false;
        }
        
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        hasMorePages = false;
      }
    }
    
    // Pagination completed
    return allIssues;
  }

  async fetchIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/issues/${issueNumber}`;
    return this.fetchWithAuth(url);
  }

  async fetchLabels(owner: string, repo: string): Promise<{ id: number; name: string; color: string; }[]> {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/labels?per_page=100`;
    return this.fetchWithAuth(url);
  }

  async updateIssue({ owner, repo, issueNumber, title, body, labels }: {
    owner: string;
    repo: string;
    issueNumber: number;
    title?: string;
    body?: string;
    labels?: string[];
  }): Promise<GitHubIssue> {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/issues/${issueNumber}`;
    const patchBody: { title?: string; body?: string; labels?: string[] } = {};
    if (title !== undefined) patchBody.title = title;
    if (body !== undefined) patchBody.body = body;
    if (labels !== undefined) patchBody.labels = labels;
    return this.fetchWithAuth(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchBody),
    });
  }

  async closeIssueAsNotPlanned({ owner, repo, issueNumber }: {
    owner: string;
    repo: string;
    issueNumber: number;
  }): Promise<GitHubIssue> {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/issues/${issueNumber}`;
    const patchBody = {
      state: 'closed',
      state_reason: 'not_planned'
    };
    return this.fetchWithAuth(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchBody),
    });
  }

  async testConnection(owner: string, repo: string, token?: string): Promise<{ success: boolean; error?: string; user?: string }> {
    try {
      // Use provided token or current config token
      const testToken = token || this.token;
      if (!testToken) {
        throw new Error('No GitHub token provided');
      }

      // Test with a simple API call to get repository info
      const headers = {
        'Authorization': `Bearer ${testToken}`,
        'Accept': 'application/vnd.github.v3+json',
      };

      const repoResponse = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}`, { headers });
      
      if (!repoResponse.ok) {
        if (repoResponse.status === 401) {
          throw new Error('Invalid token or insufficient permissions');
        }
        if (repoResponse.status === 404) {
          throw new Error('Repository not found or no access');
        }
        throw new Error(`API error: ${repoResponse.statusText}`);
      }

      // Also get user info to show who the token belongs to
      const userResponse = await fetch(`${GITHUB_API_URL}/user`, { headers });
      const userData = userResponse.ok ? await userResponse.json() : null;

      return { 
        success: true, 
        user: userData?.login || 'Unknown user'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }
}

export const githubService = new GitHubService(); 