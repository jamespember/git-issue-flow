# Search Syntax Guide

Git Issue Flow uses GitHub's powerful search syntax to find and filter issues. This guide covers the most useful search patterns for efficient backlog grooming.

## Table of Contents

- [Basic Search](#basic-search)
- [Search Qualifiers](#search-qualifiers)
- [Advanced Patterns](#advanced-patterns)
- [Common Grooming Queries](#common-grooming-queries)
- [Search Tips](#search-tips)
- [Troubleshooting Searches](#troubleshooting-searches)

## Basic Search

### Simple Text Search

Search for issues containing specific words:

```
bug login
```
Finds issues with both "bug" and "login" in title or description.

```
"exact phrase"
```
Use quotes for exact phrase matching.

```
authentication OR authorization
```
Find issues with either term (use capital OR).

```
feature -deprecated
```
Find "feature" but exclude "deprecated" (use minus sign).

## Search Qualifiers

GitHub search qualifiers help you filter issues by specific criteria.

### Issue State

```
is:open
```
Only open issues (default behavior).

```
is:closed
```
Only closed issues.

```
is:merged
```
Only merged pull requests (not applicable to issues).

### Issue Type

```
is:issue
```
Only issues (excludes pull requests).

```
is:pr
```
Only pull requests.

### Labels

```
label:bug
```
Issues with the "bug" label.

```
label:"needs review"
```
Use quotes for labels with spaces.

```
-label:wontfix
```
Exclude issues with "wontfix" label.

```
label:bug,enhancement
```
Issues with either "bug" OR "enhancement" labels.

### Author and Assignee

```
author:username
```
Issues created by specific user.

```
assignee:username
```
Issues assigned to specific user.

```
no:assignee
```
Unassigned issues.

```
mentions:username
```
Issues mentioning specific user.

### Dates

```
created:>2024-01-01
```
Issues created after January 1, 2024.

```
updated:<2024-01-01
```
Issues updated before January 1, 2024.

```
created:2024-01-01..2024-01-31
```
Issues created in January 2024.

```
updated:>2024-01-01
```
Recently updated issues.

### Comments and Reactions

```
comments:>5
```
Issues with more than 5 comments.

```
comments:0
```
Issues with no comments.

```
reactions:>10
```
Issues with more than 10 reactions.

### Size and Complexity

```
milestone:"Sprint 1"
```
Issues in specific milestone.

```
project:"Project Name"
```
Issues in specific project board.

## Advanced Patterns

### Combining Qualifiers

```
is:open is:issue label:bug assignee:username
```
Open bug issues assigned to specific user.

```
is:open is:issue -label:duplicate -label:wontfix created:>2024-01-01
```
Recent open issues excluding duplicates and won't-fix items.

### Regular Expressions

GitHub search supports limited regex patterns:

```
/^fix/
```
Issues starting with "fix".

```
/bug$/
```
Issues ending with "bug".

### Wildcards

```
test*
```
Words starting with "test" (testing, tests, etc.).

## Common Grooming Queries

Here are proven search patterns for different grooming scenarios:

### New Issues to Triage

```
is:open is:issue -label:triaged -label:duplicate -label:wontfix created:>2024-01-01
```
Recent issues that haven't been triaged yet.

### High-Impact Bugs

```
is:open is:issue label:bug comments:>3 reactions:>5
```
Popular bugs with community engagement.

### Stale Issues

```
is:open is:issue updated:<2023-01-01
```
Issues not updated in over a year.

### Feature Requests to Review

```
is:open is:issue label:enhancement -label:approved -label:rejected
```
Feature requests awaiting product decision.

### Ready for Development

```
is:open is:issue label:ready -label:blocked no:assignee
```
Issues ready for pickup by developers.

### Customer-Reported Issues

```
is:open is:issue label:customer author:support-bot
```
Issues reported through customer support.

### Security Issues

```
is:open is:issue label:security label:vulnerability
```
Security-related issues requiring attention.

### Documentation Needs

```
is:open is:issue label:documentation -label:help-wanted
```
Documentation tasks not yet marked for community.

## Search Tips

### Start Simple

Begin with basic queries and add complexity:

1. Start: `is:open is:issue`
2. Add: `is:open is:issue label:bug`
3. Refine: `is:open is:issue label:bug -label:duplicate`

### Use Exclusions Effectively

Git Issue Flow automatically excludes issues based on your configuration, but you can add more:

```
is:open is:issue -label:dependencies -label:blocked -label:external
```

### Search by Activity

Find issues needing attention:

```
is:open is:issue comments:0 created:<2024-06-01
```
Old issues with no discussion.

```
is:open is:issue updated:<2024-01-01 comments:>2
```
Stale issues with previous activity.

### Team-Specific Searches

```
is:open is:issue label:frontend assignee:frontend-team
```
Issues for specific team.

```
is:open is:issue milestone:"Q1 2024" -assignee:*
```
Unassigned milestone issues.

### Performance Optimization

For large repositories:

```
is:open is:issue sort:updated-desc
```
Sort by most recently updated first.

```
is:open is:issue created:>2024-01-01
```
Limit to recent issues to improve performance.

## Troubleshooting Searches

### No Results Found

**Check for typos:**
- Verify label names match exactly
- Check date formats (YYYY-MM-DD)
- Ensure usernames are correct

**Simplify the query:**
- Remove some qualifiers
- Try broader date ranges
- Test with basic `is:open is:issue`

**Verify repository has issues:**
- Check if issues are enabled
- Confirm issues exist for your criteria
- Try searching in GitHub directly

### Too Many Results

**Add more filters:**
```
is:open is:issue label:bug created:>2024-01-01 -label:duplicate
```

**Use date ranges:**
```
is:open is:issue updated:2024-01-01..2024-01-31
```

**Exclude common labels:**
```
is:open is:issue -label:help-wanted -label:good-first-issue
```

### Unexpected Results

**Check automatic exclusions:**
Git Issue Flow excludes issues based on your workflow settings:
- Priority labels (if "Exclude Prioritized" enabled)
- Groomed labels (if "Exclude Groomed" enabled)
- Dependency labels (if "Exclude Dependencies" enabled)

**Review configuration:**
- Go to Settings > Workflow
- Temporarily disable exclusions to see all results
- Adjust label configurations if needed

### Search Limitations

**GitHub API limits:**
- Maximum 1000 results per search
- Complex queries may timeout
- Some searches require authentication

**Indexing delays:**
- New issues may not appear immediately
- Updates can take a few minutes to index
- Deleted issues may still appear briefly

## Advanced Use Cases

### Release Planning

```
is:open is:issue milestone:"v2.0" label:enhancement sort:reactions-desc
```
Popular features for next release.

### Bug Triage

```
is:open is:issue label:bug -label:confirmed sort:created-desc
```
New bugs needing confirmation.

### Community Management

```
is:open is:issue author:external-contributor no:assignee
```
Community contributions needing review.

### Technical Debt

```
is:open is:issue label:tech-debt label:refactor -label:blocked
```
Technical debt issues ready for work.

Remember: The search syntax is powerful but can be complex. Start simple and build up your queries iteratively. Use Git Issue Flow's workflow settings to handle common exclusions automatically.