# Slack Integration Guide

Git Issue Flow can display rich previews of Slack threads when you hover over Slack links in GitHub issues. This guide walks you through the complete setup process.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Step 1: Create Slack App](#step-1-create-slack-app)
- [Step 2: Configure Bot Permissions](#step-2-configure-bot-permissions)
- [Step 3: Install App to Workspace](#step-3-install-app-to-workspace)
- [Step 4: Set Up Local Proxy](#step-4-set-up-local-proxy)
- [Step 5: Configure Git Issue Flow](#step-5-configure-git-issue-flow)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)

## Overview

The Slack integration provides:
- **Hover Previews**: See Slack thread content without leaving the app
- **AI Summaries**: Get condensed summaries of long threads (requires OpenAI)
- **Thread Context**: View participant count, reactions, and files
- **Append to Issues**: Add Slack context directly to GitHub issues

**Architecture**: The integration uses a local proxy server to handle Slack API calls, bypassing CORS restrictions.

## Prerequisites

- Admin access to your Slack workspace (or someone who can create apps)
- Node.js installed for running the proxy server
- Git Issue Flow running locally

## Step 1: Create Slack App

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Fill in app details:
   - **App Name**: `Git Issue Flow` (or your preferred name)
   - **Workspace**: Select your workspace
5. Click **"Create App"**

## Step 2: Configure Bot Permissions

### Add Bot Token Scopes

1. In your app dashboard, go to **"OAuth & Permissions"**
2. Scroll to **"Scopes"** section
3. Under **"Bot Token Scopes"**, add these permissions:

**Required Scopes**:
- `channels:history` - View messages in public channels
- `channels:read` - View basic information about public channels
- `users:read` - View people in workspace

**Optional Scopes** (for enhanced features):
- `groups:history` - View messages in private channels (if bot is invited)
- `im:history` - View direct messages (if bot is invited)
- `mpim:history` - View group direct messages (if bot is invited)

### Why These Permissions?

- **channels:history**: Required to fetch thread messages and replies
- **channels:read**: Needed to get channel names for display
- **users:read**: Used to show usernames instead of user IDs

## Step 3: Install App to Workspace

1. In **"OAuth & Permissions"**, click **"Install to Workspace"**
2. Review the permissions request
3. Click **"Allow"**
4. Copy the **"Bot User OAuth Token"** (starts with `xoxb-`)
   - Keep this secure - treat it like a password
   - You'll need it for configuration

### Invite Bot to Channels

The bot can only read messages from channels it has access to:

1. Go to each Slack channel with relevant threads
2. Type: `/invite @YourBotName`
3. Or use the channel settings to add the bot

**Note**: For private channels, the bot must be explicitly invited.

## Step 4: Set Up Local Proxy

The Slack integration requires a local proxy server to handle API calls.

### Start the Proxy Server

1. Open a terminal in your Git Issue Flow directory
2. Run the proxy server:
   ```bash
   node slack-proxy.cjs
   ```
3. You should see: `Slack proxy server running on http://localhost:3001`

### Keep Proxy Running

The proxy must stay running while using Slack features:
- Run in a separate terminal window
- Consider using `pm2` or similar for production deployments
- The proxy automatically handles CORS and token authentication

### Proxy Configuration

The proxy accepts tokens in two ways:
1. **Environment variable**: Set `VITE_SLACK_BOT_TOKEN=your_token`
2. **App configuration**: Token sent with each request (recommended)

## Step 5: Configure Git Issue Flow

1. Open Git Issue Flow in your browser
2. Go to **Settings** tab
3. Expand the **Slack Integration** section
4. Fill in the configuration:

**Bot Token**: Paste your `xoxb-` token from Step 3
**Workspace URL** (optional): Your Slack workspace URL for reference

5. Click **"Test Slack Connection"** to verify setup
6. If successful, you'll see your workspace and bot name
7. Click **"Save Configuration"**

## Usage

### Viewing Thread Previews

1. Find a GitHub issue with Slack links
2. Hover over any Slack link in the issue description or comments
3. A preview popup will appear showing:
   - Thread participants and message count
   - First few messages of the thread
   - Reactions and file attachments
   - Link to open in Slack

### Supported Link Formats

The integration works with these Slack URL formats:
- `https://yourworkspace.slack.com/archives/C01234567/p1234567890123456`
- Thread permalinks from the Slack app
- Message permalinks that lead to threads

### AI-Powered Summaries

If you have OpenAI configured:
1. Hover over a Slack link
2. Click **"Generate Summary"** in the preview
3. An AI summary of the thread will appear
4. Use **"Append to Issue"** to add context to the GitHub issue

### Keyboard Shortcuts

- `Ctrl+Shift+S` - Generate Slack summary for detected links

## Troubleshooting

### Connection Issues

**"Slack proxy is not running"**
- Start the proxy: `node slack-proxy.cjs`
- Check it's running on port 3001
- Ensure no other service is using port 3001

**"Invalid Slack bot token"**
- Verify token starts with `xoxb-`
- Check token hasn't been regenerated in Slack
- Ensure bot is installed to workspace

**"Channel not found"**
- Bot needs to be invited to the channel
- For private channels, explicitly invite the bot
- Check channel still exists

### Preview Issues

**"No thread found"**
- Link might be to a single message, not a thread
- Thread might have been deleted
- Bot might not have access to the channel

**"Preview shows generic errors"**
- Check browser console for detailed errors
- Verify proxy is processing requests
- Test connection in Settings

### Permission Errors

**"Bot can't access channel"**
- Invite bot to the channel: `/invite @BotName`
- For private channels, check bot has proper permissions
- Verify bot scopes include `channels:history`

**"Not enough permissions"**
- Check bot has all required scopes in Slack app settings
- Reinstall app if you added scopes after installation
- Some workspaces have restrictions on bot access

### Performance Issues

**Slow previews**
- Large threads take time to load
- Consider reducing thread history in queries
- Check network connection to Slack APIs

**Rate limiting**
- Slack has API rate limits
- Proxy includes automatic retry logic
- Avoid rapid-fire hover actions

### Development Issues

**CORS errors**
- Always use the proxy server, never call Slack APIs directly
- Ensure proxy is running on correct port (3001)
- Check proxy logs for error details

**Token not working**
- Ensure token is passed correctly to proxy
- Check environment variables vs app config
- Regenerate token if compromised

## Advanced Configuration

### Multiple Workspaces

To support multiple Slack workspaces:
1. Create separate bot apps for each workspace
2. Configure different tokens for different repositories
3. Consider running multiple proxy instances on different ports

### Production Deployment

For production use:
1. Deploy proxy server to reliable hosting
2. Use environment variables for tokens
3. Set up monitoring and logging
4. Consider rate limiting and caching

### Security Considerations

- Never commit tokens to version control
- Use environment variables in production
- Regularly rotate bot tokens
- Monitor bot access logs in Slack

## Getting Help

If you're still having issues:

1. Check the [Troubleshooting Guide](troubleshooting.md)
2. Review proxy server logs for errors
3. Test each step independently
4. Check Slack app event logs
5. Create an issue with detailed error messages