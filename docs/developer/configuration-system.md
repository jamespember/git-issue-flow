# Configuration System

This document explains how Git Issue Flow's configuration system works, including user settings, validation, persistence, and extensibility.

## Table of Contents

- [Overview](#overview)
- [Configuration Schema](#configuration-schema)
- [ConfigService API](#configservice-api)
- [Storage and Persistence](#storage-and-persistence)
- [Validation System](#validation-system)
- [Migration and Versioning](#migration-and-versioning)
- [Usage Patterns](#usage-patterns)
- [Extending Configuration](#extending-configuration)

## Overview

Git Issue Flow uses a client-side configuration system that stores all user settings in browser localStorage. This approach provides:

- **Zero server dependency** - Works completely offline
- **Per-browser configuration** - Settings isolated per browser/device
- **Import/export capability** - Easy backup and sharing
- **Type safety** - Full TypeScript support
- **Validation** - Comprehensive input validation
- **Migration support** - Handles configuration updates

### Architecture

```
User Interface (Settings.tsx)
           ↓
    ConfigService API
           ↓
  localStorage (browser)
```

## Configuration Schema

### UserConfig Interface

```typescript
interface UserConfig {
  github: {
    owner: string;          // Repository owner
    repo: string;           // Repository name
    token: string;          // Personal Access Token
  };
  labels: {
    priority: {
      high: string;         // High priority label name
      medium: string;       // Medium priority label name
      low: string;          // Low priority label name
    };
    groomed: string[];      // Labels indicating groomed issues
    exclude: string[];      // Labels to exclude from grooming
  };
  slack?: {
    botToken?: string;      // Slack bot token (optional)
    workspaceUrl?: string;  // Workspace URL for reference
  };
  openai?: {
    apiKey?: string;        // OpenAI API key (optional)
  };
  workflow: {
    excludePrioritized: boolean;    // Exclude already prioritized issues
    excludeDependencies: boolean;   // Exclude dependency issues
    excludeGroomed: boolean;        // Exclude groomed issues
    defaultBatchSize: number;       // Default search result size
  };
  ui: {
    theme: 'light' | 'dark' | 'system';  // UI theme preference
    compactMode: boolean;                 // Compact UI layout
  };
}
```

### Default Configuration

```typescript
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
    groomed: ['prio-high', 'prio-medium', 'prio-low'],
    exclude: ['dependencies']
  },
  workflow: {
    excludePrioritized: false,
    excludeDependencies: true,
    excludeGroomed: true,
    defaultBatchSize: 30
  },
  ui: {
    theme: 'system',
    compactMode: false
  }
};
```

### Example Configurations

The system includes pre-built configuration examples for different team types:

```typescript
export const EXAMPLE_CONFIGS = {
  'Personal Project': {
    labels: {
      priority: { high: 'urgent', medium: 'important', low: 'nice-to-have' },
      groomed: ['reviewed'],
      exclude: ['wontfix', 'duplicate']
    }
  },
  'Enterprise Team': {
    labels: {
      priority: { high: 'P0', medium: 'P1', low: 'P2' },
      groomed: ['triaged'],
      exclude: ['external-dependency', 'blocked']
    }
  }
};
```

## ConfigService API

### Core Methods

#### `load(): UserConfig`

Loads configuration from localStorage with fallback to defaults.

```typescript
const config = ConfigService.load();
console.log(config.github.owner); // Returns value or empty string
```

**Features:**
- Never throws errors (returns defaults on failure)
- Automatically merges with defaults for missing properties
- Handles legacy configuration formats
- Applies migrations automatically

#### `save(config: UserConfig): void`

Saves complete configuration to localStorage.

```typescript
const config = ConfigService.load();
config.github.owner = 'facebook';
config.github.repo = 'react';
ConfigService.save(config);
```

**Storage format:**
```json
{
  "version": "1.0",
  "data": { /* UserConfig object */ },
  "lastModified": "2024-01-01T00:00:00.000Z"
}
```

#### `validate(config: Partial<UserConfig>, requireLabels?: boolean): ValidationResult`

Validates configuration completeness and correctness.

```typescript
const result = ConfigService.validate(config, true);
if (!result.isValid) {
  console.log('Errors:', result.errors);
}
```

**Validation rules:**
- GitHub owner, repo, and token are required
- Token format validation (must start with `ghp_` or `github_pat_`)
- Priority labels required if `requireLabels` is true
- Arrays must be valid (not null/undefined)

#### `isConfigured(): boolean`

Quick check if minimum configuration is present.

```typescript
if (ConfigService.isConfigured()) {
  // Ready to use GitHub API
} else {
  // Redirect to settings
}
```

**Requirements:**
- GitHub owner present and non-empty
- GitHub repo present and non-empty  
- GitHub token present and non-empty

### Import/Export Methods

#### `export(): string`

Exports configuration as JSON with sensitive data redacted.

```typescript
const jsonConfig = ConfigService.export();
// Download or share this JSON safely
```

**Redacted fields:**
- `github.token` → `[REDACTED]`
- `slack.botToken` → `[REDACTED]`
- `openai.apiKey` → `[REDACTED]`

#### `import(jsonString: string): ImportResult`

Imports configuration from JSON string.

```typescript
const result = ConfigService.import(jsonString);
if (result.success) {
  console.log('Configuration imported successfully');
} else {
  console.error('Import failed:', result.error);
}
```

**Features:**
- Preserves existing sensitive data if redacted in import
- Validates imported data before saving
- Merges with defaults for missing properties
- Returns detailed error messages

### Utility Methods

#### `reset(): void`

Resets configuration to defaults by clearing localStorage.

```typescript
ConfigService.reset();
// All settings return to default values
```

## Storage and Persistence

### localStorage Implementation

**Storage key:** `git-issue-flow-config`

**Storage format:**
```json
{
  "version": "1.0",
  "data": {
    "github": { /* config */ },
    "labels": { /* config */ },
    /* ... rest of UserConfig */
  },
  "lastModified": "2024-01-15T10:30:00.000Z"
}
```

### Browser Compatibility

The configuration system works in all modern browsers that support:
- localStorage API
- JSON.parse/stringify
- ES6+ JavaScript features

### Storage Limitations

**Quota limits:**
- localStorage typically limited to 5-10MB per origin
- Configuration uses <1KB in practice
- No automatic cleanup needed

**Cross-browser considerations:**
- Settings don't sync between browsers
- Private/incognito mode may not persist
- Some browsers allow users to disable localStorage

### Error Handling

**Storage failures:**
```typescript
try {
  ConfigService.save(config);
} catch (error) {
  // Handle quota exceeded, disabled storage, etc.
  console.error('Failed to save configuration:', error);
}
```

**Common failure scenarios:**
- Storage quota exceeded
- localStorage disabled by user/admin
- Private browsing mode restrictions
- Browser data cleared

## Validation System

### Validation Rules

#### GitHub Configuration

```typescript
// Required fields
if (!config.github?.owner?.trim()) {
  errors.push('GitHub repository owner is required');
}

// Token format validation
if (!config.github.token.startsWith('ghp_') && 
    !config.github.token.startsWith('github_pat_')) {
  errors.push('GitHub token appears to be invalid format');
}
```

#### Label Configuration

```typescript
// Priority label validation (optional)
if (requireLabels) {
  if (!config.labels?.priority?.high?.trim()) {
    errors.push('High priority label is required');
  }
}

// Array validation
if (!Array.isArray(config.labels?.groomed)) {
  // Auto-fix or error
}
```

### Custom Validation

For new configuration fields, add validation to the `validate` method:

```typescript
// New field validation
if (config.newFeature?.enabled && !config.newFeature?.apiKey) {
  errors.push('API key required when new feature is enabled');
}
```

### Validation Result

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

## Migration and Versioning

### Version Management

**Current version:** `"1.0"`

**Version checking:**
```typescript
const stored = JSON.parse(localStorage.getItem(CONFIG_KEY));
if (!stored.version) {
  // Handle legacy configuration
}
```

### Migration Examples

#### Legacy String to Array Migration

```typescript
// Migrate single groomed label to array format
if (config.labels?.groomed && typeof config.labels.groomed === 'string') {
  config.labels.groomed = [config.labels.groomed as string];
}
```

#### Adding New Properties

```typescript
// Ensure new workflow properties exist
if (typeof config.workflow?.excludeGroomed === 'undefined') {
  config.workflow.excludeGroomed = DEFAULT_CONFIG.workflow.excludeGroomed;
}
```

### Future Migration Strategy

When adding breaking changes:

1. **Increment version** in `CONFIG_VERSION`
2. **Add migration logic** in `migrateConfig()`
3. **Test with old configurations**
4. **Document changes** in migration notes

```typescript
private static migrateConfig(config: UserConfig): UserConfig {
  // v1.0 → v1.1 migration
  if (needsV1_1Migration(config)) {
    config = migrateToV1_1(config);
  }
  
  // v1.1 → v2.0 migration
  if (needsV2_0Migration(config)) {
    config = migrateToV2_0(config);
  }
  
  return config;
}
```

## Usage Patterns

### Service Integration

Services access configuration through ConfigService:

```typescript
class GitHubService {
  private getConfig() {
    return ConfigService.load();
  }
  
  private get token() {
    const config = this.getConfig();
    return config.github.token || '';
  }
  
  async searchIssues(params) {
    const config = this.getConfig();
    const { owner, repo } = config.github;
    // Use configuration in API calls
  }
}
```

### Component Integration

Components typically load configuration once and use it:

```typescript
const Settings: React.FC = () => {
  const [config, setConfig] = useState<UserConfig>(ConfigService.load());
  
  const handleSave = () => {
    ConfigService.save(config);
    // Configuration now available to all services
  };
};
```

### Store Integration

The Zustand store accesses configuration for search queries:

```typescript
searchAndLoadIssues: async (query: string) => {
  const config = ConfigService.load();
  
  if (!ConfigService.isConfigured()) {
    set({ fetchStatus: 'error' });
    return;
  }
  
  const { owner, repo } = config.github;
  const response = await githubService.searchIssues({ 
    owner, 
    repo, 
    query,
    per_page: config.workflow.defaultBatchSize 
  });
}
```

## Extending Configuration

### Adding New Sections

1. **Update UserConfig interface:**
```typescript
interface UserConfig {
  // Existing sections...
  
  newFeature?: {
    enabled: boolean;
    apiKey?: string;
    options: string[];
  };
}
```

2. **Update DEFAULT_CONFIG:**
```typescript
export const DEFAULT_CONFIG: UserConfig = {
  // Existing defaults...
  
  newFeature: {
    enabled: false,
    options: []
  }
};
```

3. **Add validation rules:**
```typescript
// In ConfigService.validate()
if (config.newFeature?.enabled && !config.newFeature?.apiKey) {
  errors.push('New feature API key is required when enabled');
}
```

4. **Handle in UI:**
```typescript
// In Settings component
const handleNewFeatureToggle = (enabled: boolean) => {
  setConfig(prev => ({
    ...prev,
    newFeature: {
      ...prev.newFeature,
      enabled
    }
  }));
};
```

### Configuration Hooks

For complex configuration logic, create custom hooks:

```typescript
export const useGitHubConfig = () => {
  const config = ConfigService.load();
  
  return {
    isConfigured: ConfigService.isConfigured(),
    owner: config.github.owner,
    repo: config.github.repo,
    repoUrl: `https://github.com/${config.github.owner}/${config.github.repo}`
  };
};
```

### Environment Override

For development/testing, allow environment variable overrides:

```typescript
private static load(): UserConfig {
  const stored = /* load from localStorage */;
  
  // Override with environment variables in development
  if (import.meta.env.DEV) {
    if (import.meta.env.VITE_GITHUB_TOKEN) {
      stored.github.token = import.meta.env.VITE_GITHUB_TOKEN;
    }
  }
  
  return stored;
}
```

This configuration system provides a robust foundation for managing user settings while remaining simple and extensible.