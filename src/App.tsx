import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from './store/appStore';
import Navigation from './components/Navigation';
import BacklogHealth from './components/BacklogHealth';
import IssueViewer from './components/IssueViewer';
import IssueNavigator from './components/IssueNavigator';
import EmptyState from './components/EmptyState';
import CommandK from './components/CommandK';

function App() {
  const [isCommandKOpen, setIsCommandKOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'grooming' | 'health'>('grooming');
  
  const { 
    issues, 
    currentIssueIndex, 
    fetchStatus
  } = useAppStore();



  // Command K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandKOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1">
        {currentView === 'health' ? (
          <BacklogHealth />
        ) : (
          <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              {fetchStatus === 'loading' && (
                <div className="flex items-center justify-center h-[80vh]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              {fetchStatus === 'error' && (
                <div className="flex items-center justify-center h-[80vh]">
                  <div className="text-center p-8 rounded-lg bg-red-50 text-red-600">
                    <h3 className="text-lg font-medium mb-2">Error loading issues</h3>
                    <p className="mb-4">There was a problem connecting to GitHub. Please check your connection and try searching again.</p>
                    <div className="text-sm text-gray-600">
                      Press <kbd className="px-1.5 py-0.5 text-xs bg-white border rounded">⌘K</kbd> or <kbd className="px-1.5 py-0.5 text-xs bg-white border rounded">Ctrl+K</kbd> to search for issues
                    </div>
                  </div>
                </div>
              )}
              {fetchStatus === 'success' && issues.length > 0 && (
                <AnimatePresence mode="wait">
                  <IssueViewer
                    key={issues[currentIssueIndex]?.id}
                    issue={issues[currentIssueIndex]}
                    issueNumber={currentIssueIndex + 1}
                    totalIssues={issues.length}
                  />
                </AnimatePresence>
              )}
              {fetchStatus === 'success' && issues.length === 0 && (
                <EmptyState />
              )}
            </AnimatePresence>
            {fetchStatus === 'success' && issues.length > 0 && (
              <IssueNavigator />
            )}
          </div>
        )}
      </main>
      
      {/* Command K Modal */}
      <CommandK 
        isOpen={isCommandKOpen} 
        onClose={() => setIsCommandKOpen(false)} 
      />
    </div>
  );
}

export default App;