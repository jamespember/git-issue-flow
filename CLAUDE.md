# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint on the codebase

### Testing
- No specific test framework configured yet

## Architecture Overview

This is a React-based GitHub issue management tool ("Backlog Groomer") that helps product managers efficiently groom and prioritize GitHub issues. The app integrates with GitHub's API and includes Slack thread preview functionality.

### Core Architecture

**State Management**: Uses Zustand with persistence for global state management
- `src/store/appStore.ts` - Main application state with GitHub issue data, navigation, and actions

**Services Layer**:
- `src/services/github.ts` - GitHub API integration with search, update, and close operations
- `src/services/slackApi.ts` - Slack API integration for thread previews
- `src/services/backlogAnalyzer.ts` - Issue analysis and health metrics

**Component Structure**:
- `src/App.tsx` - Main app with navigation and view switching
- `src/components/CommandK.tsx` - Command palette for GitHub issue search
- `src/components/IssueViewer.tsx` - Main issue display and editing interface
- `src/components/IssueNavigator.tsx` - Issue navigation controls
- `src/components/BacklogHealth.tsx` - Analytics dashboard for issue health metrics
- `src/components/SlackThreadPreview.tsx` - Hover preview for Slack links

### Key Features

**GitHub Integration**:
- Searches GitHub issues using GitHub's search API
- Updates issue titles, descriptions, and labels
- Closes issues as "not planned"
- Automatic priority label management (prio-high, prio-medium, prio-low)
- Hardcoded to work with `komo-tech/komo-platform` repository

**Slack Integration** (Optional):
- Requires local proxy server (`slack-proxy.cjs`) running on port 3001
- Displays thread previews with AI-powered summaries
- Uses OpenAI for thread summarization

**Priority System**:
- Three priority levels: high, medium, low
- Automatically excludes already-prioritized issues from search results
- Also excludes dependency-related issues from grooming workflow

### Data Flow

1. User opens Command K (`⌘K` or `Ctrl+K`) to search issues
2. `CommandK` component calls `appStore.searchAndLoadIssues()`
3. Store calls `githubService.searchIssues()` with GitHub search query
4. Issues are loaded into Zustand store and displayed in `IssueViewer`
5. User actions (prioritize, close, edit) update local state and sync to GitHub via API calls

### Environment Variables

Required for full functionality:
- `VITE_GITHUB_TOKEN` - GitHub personal access token
- `VITE_SLACK_BOT_TOKEN` - Slack bot token (for thread previews)
- `VITE_OPENAI_API_KEY` - OpenAI API key (for Slack thread summaries)

### Keyboard Shortcuts

The app includes extensive keyboard shortcuts defined in the README:
- `⌘K/Ctrl+K` - Command palette
- `Alt + ←/→` - Navigation
- `Ctrl + H/M/L` - Set priority levels
- `Ctrl + C` - Mark complete
- `Ctrl + X` - Close as not planned
- `Ctrl + E` - Edit mode
- `Ctrl + S` - Save changes

### Styling

- Uses Tailwind CSS for styling
- Framer Motion for animations
- Responsive design with mobile support
- Clean, minimal interface focused on efficiency