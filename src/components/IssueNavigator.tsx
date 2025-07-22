import React, { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const IssueNavigator: React.FC = () => {
  const { 
    issues,
    currentIssueIndex,
    nextIssue,
    prevIssue
  } = useAppStore();
  
  // Add keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'ArrowRight') {
        nextIssue();
      } else if (e.altKey && e.key === 'ArrowLeft') {
        prevIssue();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextIssue, prevIssue]);
  
  return (
    <div className="flex justify-between items-center mt-6 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <button
        onClick={() => prevIssue()}
        disabled={currentIssueIndex === 0}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>
      
      <div className="flex items-center gap-1">
        {issues.map((issue, index) => (
          <button
            key={issue.id}
            onClick={() => useAppStore.setState({ currentIssueIndex: index })}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentIssueIndex
                ? 'bg-blue-500 w-4'
                : issue.state === 'closed'
                ? 'bg-green-500'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            aria-label={`Go to issue ${index + 1}`}
          />
        ))}
      </div>
      
      <button
        onClick={() => nextIssue()}
        disabled={currentIssueIndex === issues.length - 1}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default IssueNavigator;