# API Reference

This document provides detailed information about the services and APIs used in Git Issue Flow.

## Table of Contents

- [GitHub Service](#github-service)
- [Slack API Service](#slack-api-service)
- [Configuration Service](#configuration-service)
- [AI Service](#ai-service)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## GitHub Service

The `GitHubService` class handles all interactions with the GitHub API.

### Methods

#### `searchIssues(params)`

Searches for issues using GitHub's search API with automatic filtering.

**Parameters:**
- `owner` (string): Repository owner
- `repo` (string): Repository name
- `query` (string): GitHub search query
- `per_page` (number, optional): Results per page (default: 30)

**Returns:** `Promise<GitHubIssue[]>`

**Query Processing:**
The method automatically adds exclusions based on user configuration:
- Priority labels (if `excludePrioritized` is enabled)
- Groomed labels (if `excludeGroomed` is enabled)
- Dependency labels (if `excludeDependencies` is enabled)

**Example:**
```typescript
const issues = await githubService.searchIssues({
  owner: 'facebook',
  repo: 'react',
  query: 'is:open is:issue label:bug',
  per_page: 50
});
```

#### `searchAllIssues(params)`

Fetches all issues for analytics without filtering, with automatic pagination.

**Parameters:**
- `owner` (string): Repository owner
- `repo` (string): Repository name  
- `query` (string): GitHub search query
- `per_page` (number, optional): Results per page (default: 100)

**Returns:** `Promise<GitHubIssue[]>`

**Notes:**
- Automatically handles pagination
- Includes rate limiting delays (100ms between requests)
- Stops at 1000 issues to prevent rate limit issues
- Used by backlog health analysis

#### `fetchIssue(owner, repo, issueNumber)`

Fetches a single issue by number.

**Parameters:**
- `owner` (string): Repository owner
- `repo` (string): Repository name
- `issueNumber` (number): Issue number

**Returns:** `Promise<GitHubIssue>`

**Used for:**
- Refreshing issue data
- Getting latest state before updates

#### `fetchLabels(owner, repo)`

Fetches all repository labels for configuration.

**Parameters:**
- `owner` (string): Repository owner
- `repo` (string): Repository name

**Returns:** `Promise<GitHubLabel[]>`

**Response format:**
```typescript
interface GitHubLabel {
  id: number;
  name: string;
  color: string;
}
```

#### `updateIssue(params)`

Updates an issue's title, body, or labels.

**Parameters:**
- `owner` (string): Repository owner
- `repo` (string): Repository name
- `issueNumber` (number): Issue number
- `title` (string, optional): New title
- `body` (string, optional): New description
- `labels` (string[], optional): Label names array

**Returns:** `Promise<GitHubIssue>`

**Notes:**
- Only provided fields are updated
- Labels completely replace existing labels
- Used for priority setting and content updates

#### `closeIssueAsNotPlanned(params)`

Closes an issue with "not planned" state.

**Parameters:**
- `owner` (string): Repository owner
- `repo` (string): Repository name
- `issueNumber` (number): Issue number

**Returns:** `Promise<GitHubIssue>`

**GitHub API details:**
- Sets `state: 'closed'`
- Sets `state_reason: 'not_planned'`

#### `testConnection(owner, repo, token?)`

Tests GitHub API connectivity and permissions.

**Parameters:**
- `owner` (string): Repository owner
- `repo` (string): Repository name
- `token` (string, optional): Token to test (uses config if not provided)

**Returns:** `Promise<ConnectionResult>`

**Response format:**
```typescript
interface ConnectionResult {
  success: boolean;
  error?: string;
  user?: string; // GitHub username
}
```

### Authentication

All methods use Bearer token authentication:
```
Authorization: Bearer ghp_xxxxxxxxxxxx
```

Tokens are loaded from user configuration via `ConfigService`.

### Error Handling

The service provides detailed error messages for common scenarios:

- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: Rate limit exceeded or insufficient permissions  
- **404 Not Found**: Repository not found or no access
- **Other errors**: Generic GitHub API error with status

## Slack API Service

The `SlackApiService` class handles Slack integration through a proxy server.

### Methods

#### `getThreadPreview(url)`

Fetches a complete Slack thread from a URL.

**Parameters:**
- `url` (string): Slack thread URL

**Returns:** `Promise<SlackThread | null>`

**Supported URL formats:**
```
https://workspace.slack.com/archives/CHANNEL_ID/pTIMESTAMP
```

**Response format:**
```typescript
interface SlackThread {
  messages: SlackMessage[];
  channel: string;
  thread_ts: string;
  participant_count: number;
  reply_count: number;
  channel_name?: string;
}
```

#### `getChannelInfo(channelId)`

Gets basic channel information.

**Parameters:**
- `channelId` (string): Slack channel ID

**Returns:** `Promise<ChannelInfo | null>`

**Response format:**
```typescript
interface ChannelInfo {
  name: string;
  topic?: string;
}
```

#### `formatMessageText(text)`

Converts Slack markup to readable text.

**Parameters:**
- `text` (string): Raw Slack message text

**Returns:** `string`

**Conversions:**
- `<@USER_ID>` → `@user`
- `<#CHANNEL_ID|name>` → `#name`
- `<URL|text>` → `text`
- `*bold*` → `**bold**`
- `_italic_` → `*italic*`

#### `testConnection(token?)`

Tests Slack API connectivity.

**Parameters:**
- `token` (string, optional): Bot token to test

**Returns:** `Promise<SlackConnectionResult>`

**Response format:**
```typescript
interface SlackConnectionResult {
  success: boolean;
  error?: string;
  info?: {
    teamName: string;
    botName: string;
  };
}
```

### Proxy Architecture

All Slack API calls go through a local proxy server at `http://localhost:3001`.

**Proxy endpoints:**
- `POST /api/slack-proxy` - General Slack API proxy
- `POST /api/slack-proxy/image` - Image proxy for files

**Request format:**
```typescript
{
  endpoint: string; // Slack API endpoint (e.g., 'conversations.replies')
  token: string;    // Bot token
  body: object;     // Request parameters
}
```

### Error Handling

Common error scenarios:
- **Proxy not running**: Connection refused to localhost:3001
- **Invalid token**: Slack returns `invalid_auth`
- **Channel access**: Bot not invited to channel
- **Rate limiting**: Slack API limits exceeded

## Configuration Service

The `ConfigService` class manages user settings in localStorage.

### Methods

#### `load()`

Loads configuration with defaults and migration.

**Returns:** `UserConfig`

**Features:**
- Merges with defaults for missing properties
- Handles legacy configuration formats
- Never throws - returns defaults on error

#### `save(config)`

Saves configuration to localStorage.

**Parameters:**
- `config` (UserConfig): Complete configuration object

**Storage format:**
```json
{
  "version": "1.0",
  "data": { /* UserConfig */ },
  "lastModified": "2024-01-01T00:00:00.000Z"
}
```

#### `validate(config, requireLabels?)`

Validates configuration completeness.

**Parameters:**
- `config` (Partial<UserConfig>): Configuration to validate
- `requireLabels` (boolean, optional): Whether priority labels are required

**Returns:** `ValidationResult`

**Validation checks:**
- GitHub owner, repo, and token presence
- Token format validation (`ghp_` or `github_pat_` prefix)
- Priority label completeness (if required)

#### `isConfigured()`

Checks if minimum configuration is present.

**Returns:** `boolean`

**Requirements:**
- GitHub owner, repo, and token must all be present

#### `export()`

Exports configuration with sensitive data redacted.

**Returns:** `string` (JSON)

**Redacted fields:**
- `github.token` → `[REDACTED]`
- `slack.botToken` → `[REDACTED]`  
- `openai.apiKey` → `[REDACTED]`

#### `import(jsonString)`

Imports configuration from JSON.

**Parameters:**
- `jsonString` (string): Exported configuration JSON

**Returns:** `ImportResult`

**Features:**
- Preserves existing sensitive data if redacted
- Merges with defaults
- Validates before saving

### Configuration Structure

```typescript
interface UserConfig {
  github: {
    owner: string;
    repo: string;
    token: string;
  };
  labels: {
    priority: {
      high: string;
      medium: string;
      low: string;
    };
    groomed: string[];
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
    excludeGroomed: boolean;
    defaultBatchSize: number;
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    compactMode: boolean;
  };
}
```

## AI Service

The `aiService` handles OpenAI integration for thread summaries and issue formatting.

### Methods

#### `summarizeSlackThread(thread)`

Generates AI summary of Slack thread.

**Parameters:**
- `thread` (SlackThread): Thread data from Slack API

**Returns:** `Promise<string>`

**Features:**
- Focuses on key decisions and action items
- Handles long threads efficiently
- Includes context about participants

#### `formatIssueDescription(description)`

Improves issue formatting with AI.

**Parameters:**
- `description` (string): Raw issue description

**Returns:** `Promise<string>`

**Improvements:**
- Better markdown formatting
- Clearer structure
- Action items extraction

## Error Handling

### Common Error Patterns

**Network Errors:**
```typescript
try {
  const result = await service.method();
} catch (error) {
  if (error instanceof Error) {
    console.error('Service error:', error.message);
  }
}
```

**Service-Specific Errors:**

**GitHub Service:**
- Authentication errors (401)
- Permission errors (403) 
- Rate limiting (403 with specific message)
- Repository not found (404)

**Slack Service:**
- Proxy not running (connection error)
- Invalid token (`invalid_auth`)
- Channel access (`channel_not_found`)

**Configuration Service:**
- Storage errors (quota exceeded)
- Validation errors (missing required fields)

### Error Recovery Strategies

**Automatic Retry:**
- GitHub API calls include automatic retry for rate limits
- Slack proxy handles transient network errors

**Graceful Degradation:**
- Configuration loads defaults on error
- Slack features disable if proxy unavailable
- AI features optional if OpenAI not configured

**User Feedback:**
- Connection test methods provide detailed error messages
- Validation errors list specific missing fields
- Service errors include actionable guidance

## Rate Limiting

### GitHub API

**Limits:**
- 5000 requests/hour for authenticated requests
- Search API: 30 requests/minute

**Handling:**
- Service includes 100ms delays between paginated requests
- Automatic retry with exponential backoff for 403 responses
- Search limited to 1000 issues maximum per request

### Slack API

**Limits:**
- Tier 3: 100+ requests/minute
- Varies by workspace and endpoint

**Handling:**
- Proxy server handles rate limit headers
- Automatic retry with proper delays
- User guidance to avoid rapid interactions

### Best Practices

1. **Batch Operations**: Use pagination efficiently
2. **Caching**: Store frequently accessed data locally
3. **User Guidance**: Educate users about API limits
4. **Monitoring**: Log rate limit approaches
5. **Fallbacks**: Graceful degradation when limits hit