# GitIssueFlow

A very fast and focused GitHub issue management tool that helps product managers and developers efficiently groom and prioritize issues through powerful search and quick actions. **Fully configurable for any GitHub repository** - no hardcoded values, works locally, no database required.

Made by [James Pember](https://jamespember.com)

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn** 
- **GitHub Personal Access Token** with `repo` scope

### Basic Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/jamespember/gitissueflow.git
   cd gitissueflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173`

4. **Configure your first repository**
   - Click the **Settings** tab in the app
   - Enter your **GitHub repository** (owner/repo format)
   - Add your **GitHub Personal Access Token** 
   - Customize **priority labels** to match your workflow
   - Save your configuration

5. **Start grooming issues**
   - Press `⌘K` or `Ctrl+K` to open the search interface
   - Use GitHub search syntax to find issues
   - Review, prioritize, and manage your backlog efficiently

### Optional Integrations

#### Slack Thread Previews (Optional)
To enable Slack thread previews with AI summaries:

1. **Create a Slack App** in your workspace
2. **Add bot token scopes**: `channels:history`, `channels:read`, `users:read`
3. **Install the app** and invite the bot to relevant channels
4. **Add your Slack bot token** in Settings > Integrations
5. **Start the proxy server**:
   ```bash
   node slack-proxy.cjs
   ```
   This runs a local proxy on port 3001 for secure Slack API calls

The proxy will automatically use the Slack token from your Settings configuration - no `.env` file needed!

#### OpenAI Integration (Optional)
For AI-powered issue formatting and Slack thread summaries:

1. **Get an OpenAI API key** from your dashboard
2. **Add the API key** in Settings > Integrations

### No Configuration Files Required! 
✅ All configuration is stored in your browser's localStorage  
✅ No `.env` files to create  
✅ No database setup needed  
✅ Works entirely locally

## ✨ Features

### 🔧 Zero Configuration Barriers
- **Local-only application** - No server setup, no database required
- **Universal GitHub support** - Works with any public or private repository
- **Flexible label system** - Configure your own priority and workflow labels
- **Import/Export settings** - Share configurations across teams
- **Quick start templates** - Pre-configured setups for different project types

### 🔍 Powerful Issue Search
- **Command K interface** - `⌘K` or `Ctrl+K` for instant search
- **Full GitHub search syntax** - Use all GitHub's advanced search features
- **Smart filtering** - Exclude prioritized issues, dependencies, or specific labels
- **Configurable batch sizes** - Load 1-100 issues at once
- **Built-in sort options** - Sort by creation date, last updated, or comment count

### 🎯 Streamlined Grooming Workflow
- **Clean, focused interface** - Review one issue at a time without distractions
- **Inline editing** - Modify titles and descriptions with live Markdown preview
- **Priority assignment** - Set High/Medium/Low priority with customizable labels
- **Label management** - Add and remove GitHub labels with real-time sync
- **Quick actions** - Mark complete, close as not planned, open on GitHub

### 🤖 AI-Powered Features (Optional)
- **Format with AI** - Clean up issue descriptions while preserving context
- **Rewrite with AI** - Transform issues with custom prompts
- **Slack integration** - AI summaries of Slack thread discussions
- **Context preservation** - Never lose important Slack links or thread context

### ⌨️ Keyboard-First Experience
- **Full keyboard navigation** - Every action has a keyboard shortcut
- **No mouse required** - Efficient grooming without context switching
- **Vim-inspired** - Familiar shortcuts for developers
- **Visual feedback** - Clear indicators for all actions and status changes

## 🛠️ Configuration

### GitHub Setup

1. **Personal Access Token**
   - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Create a new token with `repo` scope (and `read:org` if needed)
   - Copy the token (starts with `ghp_` or `github_pat_`)

2. **Repository Configuration**
   - Open the Settings tab in the application
   - Enter your repository owner and name (e.g., `facebook/react`)
   - Paste your personal access token
   - Configure your priority labels (e.g., `priority:high`, `priority:medium`, `priority:low`)

### Optional Integrations

#### Slack Integration
- **Bot Token**: Enable Slack thread previews with AI summaries
- **Setup**: Create a Slack app, get bot token with `channels:history`, `channels:read`, `users:read` scopes
- **Proxy**: Run the included `slack-proxy.cjs` for secure API calls

#### OpenAI Integration  
- **API Key**: Enable AI-powered issue formatting and rewriting
- **Setup**: Get API key from OpenAI dashboard, add to Settings

### Workflow Preferences
- **Exclude Prioritized**: Hide issues that already have priority labels
- **Exclude Dependencies**: Filter out issues with specific labels (e.g., `dependencies`, `wontfix`)
- **Default Batch Size**: Number of issues to load per search (1-100)

## 🔒 Security & Privacy

- **Local-only**: All data stored in browser localStorage, nothing sent to external servers
- **Token security**: GitHub tokens stored locally, never transmitted except to GitHub API
- **No tracking**: No analytics, no telemetry, no external dependencies beyond GitHub API
- **Open source**: Full transparency, inspect and modify all code
- **Secure defaults**: Tokens masked in UI, export function redacts sensitive data

## 🛠️ Troubleshooting

### Common Issues

**"GitHub authentication failed"**
- Verify your Personal Access Token is correct and hasn't expired
- Ensure the token has `repo` scope (and `read:org` for organization repos)
- Check that the repository owner/name is correct

**"Repository not found"** 
- Confirm the repository exists and you have access
- For private repos, ensure your token has appropriate permissions
- Check the owner/repo format (e.g., `facebook/react`)

**"No issues found"**
- Try a simpler search query like `is:open is:issue`
- Check if your exclude filters are too restrictive in Settings
- Verify the repository has open issues

**Slack previews not working**
- Ensure `slack-proxy.cjs` is running on port 3001
- Check that your Slack bot is in the relevant channels
- Verify the bot token has the required scopes

**Port already in use**
- If port 5173 is busy, Vite will automatically try the next available port
- For the Slack proxy, you can modify the port in `slack-proxy.cjs`

### Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Make your changes and test thoroughly
5. Submit a pull request with clear description

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.
