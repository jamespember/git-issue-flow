# Slack Integration Setup Guide

## Overview
This guide explains how to set up Slack thread previews for the GitHub Groomer app.

## Prerequisites
- Admin access to your Slack workspace
- Ability to create and install Slack apps

## Step 1: Create a Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App"
3. Choose "From scratch"
4. Name your app (e.g., "GitHub Groomer Bot")
5. Select your workspace

## Step 2: Configure Bot Token Scopes

1. In your app settings, go to "OAuth & Permissions"
2. Under "Scopes" → "Bot Token Scopes", add:
   - `channels:history` - Read message history
   - `channels:read` - Get channel info  
   - `users:read` - Get user info for display names
   - `groups:history` - Read private channel history (optional)
   - `groups:read` - Get private channel info (optional)

## Step 3: Install App to Workspace

1. Go to "Install App" in the sidebar
2. Click "Install to Workspace"
3. Review permissions and click "Allow"
4. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

## Step 4: Add Bot to Channels

For each channel you want to preview (like `#bug-news`):

```bash
/invite @YourBotName
```

Or add the bot to the channel through Slack's interface.

## Step 5: Configure Environment Variables

Create or update your `.env` file:

```env
VITE_SLACK_BOT_TOKEN=xoxb-your-bot-token-here
```

## Step 6: Test the Integration

1. Start your development server
2. Hover over a Slack link in an issue
3. You should see a thread preview

## Troubleshooting

### "Slack bot token not configured"
- Check that `VITE_SLACK_BOT_TOKEN` is set in your `.env` file
- Restart your development server after adding the token

### "Unable to load thread preview"
- Verify the bot is added to the channel
- Check that the channel is public or the bot has access
- Ensure the Slack URL format is supported

### "Slack API returned error"
- Check the browser console for specific error messages
- Verify bot token permissions
- Ensure the channel exists and is accessible

## Security Notes

- Never commit your bot token to version control
- Use environment variables for all tokens
- Consider using a dedicated bot user for this integration
- Review bot permissions regularly

## Supported URL Formats

The integration supports these Slack URL formats:
- `https://app.slack.com/client/TEAM/CHANNEL/thread/CHANNEL-TIMESTAMP`
- `https://slack.com/app/TEAM/CHANNEL`
- `https://app.slack.com/client/TEAM/CHANNEL`

## Limitations

- Only works with channels the bot has access to
- Requires bot to be added to each channel
- Subject to Slack API rate limits
- Private channels require additional scopes 