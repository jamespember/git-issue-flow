# Git Issue Flow

Fast, keyboard-driven GitHub issue management tool for efficient backlog grooming. No database, no servers - just your browser and GitHub API.

Made by [James Pember](https://jamespember.com)

## Screenshots

Easily fetch issues from Github using search syntax

<img width="1383" height="1324" alt="image" src="https://github.com/user-attachments/assets/db718b3d-7886-42b9-b551-4fb71bd4da44" />

Quicky move through issues, add labels, edit and save updates using keyboard shortuts 

<img width="3044" height="1772" alt="image" src="https://github.com/user-attachments/assets/9dddf30f-fa81-4247-aea3-3bd29accfef1" />

Enter an OpenAI API key to format or rewrite issues with AI

<img width="3020" height="1658" alt="image" src="https://github.com/user-attachments/assets/9525e082-8397-4c30-a605-d8b47f82ab27" />

Keep tabs on your backlogs health, and make sure you're grooming issues faster than they're coming in 

<img width="3856" height="1958" alt="image" src="https://github.com/user-attachments/assets/997da8e6-a80f-49ad-9367-4a5be22ad039" />

## Quick Start

```bash
git clone https://github.com/jamespember/git-issue-flow.git
cd git-issue-flow
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
1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. **Required scopes:**
   - `repo` (Full control of private repositories) - **Required for all repositories**
   - `read:org` (Read org membership) - **Only if using organization repositories**
4. Copy the token (starts with `ghp_`)
5. Add to Settings in the app

### Optional: Slack Integration
1. Go to [Slack API Apps](https://api.slack.com/apps) → "Create New App"
2. **Required Bot Token Scopes:**
   - `channels:history` (View messages in public channels)
   - `channels:read` (View basic info about public channels)  
   - `users:read` (View people in workspace)
3. Install app to workspace and invite bot to relevant channels
4. Copy Bot User OAuth Token (starts with `xoxb-`)
5. Run proxy: `node slack-proxy.cjs`
6. Add bot token in Settings

### Optional: OpenAI
Add API key in Settings for AI-powered features

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K`/`Ctrl+K` | Open search |
| `Alt + ←` | Previous issue |
| `Alt + →` | Next issue |
| `Ctrl + E` | Edit description |
| `Ctrl + S` | Save changes |
| `Ctrl + C` | Mark as complete |
| `Ctrl + O` | Open on GitHub |
| `Ctrl + H` | Set high priority |
| `Ctrl + M` | Set medium priority |
| `Ctrl + L` | Set low priority |
| `Ctrl + X` | Close as not planned |
| `Ctrl + Shift + R` | Refresh all issues |
| `Ctrl + Shift + S` | Preview Slack thread |

## Troubleshooting

**GitHub auth failed**: Check token validity and repo permissions  
**No issues found**: Try simpler search like `is:open is:issue`  
**Slack not working**: Ensure proxy is running and bot has channel access

## License

MIT - see [LICENSE](LICENSE) file
