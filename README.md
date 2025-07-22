# James' Magical Backlog Groomer

A focused GitHub issue management tool that helps product managers efficiently groom and prioritize issues through powerful search and quick actions.

![PM Backlog Groomer](https://images.pexels.com/photos/7376/startup-photos.jpg?auto=compress&cs=tinysrgb&w=400)

## Features

### Slack Thread Previews (with AI Summary)
- Hover over a Slack link (e.g., https://choosekomo.slack.com/archives/...) in an issue to see a live preview of the thread
- Shows the parent message, all replies, and any reactions/emojis on the parent message
- AI-powered summary at the top gives a concise, actionable takeaway for grooming
- Requires a Slack bot token and a local proxy server (see below)

### Command K Search Interface
- **⌘K / Ctrl+K** to open powerful GitHub issue search
- Use GitHub's full search syntax for precise filtering
- Search by labels, dates, authors, and any GitHub query
- Quick templates for common searches (bug reports, recent issues, etc.)
- Configurable result count (1-100 issues)
- Built-in sort options (newest/oldest first)

### Issue Grooming Workflow
- Clean, focused interface for reviewing one issue at a time
- Edit issue titles and descriptions with live Markdown preview
- Set priority levels (High, Medium, Low) with visual indicators
- Add and remove GitHub labels with real-time sync
- Navigate between issues with intuitive controls

### Quick Actions
- **Mark as Complete** - Adds priority labels and removes from queue
- **Close as Not Planned** - Closes issue with proper GitHub status
- **Edit in Place** - Modify descriptions and titles directly
- **Label Management** - Add/remove labels with GitHub sync
- **Refresh Issues** - Sync local state with GitHub to remove closed issues and update data

### Smart Navigation
- Dropdown selector showing all loaded issues with previews
- Forward/backward navigation with keyboard shortcuts
- Issue counter and progress tracking
- Auto-advance to next issue after actions

## Slack Proxy Integration

To enable Slack thread previews and AI summaries, this app uses a lightweight backend proxy to securely call the Slack API (avoiding CORS and keeping your bot token safe).

### Setup Steps

1. **Create a Slack App** in your workspace and add these bot token scopes:
   - `channels:history`, `channels:read`, `users:read`
2. **Install the app** to your workspace and invite the bot to any channels you want to preview.
3. **Copy your Bot User OAuth Token** (starts with `xoxb-...`).
4. **Add the token to your `.env` file**:
   ```env
   VITE_SLACK_BOT_TOKEN=xoxb-your-bot-token-here
   ```
5. **Start the proxy server** in your project root:
   ```bash
   node slack-proxy.cjs
   ```
6. The frontend will automatically use the proxy at `http://localhost:3001/api/slack-proxy` for all Slack API calls.

### How it Works
- When you hover a Slack link, the frontend sends a request to the proxy.
- The proxy calls Slack's API using your bot token and returns the thread data.
- The frontend displays the thread, reactions, and an AI summary (using your OpenAI API key).

### Security Notes
- Your Slack bot token is **never exposed to the browser**.
- The proxy only accepts requests from your local frontend (CORS restricted).
- For production, you should secure the proxy further (auth, HTTPS, etc).

### Troubleshooting
- If you see CORS errors, make sure the proxy is running and CORS is enabled for your frontend's origin.
- If you see Slack API errors, check that the bot is in the channel and has the right scopes.
- For more details, see `SLACK_SETUP.md` in the repo.

## Keyboard Shortcuts

- `⌘K / Ctrl+K` - Open search interface
- `Alt + ←` - Previous issue
- `Alt + →` - Next issue
- `Ctrl + E` - Edit description
- `Ctrl + S` - Save changes
- `Ctrl + C` - Mark as complete (requires priority)
- `Ctrl + X` - Close as not planned
- `Ctrl + O` - Open on GitHub
- `Ctrl + H` - Set high priority
- `Ctrl + M` - Set medium priority
- `Ctrl + L` - Set low priority
- `Ctrl + Shift + R` - Refresh all issues from GitHub
- `Ctrl + Shift + S` - Open first Slack link in issue (if any)

## GitHub Search Examples

```
# Bug reports that haven't been groomed
is:open is:issue label:"is: bug" -label:groomed-james

# Recent issues from last 30 days
is:open is:issue created:>2024-01-01

# Issues by specific author
is:open is:issue author:username

# High priority items
is:open is:issue label:"priority:high"
```

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- Framer Motion for smooth animations
- GitHub API integration
- Markdown editor and preview
- Lucide React icons

## Getting Started

1. Clone the repository
2. Set up your GitHub API token in environment variables
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Press `⌘K` to search and load issues from your GitHub repository

## Workflow

1. **Search** - Use Command K to find issues matching your criteria
2. **Review** - Go through each issue, reading descriptions and context  
3. **Prioritize** - Set High/Medium/Low priority based on business value
4. **Label** - Add relevant labels for categorization and routing
5. **Complete** - Mark as done or close as not planned to move to next issue

The app automatically syncs all changes back to GitHub, keeping your repository up to date while providing a streamlined grooming experience.

## Contributing

Feel free to submit issues and enhancement requests!