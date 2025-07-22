import React from 'react';
import { Command, Search } from 'lucide-react';

const EmptyState: React.FC = () => {

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