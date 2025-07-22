import React, { useState } from 'react';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const Header: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshFeedback, setRefreshFeedback] = useState<string | null>(null);
  const { issues, refreshIssues } = useAppStore();

  const handleRefresh = async () => {
    if (issues.length === 0) {
      setRefreshFeedback('No issues to refresh');
      setTimeout(() => setRefreshFeedback(null), 2000);
      return;
    }

    setIsRefreshing(true);
    setRefreshFeedback(null);

    try {
      const result = await refreshIssues();
      const feedback = [];
      if (result.removed > 0) feedback.push(`${result.removed} closed`);
      if (result.updated > 0) feedback.push(`${result.updated} updated`);
      if (result.errors > 0) feedback.push(`${result.errors} errors`);
      
      if (feedback.length > 0) {
        setRefreshFeedback(feedback.join(', '));
      } else {
        setRefreshFeedback('No changes');
      }
    } catch (error) {
      setRefreshFeedback('Refresh failed');
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setRefreshFeedback(null), 3000);
    }
  };

  return (
    <header className="py-4 px-6 shadow-sm bg-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold">GitIssueFlow</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {refreshFeedback && (
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {refreshFeedback}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || issues.length === 0}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isRefreshing || issues.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
            title={issues.length === 0 ? 'No issues to refresh' : 'Refresh all issues from GitHub'}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;