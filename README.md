# GitHub Issue Groomer

A focused GitHub issue management tool that helps product managers and developers efficiently groom and prioritize issues through powerful search and quick actions. **Fully configurable for any GitHub repository** - no hardcoded values, works locally, no database required.

![GitHub Issue Groomer](https://images.pexels.com/photos/7376/startup-photos.jpg?auto=compress&cs=tinysrgb&w=400)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/github-groomer.git
   cd github-groomer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Configure your repository**
   - Open the app and click on the **Settings** tab
   - Enter your GitHub repository details and personal access token
   - Customize your priority labels and workflow preferences
   - Save your configuration

5. **Start grooming**
   - Press `⌘K` or `Ctrl+K` to search for issues
   - Review, prioritize, and manage your backlog efficiently

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
