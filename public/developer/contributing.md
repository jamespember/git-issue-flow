# Contributing Guide

Welcome to the Git Issue Flow project! This guide will help you set up your development environment and contribute effectively to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git** for version control
- A **GitHub account** for contributing
- A modern **code editor** (VS Code recommended)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/git-issue-flow.git
   cd git-issue-flow
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/jamespember/git-issue-flow.git
   ```

## Development Setup

### Install Dependencies

```bash
npm install
```

### Environment Configuration

1. **Copy environment template**:
   ```bash
   cp .env.example .env.local
   ```

2. **Configure environment variables** (optional):
   ```
   VITE_GITHUB_TOKEN=your_github_token_here
   VITE_SLACK_BOT_TOKEN=your_slack_token_here
   VITE_OPENAI_API_KEY=your_openai_key_here
   ```

   Note: These are optional for development. You can configure tokens through the app's Settings interface.

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Start Slack Proxy (Optional)

If testing Slack integration:

```bash
node slack-proxy.cjs
```

Runs on `http://localhost:3001`.

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── features/       # Feature-specific components
├── services/           # API integration services
├── store/              # State management (Zustand)
├── types/              # TypeScript type definitions
├── config/             # Configuration schemas
├── utils/              # Utility functions
└── assets/             # Static assets

docs/                   # Documentation
├── user-guides/        # User documentation
└── developer/          # Developer documentation

public/                 # Static public assets
```

## Coding Standards

### TypeScript

- **Strict TypeScript**: All code must be properly typed
- **No `any` types**: Use specific types or `unknown`
- **Interface over Type**: Prefer interfaces for object shapes
- **Export types**: Make types available for other modules

```typescript
// Good
interface UserConfig {
  github: GitHubConfig;
  workflow: WorkflowSettings;
}

// Avoid
const config: any = { ... };
```

### React Patterns

**Functional Components with Hooks:**
```typescript
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<StateType>(initialValue);
  
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  return <div>{/* JSX */}</div>;
};
```

**Props Interface:**
```typescript
interface ComponentProps {
  required: string;
  optional?: number;
  callback: (value: string) => void;
}
```

**Event Handlers:**
```typescript
const handleClick = useCallback((event: React.MouseEvent) => {
  // Handler logic
}, [dependencies]);
```

### Styling Guidelines

**Tailwind CSS Classes:**
- Use semantic class ordering: layout, spacing, colors, typography
- Group related classes: `flex items-center justify-between`
- Use consistent spacing scale: `gap-4`, `p-6`, `mb-8`

```tsx
// Good
<div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-sm">
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Action
  </button>
</div>
```

**Responsive Design:**
- Mobile-first approach
- Use breakpoint prefixes: `md:`, `lg:`, `xl:`
- Test on different screen sizes

### File Naming

- **Components**: PascalCase (`UserProfile.tsx`)
- **Services**: camelCase (`githubService.ts`)
- **Types**: PascalCase (`GitHubIssue.ts`)
- **Utils**: camelCase (`dateUtils.ts`)
- **Constants**: UPPER_CASE (`API_ENDPOINTS.ts`)

### Import Organization

```typescript
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 2. Internal services and stores
import { githubService } from '../services/github';
import { useAppStore } from '../store/appStore';

// 3. Types
import { GitHubIssue } from '../types/github';

// 4. Components (internal last)
import Button from './ui/Button';
```

## Testing

### Current Testing Status

The project doesn't currently have a comprehensive test suite, but we welcome contributions to improve test coverage.

### Recommended Testing Approach

**Unit Tests:**
```typescript
// services/github.test.ts
describe('GitHubService', () => {
  it('should construct search query with exclusions', () => {
    // Test implementation
  });
});
```

**Component Tests:**
```typescript
// components/IssueViewer.test.tsx
import { render, screen } from '@testing-library/react';
import IssueViewer from './IssueViewer';

describe('IssueViewer', () => {
  it('should display issue title', () => {
    // Test implementation
  });
});
```

**Integration Tests:**
- Test complete user workflows
- Mock external API calls
- Verify state management

### Testing Tools to Consider

- **Jest** - Test runner
- **React Testing Library** - Component testing
- **MSW** - API mocking
- **Playwright** - E2E testing

## Making Changes

### Branching Strategy

1. **Create feature branch** from main:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Use descriptive branch names**:
   - `feature/slack-integration-improvements`
   - `fix/search-query-encoding`
   - `docs/update-configuration-guide`

### Commit Messages

Follow conventional commit format:

```
type(scope): description

Longer description if needed

Fixes #123
```

**Types:**
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process or auxiliary tool changes

**Examples:**
```bash
git commit -m "feat(search): add advanced GitHub query syntax support"
git commit -m "fix(slack): handle URL parsing for new Slack format"
git commit -m "docs: update Slack integration setup guide"
```

### Code Quality Checks

**Linting:**
```bash
npm run lint
```

**Type Checking:**
```bash
npx tsc --noEmit
```

**Build Test:**
```bash
npm run build
```

## Pull Request Process

### Before Submitting

1. **Update your fork**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   git push origin main
   ```

2. **Rebase your feature branch**:
   ```bash
   git checkout feature/your-feature
   git rebase main
   ```

3. **Test your changes**:
   - Run the development server
   - Test affected functionality
   - Check for console errors
   - Verify responsive design

### PR Guidelines

**Title and Description:**
- Clear, descriptive title
- Explain what changes were made and why
- Reference related issues: "Fixes #123"
- Include screenshots for UI changes

**PR Template:**
```markdown
## Changes Made
- Brief description of changes

## Testing
- How you tested the changes
- Screenshots (for UI changes)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated (if needed)
- [ ] No console errors
```

**Review Process:**
1. Automated checks must pass
2. Code review by maintainers
3. Address feedback and update PR
4. Final approval and merge

### Review Criteria

**Code Quality:**
- Follows coding standards
- Proper TypeScript usage
- No obvious bugs or security issues
- Performance considerations

**Functionality:**
- Feature works as intended
- Edge cases handled
- Error states managed
- Responsive design maintained

**Documentation:**
- Code is self-documenting
- Complex logic explained
- User-facing changes documented

## Documentation

### Code Documentation

**Component Documentation:**
```typescript
/**
 * Displays and manages a single GitHub issue
 * 
 * @param issue - The GitHub issue to display
 * @param onUpdate - Callback when issue is updated
 * @param onClose - Callback when issue is closed
 */
const IssueViewer: React.FC<IssueViewerProps> = ({ 
  issue, 
  onUpdate, 
  onClose 
}) => {
  // Implementation
};
```

**Function Documentation:**
```typescript
/**
 * Constructs GitHub search query with user exclusions
 * 
 * @param baseQuery - Base search terms
 * @param config - User configuration with exclusion rules
 * @returns Complete search query string
 */
function buildSearchQuery(baseQuery: string, config: UserConfig): string {
  // Implementation
}
```

### User Documentation

When adding features, update relevant documentation:

- User guides in `docs/user-guides/`
- Developer documentation in `docs/developer/`
- README.md for significant changes
- CHANGELOG.md for release notes

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on the code, not the person

### Getting Help

- **Questions**: Use GitHub Discussions
- **Bug Reports**: Create detailed GitHub issues
- **Feature Requests**: Discuss in issues first
- **Security Issues**: Report privately to maintainers

### Issue Reporting

**Bug Reports:**
```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce the behavior

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**
- OS: [e.g. macOS, Windows]
- Browser: [e.g. Chrome, Firefox]
- Version: [e.g. 1.0.0]
```

**Feature Requests:**
```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
Clear description of what you want

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Screenshots, mockups, or examples
```

### Recognition

Contributors are recognized in:
- GitHub contributors list
- CHANGELOG.md for significant contributions
- README.md acknowledgments
- Release notes

Thank you for contributing to Git Issue Flow! Your efforts help make GitHub issue management more efficient for product managers everywhere.