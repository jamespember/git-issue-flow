export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  url: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user: GitHubUser;
  labels: GitHubLabel[];
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  comments: number;
  html_url: string;
}

export interface GitHubIssueResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubIssue[];
}

export interface FetchIssuesParams {
  owner: string;
  repo: string;
  state?: 'open' | 'closed' | 'all';
  sort?: 'created' | 'updated' | 'comments';
  direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
} 