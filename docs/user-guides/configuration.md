# Configuration Guide

This guide walks you through configuring Git Issue Flow for your team's workflow, including GitHub integration, label management, and workflow preferences.

## Table of Contents

- [Quick Setup](#quick-setup)
- [GitHub Integration](#github-integration)
- [Label Configuration](#label-configuration)
- [Workflow Settings](#workflow-settings)
- [Team Configuration Examples](#team-configuration-examples)
- [Import/Export Settings](#importexport-settings)

## Quick Setup

1. Open Git Issue Flow in your browser
2. Click on the **Settings** tab
3. Fill in the **GitHub** section with your repository details
4. Configure **Priority Labels** to match your workflow
5. Adjust **Workflow** settings for your team's process
6. Click **Save Configuration**

## GitHub Integration

### Repository Setup

**Owner**: The GitHub username or organization name
- Examples: `facebook`, `microsoft`, `your-username`

**Repository**: The repository name
- Examples: `react`, `vscode`, `my-project`

**Combined**: These create the full repository path like `facebook/react`

### Personal Access Token

You need a GitHub Personal Access Token (PAT) to access repository data.

#### Creating a Token

1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Set an expiration date (90 days recommended for security)
4. Select the following scopes:

**Required Scopes**:
- `repo` (Full control of private repositories) - **Required for all repositories**
- `read:org` (Read org membership) - **Only needed for organization repositories**

#### Token Security

- Tokens start with `ghp_` or `github_pat_`
- Never share tokens publicly
- Regenerate tokens if compromised
- Use the minimum required scopes

### Testing Connection

Use the **Test GitHub Connection** button to verify:
- Token is valid
- Repository exists and is accessible
- Proper permissions are granted

## Label Configuration

Labels control how issues are prioritized and filtered during grooming sessions.

### Priority Labels

Configure three priority levels that match your team's workflow:

**Default Configuration**:
- High: `prio-high`
- Medium: `prio-medium`
- Low: `prio-low`

**Custom Examples**:
- Engineering team: `P0`, `P1`, `P2`
- Agile team: `urgent`, `important`, `nice-to-have`
- Support team: `critical`, `normal`, `low`

### Groomed Labels

Labels that indicate an issue has been reviewed and processed. Issues with these labels are typically excluded from grooming searches.

**Default**: Any priority label means the issue is groomed
**Examples**:
- `triaged` - Issue has been reviewed
- `estimated` - Story points assigned
- `refined` - Ready for development
- `reviewed` - Product manager has reviewed

**OR Logic**: If an issue has ANY of the groomed labels, it's considered groomed.

### Exclude Labels

Labels for issues that should be filtered out of grooming sessions.

**Common Examples**:
- `dependencies` - Blocked by external factors
- `wontfix` - Won't be addressed
- `duplicate` - Duplicate of another issue
- `external-dependency` - Waiting on third party
- `blocked` - Cannot proceed

## Workflow Settings

### Exclude Prioritized Issues

**Default**: `false` (disabled)

When enabled, issues with any priority label are excluded from search results. This setting is typically disabled when you're using "groomed labels" instead.

### Exclude Dependencies

**Default**: `true` (enabled)

Excludes issues with dependency-related labels from grooming searches. Useful for focusing on actionable issues.

### Exclude Groomed Issues

**Default**: `true` (enabled)

Excludes issues that have already been groomed (have any "groomed" labels). This helps focus on unprocessed issues.

### Default Batch Size

**Default**: `30`

Number of issues to load per search. Larger batches load more issues but may be slower.

**Recommended**:
- Small teams: 20-30 issues
- Large backlogs: 50-100 issues
- Performance testing: 10-15 issues

## Team Configuration Examples

### Startup Team

Focus on speed and simplicity:

```
GitHub: startup/product-app
Priority Labels:
  - High: urgent
  - Medium: important  
  - Low: later
Groomed Labels: [reviewed]
Exclude Labels: [blocked, wontfix]
Workflow:
  - Exclude Groomed: true (focus on new issues)
  - Batch Size: 20 (small team, quick reviews)
```

### Enterprise Engineering Team

Formal process with multiple stages:

```
GitHub: enterprise/platform
Priority Labels:
  - High: P0
  - Medium: P1
  - Low: P2
Groomed Labels: [triaged, estimated, refined]
Exclude Labels: [external-dependency, legal-review, blocked]
Workflow:
  - Exclude Groomed: true (separate estimation process)
  - Batch Size: 50 (large team, bulk processing)
```

### Open Source Project

Community-driven with contributor focus:

```
GitHub: community/awesome-tool
Priority Labels:
  - High: high-priority
  - Medium: medium-priority
  - Low: low-priority
Groomed Labels: [confirmed, good-first-issue]
Exclude Labels: [help-wanted, documentation, duplicate]
Workflow:
  - Exclude Groomed: false (maintainers review all)
  - Batch Size: 30 (balance visibility and performance)
```

### Support Team

Customer-focused with urgency levels:

```
GitHub: company/support-tracker
Priority Labels:
  - High: critical
  - Medium: normal
  - Low: enhancement
Groomed Labels: [triaged, assigned]
Exclude Labels: [customer-success, billing, duplicate]
Workflow:
  - Exclude Groomed: true (focus on untriaged tickets)
  - Batch Size: 40 (high volume processing)
```

## Import/Export Settings

### Exporting Configuration

1. Go to Settings
2. Click **Export Configuration**
3. Save the downloaded JSON file
4. Sensitive data (tokens) are automatically redacted

**Use Cases**:
- Backup before major changes
- Share non-sensitive settings with team
- Template for similar repositories

### Importing Configuration

1. Click **Import Configuration**
2. Select exported JSON file
3. Review settings before saving
4. Add tokens manually (they're not imported for security)

**Notes**:
- Current tokens are preserved
- Settings are merged with defaults
- Invalid settings are rejected

## Troubleshooting Configuration

### Common Issues

**"Repository not found"**
- Check owner/repo spelling
- Verify repository exists and is accessible
- Ensure token has proper permissions

**"Invalid token"**
- Regenerate token with correct scopes
- Check token hasn't expired
- Verify token format (starts with `ghp_`)

**"No issues found"**
- Try simpler search: `is:open is:issue`
- Check if all issues are already groomed/excluded
- Verify workflow exclusion settings

**Labels not loading**
- Test GitHub connection first
- Check repository permissions
- Try refreshing the page

### Reset to Defaults

If settings become corrupted:

1. Go to Settings
2. Click **Reset to Defaults** (bottom of page)
3. Confirm the reset
4. Reconfigure from scratch

This will delete all saved settings and cannot be undone.