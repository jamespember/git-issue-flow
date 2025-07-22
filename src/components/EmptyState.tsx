import React from 'react';
import { Command, Search, Settings } from 'lucide-react';
import { ConfigService } from '../services/configService';

interface EmptyStateProps {
  onGoToSettings?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onGoToSettings }) => {
  const isConfigured = ConfigService.isConfigured();

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 bg-white rounded-lg shadow-lg text-center">
        <Settings className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Configuration Required</h2>
        
        <p className="text-gray-600 mb-6 max-w-md">
          Please configure your GitHub repository and access token to start managing issues.
        </p>
        
        {onGoToSettings && (
          <button
            onClick={onGoToSettings}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Settings className="w-5 h-5" />
            Open Settings
          </button>
        )}
        
        <div className="mt-6 text-sm text-gray-500 max-w-md">
          You'll need a GitHub Personal Access Token with 'repo' scope to access your repository's issues.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 bg-white rounded-lg shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-2">Ready to Start Grooming?</h2>
      
      <p className="text-gray-600 mb-6 max-w-md">
        Use Command K to search and load issues from GitHub.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Command className="w-5 h-5 text-blue-500" />
          <span className="text-lg font-semibold">Press</span>
          <kbd className="px-2 py-1 text-sm font-mono bg-white border rounded shadow">⌘K</kbd>
          <span className="text-lg font-semibold">or</span>
          <kbd className="px-2 py-1 text-sm font-mono bg-white border rounded shadow">Ctrl+K</kbd>
        </div>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Search className="w-4 h-4" />
          <span className="text-sm">Search & load GitHub issues</span>
        </div>
      </div>
      
      <div className="text-sm text-gray-500">
        Search by labels, dates, or any GitHub query syntax
      </div>
    </div>
  );
};

export default EmptyState;