/**
 * User configuration interface for open-source GitIssueFlow
 * All settings are stored locally in browser localStorage
 */

export interface UserConfig {
  github: {
    owner: string;
    repo: string;
    token: string; // Personal Access Token
  };
  labels: {
    priority: {
      high: string;
      medium: string;
      low: string;
    };
    groomed: string[]; // Array of labels that indicate an issue has been groomed (OR logic)
    exclude: string[];
  };
  slack?: {
    botToken?: string;
    workspaceUrl?: string;
  };
  openai?: {
    apiKey?: string;
  };
  workflow: {
    excludePrioritized: boolean;
    excludeDependencies: boolean;
    excludeGroomed: boolean; // Exclude issues with any groomed labels
    defaultBatchSize: number;
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    compactMode: boolean;
  };
}

export const DEFAULT_CONFIG: UserConfig = {
  github: {
    owner: '',
    repo: '',
    token: ''
  },
  labels: {
    priority: {
      high: 'prio-high',
      medium: 'prio-medium', 
      low: 'prio-low'
    },
    groomed: ['prio-high', 'prio-medium', 'prio-low'], // Default: any priority label means groomed
    exclude: ['dependencies']
  },
  workflow: {
    excludePrioritized: false, // Turn off since we're using groomed labels instead
    excludeDependencies: true,
    excludeGroomed: true, // By default, exclude groomed issues from search
    defaultBatchSize: 30
  },
  ui: {
    theme: 'system',
    compactMode: false
  }
};

export const EXAMPLE_CONFIGS = {
  'Personal Project': {
    github: { owner: 'yourusername', repo: 'your-project', token: 'ghp_...' },
    labels: {
      priority: { high: 'urgent', medium: 'important', low: 'nice-to-have' },
      groomed: ['reviewed'],
      exclude: ['wontfix', 'duplicate']
    }
  },
  'Enterprise Team': {
    github: { owner: 'company', repo: 'product', token: 'ghp_...' },
    labels: {
      priority: { high: 'P0', medium: 'P1', low: 'P2' },
      groomed: ['triaged'],
      exclude: ['external-dependency', 'blocked']
    }
  },
  'Open Source Contribution': {
    github: { owner: 'facebook', repo: 'react', token: 'ghp_...' },
    labels: {
      priority: { high: 'high priority', medium: 'medium priority', low: 'low priority' },
      groomed: ['confirmed'],
      exclude: ['good first issue', 'help wanted']
    }
  }
};