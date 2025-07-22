import React, { useState, useEffect } from 'react';
import { X, Search, Command, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { ConfigService } from '../services/configService';

interface CommandKProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandK: React.FC<CommandKProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [batchSize, setBatchSize] = useState(20);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isLoading, setIsLoading] = useState(false);
  const { searchAndLoadIssues, fetchStatus } = useAppStore();

  // Sample queries for quick use
  const sampleQueries = [
    {
      name: 'Bug reports (ungroomed)',
      query: 'is:open is:issue label:"is: bug" -label:groomed-james'
    },
    {
      name: 'Recent issues (last 30 days)',
      query: `is:open is:issue created:>${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`
    },
    {
      name: 'Older issues (created before this year)',
      query: `is:open is:issue created:<${new Date().getFullYear()}-01-01`
    }
  ];

  useEffect(() => {
    // Only track loading state changes when modal is open
    if (!isOpen) return;
    
    if (fetchStatus === 'loading') {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      // Only close on success if we just finished a search operation while modal was open
      if (fetchStatus === 'success' && isLoading) {
        onClose();
      }
    }
  }, [fetchStatus, onClose, isOpen, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Check if configuration is valid
    if (!ConfigService.isConfigured()) {
      alert('Please configure your GitHub repository and token in Settings first.');
      return;
    }
    
    try {
      // Add sort order to the query
      const sortSuffix = sortOrder === 'oldest' ? ' sort:created-asc' : ' sort:created-desc';
      const queryWithSort = query.trim() + sortSuffix;
      await searchAndLoadIssues(queryWithSort, batchSize);
    } catch (error) {
      console.error('Failed to search issues:', error);
    }
  };

  const handleUseSample = (sampleQuery: string) => {
    setQuery(sampleQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isConfigured = ConfigService.isConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Search & Load Issues</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isConfigured && (
          <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Configuration Required</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Please configure your GitHub repository and access token in Settings before searching for issues.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Search Query
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="is:open is:issue label:&quot;is: bug&quot; -label:groomed-james"
              className={`w-full h-24 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm resize-none ${
                isConfigured 
                  ? 'bg-white text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50' 
                  : 'bg-gray-100 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isConfigured}
              autoFocus={isConfigured}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use GitHub's search syntax. The query will be automatically scoped to {ConfigService.load().github.owner || 'owner'}/{ConfigService.load().github.repo || 'repo'}.
            </p>
          </div>

          <div className="mb-4 flex gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Issues
              </label>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Math.max(1, Math.min(100, parseInt(e.target.value) || 20)))}
                min="1"
                max="100"
                className="w-24 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="text-sm text-gray-500 ml-2">(max 100)</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Templates</h3>
            <div className="space-y-2">
              {sampleQueries.map((sample, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleUseSample(sample.query)}
                  className="w-full text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900">{sample.name}</div>
                  <div className="text-xs text-gray-500 font-mono mt-1">{sample.query}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Search className="w-4 h-4" />
              <span>This will replace your current issue list</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!query.trim() || isLoading || !isConfigured}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  !query.trim() || isLoading || !isConfigured
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? 'Searching...' : 'Search & Load Issues'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommandK; 