import { Issue } from '../store/appStore';

export const mockIssues: Issue[] = [
  {
    id: 'issue-1',
    number: 1234,
    title: 'Add support for dark mode in the dashboard',
    body: '## Description\nUsers have requested a dark mode option for the dashboard to reduce eye strain when using the application at night.\n\n## Acceptance Criteria\n- [ ] Add toggle in user settings\n- [ ] Create dark color palette\n- [ ] Implement dark mode styles\n- [ ] Save preference to user profile\n\n## Technical Notes\nConsider using CSS variables for theme switching.',
    labels: [
      { id: 'label-1', name: 'enhancement', color: '84b6eb' },
      { id: 'label-2', name: 'frontend', color: '5319e7' }
    ],
    url: 'https://github.com/org/repo/issues/1234',
    repository: {
      name: 'dashboard',
      owner: 'orgname'
    },
    completed: false
  },
  {
    id: 'issue-2',
    number: 1235,
    title: 'API returns 500 error when filtering by date range',
    body: '## Description\nWhen users filter the transactions by date range, the API sometimes returns a 500 error.\n\n## Steps to Reproduce\n1. Go to Transactions page\n2. Set date filter to last month\n3. Click Apply\n\n## Expected Behavior\nTransactions should be filtered correctly\n\n## Actual Behavior\nAPI error appears and no results are shown',
    labels: [
      { id: 'label-3', name: 'bug', color: 'd73a4a' },
      { id: 'label-4', name: 'backend', color: '0e8a16' }
    ],
    url: 'https://github.com/org/repo/issues/1235',
    repository: {
      name: 'api',
      owner: 'orgname'
    },
    completed: false
  },
  {
    id: 'issue-3',
    number: 1236,
    title: 'Improve onboarding flow for new users',
    body: '## Description\nThe current onboarding process has a high drop-off rate. We need to streamline the experience to improve conversion.\n\n## Proposed Changes\n- Reduce number of steps from 5 to 3\n- Add progress indicator\n- Allow skipping optional information\n- Add tooltips for complex fields\n\n## Success Metrics\n- Increase completion rate by 15%\n- Reduce time to complete by 30%',
    labels: [
      { id: 'label-5', name: 'UX', color: 'fbca04' },
      { id: 'label-6', name: 'high priority', color: 'b60205' }
    ],
    url: 'https://github.com/org/repo/issues/1236',
    repository: {
      name: 'frontend',
      owner: 'orgname'
    },
    completed: false
  },
  {
    id: 'issue-4',
    number: 1237,
    title: 'Update documentation for API v2 endpoints',
    body: '## Description\nThe API v2 was released last month, but the documentation still references v1 endpoints in several places.\n\n## Tasks\n- [ ] Update authentication docs\n- [ ] Update user endpoints\n- [ ] Update transaction endpoints\n- [ ] Add migration guide\n- [ ] Update code examples\n\n## Notes\nThis is blocking external developers from adopting the new API.',
    labels: [
      { id: 'label-7', name: 'documentation', color: '0075ca' },
      { id: 'label-8', name: 'good first issue', color: '7057ff' }
    ],
    url: 'https://github.com/org/repo/issues/1237',
    repository: {
      name: 'docs',
      owner: 'orgname'
    },
    completed: false
  },
  {
    id: 'issue-5',
    number: 1238,
    title: 'Implement rate limiting for public API',
    body: '## Description\nWe need to implement rate limiting for our public API to prevent abuse and ensure fair usage.\n\n## Requirements\n- Add rate limiting middleware\n- Set different limits for authenticated vs unauthenticated requests\n- Add proper headers to responses (X-RateLimit-Limit, X-RateLimit-Remaining)\n- Log rate limit exceeded events\n\n## Technical Approach\nConsider using Redis for tracking request counts.',
    labels: [
      { id: 'label-9', name: 'security', color: 'd93f0b' },
      { id: 'label-10', name: 'api', color: '0e8a16' }
    ],
    url: 'https://github.com/org/repo/issues/1238',
    repository: {
      name: 'api',
      owner: 'orgname'
    },
    completed: false
  },
  {
    id: 'issue-6',
    number: 1239,
    title: 'Fix accessibility issues in form components',
    body: '## Description\nOur recent accessibility audit identified several issues with form components:\n\n1. Input fields missing proper labels\n2. Color contrast issues on validation errors\n3. Form submission doesn\'t announce results to screen readers\n\n## Acceptance Criteria\n- [ ] All form elements should have proper labels and ARIA attributes\n- [ ] Color contrast should meet WCAG AA standards\n- [ ] Form submissions should have proper announcements for screen readers\n- [ ] All interactive elements should be keyboard navigable',
    labels: [
      { id: 'label-11', name: 'accessibility', color: '0075ca' },
      { id: 'label-12', name: 'frontend', color: '5319e7' }
    ],
    url: 'https://github.com/org/repo/issues/1239',
    repository: {
      name: 'components',
      owner: 'orgname'
    },
    completed: false
  },
  {
    id: 'issue-7',
    number: 1240,
    title: 'Optimize database queries for reports page',
    body: '## Description\nThe reports page is taking too long to load (avg 8s) due to inefficient database queries.\n\n## Performance Issues\n1. N+1 query problem when fetching report data\n2. Missing indexes on frequently filtered columns\n3. No caching for common report configurations\n\n## Acceptance Criteria\n- [ ] Page load time reduced to under 2 seconds\n- [ ] Optimize all database queries\n- [ ] Add appropriate indexes\n- [ ] Implement caching for report results',
    labels: [
      { id: 'label-13', name: 'performance', color: '0e8a16' },
      { id: 'label-14', name: 'database', color: '1d76db' }
    ],
    url: 'https://github.com/org/repo/issues/1240',
    repository: {
      name: 'backend',
      owner: 'orgname'
    },
    completed: false
  },
  {
    id: 'issue-8',
    number: 1241,
    title: 'Add multi-factor authentication option',
    body: '## Description\nEnhance security by adding multi-factor authentication (MFA) options for user accounts.\n\n## Requirements\n- [ ] Support TOTP authentication (Google Authenticator, Authy)\n- [ ] Add SMS verification option\n- [ ] Create recovery codes mechanism\n- [ ] Update user settings to manage MFA\n- [ ] Add documentation for users\n\n## Security Considerations\n- Store TOTP secrets securely\n- Rate limit verification attempts\n- Allow backup methods for access recovery',
    labels: [
      { id: 'label-15', name: 'security', color: 'd93f0b' },
      { id: 'label-16', name: 'authentication', color: 'c5def5' }
    ],
    url: 'https://github.com/org/repo/issues/1241',
    repository: {
      name: 'auth',
      owner: 'orgname'
    },
    completed: false
  },
  {
    id: 'issue-9',
    number: 1242,
    title: 'Create automated email for user inactivity',
    body: '## Description\nWe need to implement an automated email that gets sent to users who haven\'t logged in for 30 days.\n\n## Requirements\n- [ ] Design email template\n- [ ] Set up scheduled task to check for inactive users\n- [ ] Implement email sending logic\n- [ ] Add analytics tracking for email opens and subsequent logins\n- [ ] Create admin dashboard to monitor effectiveness\n\n## Metrics\n- Target 10% increase in re-engagement from inactive users',
    labels: [
      { id: 'label-17', name: 'email', color: 'c2e0c6' },
      { id: 'label-18', name: 'automation', color: 'fbca04' }
    ],
    url: 'https://github.com/org/repo/issues/1242',
    repository: {
      name: 'marketing',
      owner: 'orgname'
    },
    completed: false
  },
  {
    id: 'issue-10',
    number: 1243,
    title: 'Implement infinite scrolling for activity feed',
    body: '## Description\nReplace pagination with infinite scrolling on the activity feed to improve user experience.\n\n## Requirements\n- [ ] Add infinite scroll behavior to activity feed\n- [ ] Implement efficient data loading (fetch only what\'s needed)\n- [ ] Add loading indicators\n- [ ] Ensure keyboard accessibility is maintained\n- [ ] Handle error states gracefully\n\n## Technical Notes\nConsider using Intersection Observer API for scroll detection.',
    labels: [
      { id: 'label-19', name: 'enhancement', color: '84b6eb' },
      { id: 'label-20', name: 'frontend', color: '5319e7' }
    ],
    url: 'https://github.com/org/repo/issues/1243',
    repository: {
      name: 'frontend',
      owner: 'orgname'
    },
    completed: false
  }
];