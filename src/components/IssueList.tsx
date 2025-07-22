import React, { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

export const IssueList: React.FC = () => {
  const issues = useAppStore(s => s.issues);
  const fetchStatus = useAppStore(s => s.fetchStatus);
  const loadIssues = useAppStore(s => s.loadIssues);

  useEffect(() => {
    // Optionally, you can pass a batch size or make this dynamic
    loadIssues();
  }, [loadIssues]);

  if (fetchStatus === 'loading') {
    return <div className="p-4">Loading issues...</div>;
  }

  if (fetchStatus === 'error') {
    return <div className="p-4 text-red-500">Error loading issues.</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Issues</h2>
      <div className="space-y-2">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <h3 className="text-lg font-semibold">{issue.title}</h3>
            <div className="flex gap-2 mt-2">
              {issue.labels.map((label) => (
                <span
                  key={label.id}
                  className="px-2 py-1 text-sm rounded-full"
                  style={{
                    backgroundColor: `#${label.color}`,
                    color: parseInt(label.color, 16) > 0x7fffff ? '#000' : '#fff',
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
            <p className="mt-2 text-gray-600">
              #{issue.number} opened by {issue.user.login}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Created: {new Date(issue.created_at).toLocaleString()} | Updated: {new Date(issue.updated_at).toLocaleString()}
            </p>
            <a
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-xs mt-1 inline-block"
            >
              View on GitHub
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}; 