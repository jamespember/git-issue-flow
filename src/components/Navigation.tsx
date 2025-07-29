import React, { useState } from 'react';
import { Activity, Target, RefreshCw, Settings, HelpCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
// import { LocaleSwitcher } from "lingo.dev/react/client";

interface NavigationProps {
  currentView: 'grooming' | 'health' | 'settings';
  onViewChange: (view: 'grooming' | 'health' | 'settings') => void;
  onHelpClick: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, onHelpClick }) => {
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
    <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          GitIssueFlow
        </h1>
        
        <div className="flex items-center space-x-4">
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

          <button
            onClick={onHelpClick}
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="Documentation & Help"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help</span>
          </button>
          
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewChange('grooming')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                currentView === 'grooming'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Target className="w-4 h-4 mr-1 inline" />
              Grooming
            </button>
            <button
              onClick={() => onViewChange('health')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                currentView === 'health'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Activity className="w-4 h-4 mr-1 inline" />
              Health
            </button>
            <button
              onClick={() => onViewChange('settings')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                currentView === 'settings'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4 mr-1 inline" />
              Settings
            </button>
          </div>
          
          {/* Temporarily disabled Lingo.dev language switcher
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <LocaleSwitcher locales={["en", "sv"]} />
          </div>
          */}
        </div>
      </div>
    </div>
  );
};

export default Navigation; 