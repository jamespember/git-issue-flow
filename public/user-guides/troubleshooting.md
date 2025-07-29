# Troubleshooting Guide

This guide helps you diagnose and fix common issues with Git Issue Flow.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Configuration Issues](#configuration-issues)
- [GitHub Integration Problems](#github-integration-problems)
- [Search and Loading Issues](#search-and-loading-issues)
- [Slack Integration Problems](#slack-integration-problems)
- [Performance Issues](#performance-issues)
- [Browser and Local Issues](#browser-and-local-issues)
- [Getting Help](#getting-help)

## Quick Diagnostics

Before diving into specific issues, try these quick checks:

### 1. Test All Connections
1. Go to **Settings** tab
2. Use **Test GitHub Connection** button
3. Use **Test Slack Connection** button (if configured)
4. Check for any error messages

### 2. Check Browser Console
1. Open browser developer tools (F12)
2. Go to **Console** tab
3. Look for error messages (red text)
4. Note any errors when performing actions

### 3. Verify Configuration
1. Ensure all required fields are filled in Settings
2. Check that tokens haven't expired
3. Verify repository exists and is accessible

## Configuration Issues

### "Configuration not saved" or Settings reset

**Symptoms:**
- Settings don't persist after refresh
- Configuration keeps reverting to defaults
- Can't save changes

**Causes & Solutions:**

**Browser Storage Issues:**
1. Check if browser has sufficient storage space
2. Try private/incognito mode to test
3. Clear browser data for the site and reconfigure
4. Check if browser extensions are blocking localStorage

**Configuration Corruption:**
1. Go to Settings → **Reset to Defaults**
2. Reconfigure from scratch
3. Export/import settings to backup known good config

**Browser Security Settings:**
1. Ensure site isn't in blocked cookies list
2. Check if localStorage is disabled in browser settings
3. Temporarily disable strict privacy extensions

### "Validation errors" when saving

**Common validation messages and fixes:**

**"GitHub repository owner is required"**
- Fill in the GitHub username or organization name
- Example: `facebook`, `microsoft`, `your-username`

**"GitHub Personal Access Token is required"**
- Create token at [GitHub Settings](https://github.com/settings/tokens)
- Ensure token starts with `ghp_` or `github_pat_`

**"Priority labels are required"**
- Configure all three priority levels in Labels section
- Use simple names like `high`, `medium`, `low`

## GitHub Integration Problems

### "Repository not found" or 404 errors

**Check Repository Path:**
1. Verify owner/repo spelling (case-sensitive)
2. Ensure repository exists and isn't deleted
3. Try accessing `https://github.com/owner/repo` directly

**Permission Issues:**
1. Check if repository is private and token has access
2. For organization repos, ensure token has `read:org` scope
3. Try with a public repository first to isolate the issue

**Token Problems:**
1. Regenerate GitHub token with proper scopes
2. Ensure token hasn't expired
3. Use "repo" scope for private repos, "public_repo" for public

### "Authentication failed" or 401 errors

**Token Validation:**
1. Verify token format starts with `ghp_` or `github_pat_`
2. Check token hasn't been regenerated in GitHub
3. Ensure no extra spaces when copying token

**Token Scopes:**
Required scopes depend on repository type:
- **Public repos**: `public_repo`
- **Private repos**: `repo`
- **Organization repos**: Add `read:org`

**Test Token Manually:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.github.com/user
```

### "Rate limit exceeded" or 403 errors

**Immediate Solutions:**
1. Wait for rate limit to reset (check error message for time)
2. Reduce batch size in workflow settings
3. Avoid rapid successive searches

**Long-term Solutions:**
1. Use organization tokens which have higher limits
2. Implement search query caching
3. Space out grooming sessions across time

**Rate Limit Details:**
- **Authenticated**: 5000 requests/hour
- **Search API**: 30 requests/minute
- **Unauthenticated**: 60 requests/hour (much lower)

## Search and Loading Issues

### "No issues found" with valid search

**Common Causes:**

**All Issues Already Groomed:**
1. Check if workflow settings exclude groomed issues
2. Try setting "Exclude Groomed Issues" to false temporarily
3. Use simpler search like `is:open is:issue`

**Search Query Too Restrictive:**
1. Start with basic query: `is:open is:issue`
2. Add filters gradually: `is:open is:issue label:bug`
3. Check GitHub search syntax is correct

**Repository Has No Issues:**
1. Verify repository actually has open issues
2. Check if issues are all closed or converted to discussions
3. Try searching closed issues: `is:closed is:issue`

### Search results seem wrong or incomplete

**Exclusion Filters:**
Git Issue Flow automatically excludes certain issues based on your configuration:

1. **Priority Labels**: If "Exclude Prioritized" is enabled
2. **Groomed Labels**: If "Exclude Groomed" is enabled  
3. **Dependency Labels**: If "Exclude Dependencies" is enabled

**To see all issues:**
1. Temporarily disable all exclusions in Workflow settings
2. Use the Health tab to see full issue metrics
3. Check individual label configurations

**GitHub Search Limitations:**
1. GitHub indexes search with delays (new issues may not appear immediately)
2. Search results are limited to 1000 issues maximum
3. Complex queries may timeout

### Issues won't load or app shows loading forever

**Network Issues:**
1. Check internet connection
2. Try refreshing the page
3. Check if GitHub is down: [status.github.com](https://status.github.com)

**Browser Issues:**
1. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache for the site
3. Try different browser

**Configuration Issues:**
1. Test GitHub connection in Settings
2. Check browser console for error messages
3. Verify token permissions and repository access

## Slack Integration Problems

### "Slack proxy is not running"

**Start the Proxy:**
1. Open terminal in project directory
2. Run: `node slack-proxy.cjs`  
3. Should see: "Slack proxy server running on http://localhost:3001"

**Proxy Issues:**
1. Check if port 3001 is already in use
2. Kill other processes using port 3001
3. Try different port by modifying slack-proxy.cjs

**Firewall/Network:**
1. Check if localhost connections are blocked
2. Temporarily disable firewall to test
3. Ensure no corporate proxy is interfering

### "Invalid Slack bot token" or authentication errors

**Token Validation:**
1. Ensure token starts with `xoxb-`
2. Check token hasn't been regenerated in Slack app settings
3. Copy token carefully (no spaces or truncation)

**Bot Permissions:**
Required OAuth scopes:
- `channels:history` - View messages in public channels
- `channels:read` - View basic channel information
- `users:read` - View user information

**Reinstall if Scopes Changed:**
1. Go to Slack app settings
2. Click "Reinstall App" if you added scopes
3. Get new bot token after reinstallation

### Slack thread previews not working

**Channel Access:**
1. Bot must be invited to channels with relevant threads
2. Use `/invite @BotName` in each channel
3. For private channels, explicitly invite the bot

**Thread Detection:**
1. Hover over Slack links in GitHub issues
2. Links must be to actual threads (multiple messages)
3. Single message links won't show thread previews

**URL Format Issues:**
Supported formats:
- `https://workspace.slack.com/archives/CHANNEL/pTIMESTAMP`
- Permalink URLs from Slack app

Unsupported:
- Deep links from mobile app
- Workspace URLs without specific message

### "Bot can't access channel" errors

**Invite Bot to Channel:**
```
/invite @YourBotName
```

**Check Bot Status:**
1. Go to channel member list
2. Verify bot appears in members
3. Check bot has appropriate permissions

**Private Channel Access:**
1. Private channels require explicit invitation
2. Bot won't see messages in uninvited private channels
3. Consider using public channels for threads you want to preview

## Performance Issues

### App is slow or unresponsive

**Large Issue Sets:**
1. Reduce batch size in workflow settings (try 10-20)
2. Use more specific search queries
3. Exclude more labels to reduce result size

**Browser Resources:**
1. Close other tabs using memory
2. Restart browser to clear memory
3. Check if browser extensions are impacting performance

**API Performance:**
1. GitHub API can be slow during peak times
2. Large repositories take longer to search
3. Complex search queries increase response time

### Slack previews are slow to load

**Thread Size:**
1. Large threads (100+ messages) take time to load
2. Threads with many files/attachments are slower
3. Old threads may have slower API responses

**Network Factors:**
1. Slack API performance varies by region
2. Corporate networks may add latency
3. Concurrent requests can slow responses

**Optimization:**
1. Limit thread history in queries
2. Cache frequently accessed threads
3. Avoid hovering rapidly over multiple links

## Browser and Local Issues

### Page won't load or shows blank screen

**Browser Compatibility:**
Git Issue Flow requires modern browser features:
- **Chrome**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+

**JavaScript Errors:**
1. Check browser console for JavaScript errors
2. Try hard refresh (Ctrl+Shift+R)
3. Disable browser extensions temporarily

**Local Development:**
1. Ensure `npm run dev` is running
2. Check if port 5173 is accessible
3. Try accessing `http://localhost:5173` directly

### Settings or data not persisting

**localStorage Issues:**
1. Check if browser allows localStorage for the site
2. Try private/incognito mode
3. Clear site data and reconfigure

**Browser Storage Limits:**
1. Check available storage space
2. Clear other site data to free space
3. Export configuration before clearing data

**Sync Issues:**
1. Settings are stored locally per browser
2. Different browsers/devices have separate configs
3. Use export/import to transfer settings

### Keyboard shortcuts not working

**Focus Issues:**
1. Click in the main app area first
2. Ensure no input fields are focused
3. Some shortcuts require specific context

**Browser Conflicts:**
1. Check if browser extensions intercept shortcuts
2. Try shortcuts in private/incognito mode
3. Some corporate software blocks certain key combinations

**Operating System:**
- Windows/Linux: Use `Ctrl+` shortcuts
- Mac: Use `Cmd+` shortcuts (some use `Ctrl+` as specified)

## Getting Help

### Before Requesting Help

1. Check this troubleshooting guide thoroughly
2. Test with a simple, public repository
3. Try in a different browser or private mode
4. Note exact error messages and steps to reproduce
5. Check browser console for JavaScript errors

### Information to Include

When reporting issues, include:

**System Information:**
- Operating system and version
- Browser and version
- Git Issue Flow version/commit

**Configuration:**
- Repository type (public/private, personal/org)
- Which features you're using (Slack, AI, etc.)
- Export of configuration (tokens will be redacted)

**Error Details:**
- Exact error messages
- Browser console errors
- Steps to reproduce the issue
- Screenshots if UI-related

### Where to Get Help

1. **GitHub Issues**: [Create an issue](https://github.com/jamespember/git-issue-flow/issues)
2. **Documentation**: Check other guides for specific features
3. **Community**: Look for existing issues with similar problems

### Debug Mode

For advanced troubleshooting:

1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for detailed error messages
4. Check Network tab for failed requests
5. Include relevant console output when reporting issues

### Common Quick Fixes

**"Turn it off and on again":**
1. Refresh the page (F5)
2. Hard refresh (Ctrl+Shift+R)
3. Close and reopen browser
4. Restart proxy server (for Slack issues)
5. Reset configuration to defaults

**Test in isolation:**
1. Try with a different repository
2. Test individual features separately
3. Use minimal configuration first
4. Add complexity gradually

This should resolve most common issues. If you're still stuck, don't hesitate to create a detailed issue report!