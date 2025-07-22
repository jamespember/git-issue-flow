# GitIssueFlow

Fast, keyboard-driven GitHub issue management tool for efficient backlog grooming. No database, no servers - just your browser and GitHub API.

Made by [James Pember](https://jamespember.com)

## Quick Start

```bash
git clone https://github.com/jamespember/github-groomer.git
cd github-groomer
npm install
npm run dev
```

1. Open `http://localhost:5173`
2. Go to Settings tab
3. Add GitHub repository (owner/repo) and Personal Access Token
4. Configure priority labels to match your workflow
5. Press `⌘K`/`Ctrl+K` to search and start grooming

## Features

**Core Workflow**
- Command palette search with full GitHub query syntax
- Keyboard shortcuts for every action (Ctrl+H/M/L for priorities, Ctrl+E to edit, etc.)
- Inline markdown editing with live preview
- Real-time label management and GitHub sync

**AI Integration** (Optional)
- Format messy issues with AI
- Slack thread previews with summaries (`Ctrl+Shift+S` when links detected)
- Append Slack context directly to issues

**Zero Config**
- Works with any GitHub repository
- All settings stored in browser localStorage
- Test buttons for API tokens
- Import/export configurations

## Setup

### Required: GitHub Token
1. Create token at [GitHub Settings](https://github.com/settings/tokens) with `repo` scope
2. Add to Settings in the app

### Optional: Slack Integration
1. Create Slack app with bot token
2. Add scopes: `channels:history`, `channels:read`, `users:read`  
3. Run proxy: `node slack-proxy.cjs`
4. Add bot token in Settings

### Optional: OpenAI
Add API key in Settings for AI-powered features

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K`/`Ctrl+K` | Open search |
| `Alt + ←/→` | Navigate issues |
| `Ctrl + E` | Edit description |
| `Ctrl + S` | Save changes |
| `Ctrl + H/M/L` | Set priority |
| `Ctrl + C` | Mark complete |
| `Ctrl + X` | Close as not planned |
| `Ctrl + Shift + S` | Preview Slack thread (when available) |

## Troubleshooting

**GitHub auth failed**: Check token validity and repo permissions  
**No issues found**: Try simpler search like `is:open is:issue`  
**Slack not working**: Ensure proxy is running and bot has channel access

## License

MIT - see [LICENSE](LICENSE) file