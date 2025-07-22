import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from './store/appStore';
import Navigation from './components/Navigation';
import BacklogHealth from './components/BacklogHealth';
import IssueViewer from './components/IssueViewer';
import IssueNavigator from './components/IssueNavigator';
import EmptyState from './components/EmptyState';
import CommandK from './components/CommandK';
import Settings from './components/Settings';
import ConfigurationBanner from './components/ConfigurationBanner';

function App() {
  const [isCommandKOpen, setIsCommandKOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'grooming' | 'health' | 'settings'>('grooming');
  
  const { 
    issues, 
    currentIssueIndex, 
    fetchStatus
  } = useAppStore();



  // Command K keyboard shortcut and external triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandKOpen(true);
      }
    };

    const handleOpenCommandK = () => {
      setIsCommandKOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('openCommandK', handleOpenCommandK);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('openCommandK', handleOpenCommandK);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1">
        {currentView === 'health' ? (
          <BacklogHealth />
        ) : currentView === 'settings' ? (
          <Settings />
        ) : (
          <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
            <ConfigurationBanner onGoToSettings={() => setCurrentView('settings')} />
            <AnimatePresence mode="wait">
              {fetchStatus === 'loading' && (
                <div className="flex items-center justify-center h-[80vh]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              {fetchStatus === 'error' && (
                <div className="flex items-center justify-center h-[80vh]">
                  <div className="text-center p-8 rounded-lg bg-red-50 text-red-600 max-w-md">
                    <h3 className="text-lg font-medium mb-2">Error loading issues</h3>
                    <p className="mb-4">There was a problem connecting to GitHub. This could be due to:</p>
                    <ul className="text-sm text-left mb-4 space-y-1">
                      <li>• Invalid or expired access token</li>
                      <li>• Incorrect repository configuration</li>
                      <li>• Network connectivity issues</li>
                      <li>• GitHub API rate limiting</li>
                    </ul>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setCurrentView('settings')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Check Settings
                      </button>
                      <div className="text-sm text-gray-600">
                        Or press <kbd className="px-1.5 py-0.5 text-xs bg-white border rounded">⌘K</kbd> / <kbd className="px-1.5 py-0.5 text-xs bg-white border rounded">Ctrl+K</kbd> to try again
                      </div>
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
                <EmptyState onGoToSettings={() => setCurrentView('settings')} />
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