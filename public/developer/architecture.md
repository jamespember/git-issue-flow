# Architecture Guide

This document provides a detailed overview of Git Issue Flow's architecture, component relationships, state management, and data flow patterns.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [State Management](#state-management)
- [Service Layer](#service-layer)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Integration Points](#integration-points)
- [Performance Considerations](#performance-considerations)

## Overview

Git Issue Flow is a single-page React application designed for efficient GitHub issue management. The architecture prioritizes:

- **Client-side rendering** with no backend dependencies
- **Local state persistence** using browser localStorage
- **Direct API integration** with GitHub and Slack services
- **Keyboard-driven UX** for power user productivity
- **Responsive design** for desktop and mobile use

### Core Principles

1. **Zero Configuration Backend**: All data stored locally or fetched from APIs
2. **Offline-First Settings**: Configuration persists without server dependency
3. **Progressive Enhancement**: Core features work without optional integrations
4. **Keyboard Accessibility**: Every action has keyboard shortcuts
5. **Component Isolation**: Features are self-contained and testable

## Technology Stack

### Core Framework
- **React 18** - Component framework with hooks and suspense
- **TypeScript** - Type safety and developer experience
- **Vite** - Build tool and development server

### State Management
- **Zustand** - Lightweight state management with persistence
- **localStorage** - Client-side configuration persistence

### UI & Styling
- **Tailwind CSS** - Utility-first styling framework
- **Framer Motion** - Animation and transitions
- **Lucide React** - Icon library
- **React Select** - Advanced select components

### Markdown & Content
- **React Markdown** - Markdown rendering with GitHub Flavored Markdown
- **remark-gfm** - GitHub Flavored Markdown plugin

### External APIs
- **GitHub REST API v3** - Issue management and repository data
- **Slack Web API** - Thread previews and channel information
- **OpenAI API** - AI-powered summaries and formatting

## Project Structure

```
src/
├── components/           # React components
│   ├── BacklogHealth.tsx    # Analytics dashboard
│   ├── CommandK.tsx         # Search interface
│   ├── IssueViewer.tsx      # Main issue display
│   ├── Settings.tsx         # Configuration interface
│   └── ...
├── services/            # External API integrations
│   ├── github.ts           # GitHub API client
│   ├── slackApi.ts         # Slack API client
│   ├── aiService.ts        # OpenAI integration
│   └── configService.ts    # Configuration management
├── store/               # State management
│   └── appStore.ts         # Zustand store with persistence
├── types/               # TypeScript type definitions
│   └── github.ts           # GitHub API types
├── config/              # Configuration interfaces
│   └── userConfig.ts       # User settings schema
└── utils/               # Utility functions
    └── slackUtils.ts       # Slack URL parsing
```

### Component Organization

**Layout Components:**
- `App.tsx` - Main application container
- `Navigation.tsx` - Top navigation bar
- `Header.tsx` - Page headers

**Feature Components:**
- `IssueViewer.tsx` - Issue display and editing
- `CommandK.tsx` - Search and command palette
- `BacklogHealth.tsx` - Analytics dashboard
- `Settings.tsx` - Configuration interface

**UI Components:**
- `MarkdownEditor.tsx` - Issue description editing
- `LabelManager.tsx` - Label assignment interface
- `SlackThreadPreview.tsx` - Slack integration UI

## State Management

### Zustand Store (`appStore.ts`)

The application uses a single Zustand store with persistence middleware:

```typescript
interface AppState {
  // Issue Data
  issues: GitHubIssue[];
  currentIssueIndex: number;
  fetchStatus: 'idle' | 'loading' | 'success' | 'error';
  
  // UI State
  sortBy: 'created' | 'updated' | 'comments';
  sortDirection: 'asc' | 'desc';
  
  // Actions
  searchAndLoadIssues: (query: string) => Promise<void>;
  nextIssue: () => void;
  prevIssue: () => void;
  // ... other actions
}
```

### State Persistence

**Issue Data**: Stored in memory only (cleared on refresh)
**UI Preferences**: Persisted to localStorage via Zustand middleware
**Configuration**: Managed separately by ConfigService

### State Flow Patterns

1. **Search → Load → Display**
   ```
   CommandK → searchAndLoadIssues() → GitHub API → Update Store → IssueViewer
   ```

2. **Navigation**
   ```
   Keyboard/UI → nextIssue()/prevIssue() → Update currentIssueIndex → Re-render
   ```

3. **Issue Updates**
   ```
   IssueViewer → updateIssue() → GitHub API → Local State Update
   ```

## Service Layer

### GitHub Service (`github.ts`)

Handles all GitHub API interactions:

```typescript
class GitHubService {
  // Search and retrieval
  searchIssues(params): Promise<GitHubIssue[]>
  fetchIssue(owner, repo, number): Promise<GitHubIssue>
  
  // Modifications
  updateIssue(params): Promise<GitHubIssue>
  closeIssueAsNotPlanned(params): Promise<GitHubIssue>
  
  // Utilities
  testConnection(owner, repo, token?): Promise<ConnectionResult>
}
```

**Key features:**
- Automatic query construction with exclusions
- Rate limiting with delays
- Error handling with user-friendly messages
- Token-based authentication

### Slack API Service (`slackApi.ts`)

Manages Slack integration through proxy server:

```typescript
class SlackApiService {
  // Thread operations
  getThreadPreview(url): Promise<SlackThread | null>
  getChannelInfo(channelId): Promise<ChannelInfo | null>
  
  // Utilities
  parseSlackUrl(url): SlackUrlInfo | null
  formatMessageText(text): string
  testConnection(token?): Promise<SlackConnectionResult>
}
```

**Architecture notes:**
- Requires local proxy server (slack-proxy.cjs) to bypass CORS
- Handles multiple Slack URL formats
- Graceful degradation when proxy unavailable

### Configuration Service (`configService.ts`)

Manages user settings with validation and migration:

```typescript
class ConfigService {
  static save(config: UserConfig): void
  static load(): UserConfig
  static validate(config, requireLabels?): ValidationResult
  static isConfigured(): boolean
  static export(): string
  static import(jsonString): ImportResult
}
```

## Component Architecture

### Component Hierarchy

```
App
├── Navigation
│   ├── RefreshButton
│   └── ViewSwitcher
├── Main Content
│   ├── BacklogHealth (conditional)
│   ├── Settings (conditional)
│   └── Grooming View
│       ├── ConfigurationBanner
│       ├── IssueViewer
│       │   ├── IssueHeader
│       │   ├── MarkdownEditor
│       │   ├── LabelManager
│       │   └── SlackThreadPreview
│       └── IssueNavigator
└── CommandK (modal)
```

### Component Communication Patterns

**Props Down, Callbacks Up:**
```typescript
// Parent passes data and handlers
<IssueViewer 
  issue={currentIssue}
  onUpdate={handleIssueUpdate}
  onClose={handleIssueClose}
/>
```

**Store Integration:**
```typescript
// Components access store directly
const { issues, currentIssueIndex, nextIssue } = useAppStore();
```

**Event-Based Communication:**
```typescript
// CommandK triggers via keyboard event
window.addEventListener('keydown', handleKeyDown);
```

### Component Lifecycle Patterns

**Data Fetching:**
```typescript
useEffect(() => {
  if (selectedDoc) {
    loadDocument(docSection.file);
  }
}, [selectedDoc]);
```

**Cleanup:**
```typescript
useEffect(() => {
  return () => {
    // Cleanup subscriptions, timers, etc.
  };
}, []);
```

## Data Flow

### Issue Search Flow

1. **User Input**: CommandK component receives search query
2. **Store Action**: `searchAndLoadIssues()` called with query
3. **Service Call**: GitHub service constructs full query with exclusions
4. **API Request**: GitHub search API called with authentication
5. **Data Processing**: Results filtered (remove PRs, apply sorting)
6. **State Update**: Store updated with new issues array
7. **UI Update**: Components re-render with new data

### Issue Update Flow

1. **User Action**: Edit issue title/description or change labels
2. **Optimistic Update**: Local state updated immediately
3. **API Call**: GitHub API called to persist changes
4. **Error Handling**: Revert local changes if API call fails
5. **Success Handling**: Keep local changes, optionally refresh

### Configuration Flow

1. **Settings Change**: User modifies configuration in Settings component
2. **Validation**: ConfigService validates required fields
3. **Persistence**: Valid configuration saved to localStorage
4. **Propagation**: Other components reload config on next access
5. **API Updates**: Services use new tokens/settings immediately

## Integration Points

### GitHub API Integration

**Authentication:**
- Personal Access Tokens stored in user configuration
- Bearer token authentication on all requests
- Token validation with connection testing

**Rate Limiting:**
- 5000 requests/hour for authenticated users
- 30 search requests/minute limit
- Automatic delays between paginated requests
- User feedback for rate limit errors

**Data Synchronization:**
- Optimistic updates for immediate UI response
- Periodic refresh to detect external changes
- Conflict resolution favors server state

### Slack Integration Architecture

**Proxy Server Pattern:**
```
Browser → Local Proxy (port 3001) → Slack API
```

**Why Proxy is Needed:**
- Slack API doesn't support CORS for browser requests
- Bot tokens can't be exposed in client-side code
- Proxy handles authentication and request forwarding

**Proxy Server (`slack-proxy.cjs`):**
```javascript
app.post('/api/slack-proxy', async (req, res) => {
  const { endpoint, body, token } = req.body;
  // Forward to Slack API with proper authentication
});
```

### AI Service Integration

**OpenAI Integration:**
- Direct API calls from browser (CORS supported)
- API key stored in user configuration
- Used for thread summaries and issue formatting

**Error Handling:**
- Graceful degradation when API key missing
- Rate limit handling with user feedback
- Fallback to manual editing when AI unavailable

## Performance Considerations

### Optimization Strategies

**Virtual Scrolling:**
- Not implemented yet, but recommended for large issue lists
- Would improve performance with 100+ issues

**Request Batching:**
- Issue refresh operations use batching with delays
- Pagination implemented for large result sets

**Caching:**
- Configuration cached in memory after first load
- Issue data not cached (always fresh from API)
- Slack threads could benefit from caching

**Bundle Optimization:**
- Code splitting not implemented yet
- All dependencies loaded upfront
- Consider dynamic imports for optional features

### Memory Management

**Store Cleanup:**
- Issue arrays replaced entirely on new searches
- No memory leaks in component lifecycles
- Event listeners properly cleaned up

**Performance Monitoring:**
- Browser dev tools for performance profiling
- Network tab for API call optimization
- Memory tab for leak detection

### Scalability Limits

**Current Limitations:**
- 1000 issues maximum per search (GitHub API limit)
- Single repository per configuration
- No multi-user or collaboration features

**Future Scalability:**
- Database backend for multi-user scenarios
- Cached search results for faster loading
- WebSocket updates for real-time collaboration

## Development Patterns

### Error Boundaries

Not currently implemented, but recommended:

```typescript
class ErrorBoundary extends Component {
  // Catch errors in component tree
  // Display fallback UI
  // Log errors for debugging
}
```

### Testing Strategy

**Unit Testing:**
- Service classes with mocked APIs
- Component testing with React Testing Library
- Utility function testing

**Integration Testing:**
- Full user flows with mocked services
- Configuration persistence testing
- Keyboard shortcut testing

**E2E Testing:**
- Critical user journeys
- Cross-browser compatibility
- Performance regression testing

This architecture enables Git Issue Flow to be a powerful, efficient tool for GitHub issue management while remaining simple to deploy and maintain.