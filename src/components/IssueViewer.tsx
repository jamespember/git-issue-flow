import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitHubIssue } from '../types/github';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';
import LabelManager from './LabelManager';
import { ChevronLeft, ChevronRight, ChevronDown, Check, Clock, Calendar, X } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { aiService } from '../services/aiService';
import { ConfigService } from '../services/configService';

type IssueViewerProps = {
  issue: GitHubIssue;
  issueNumber: number;
  totalIssues: number;
};

const IssueViewer: React.FC<IssueViewerProps> = ({ 
  issue, 
  issueNumber,
  totalIssues
}) => {
  const [editMode, setEditMode] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(issue?.body ?? '');
  const [editTitleMode, setEditTitleMode] = useState(false);
  const [titleContent, setTitleContent] = useState(issue?.title ?? '');
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | { type: 'setPriority', value: 'high' | 'medium' | 'low' }>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiLoading, setAILoading] = useState(false);
  const [aiFormatted, setAIFormatted] = useState('');
  const [showRewriteModal, setShowRewriteModal] = useState(false);
  const [rewritePrompt, setRewritePrompt] = useState('');
  const [rewriteResult, setRewriteResult] = useState('');
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'refreshing' | 'completed'>('idle');
  
  const { nextIssue, prevIssue, setPriority, issues, currentIssueIndex, closeIssueAsNotPlanned, refreshIssues } = useAppStore();
  const updateTitle = useAppStore(s => s.updateIssueTitle);
  
  useEffect(() => {
    if (!issue) return;
    setMarkdownContent(issue.body);
    setEditMode(false);
    setTitleContent(issue.title);
    setEditTitleMode(false);
  }, [issue]);
  
  const getPriority = () => {
    if (!issue) return undefined;
    const config = ConfigService.load();
    const labelNames = issue.labels.map(l => l.name);
    if (labelNames.includes(config.labels.priority.high)) return 'high';
    if (labelNames.includes(config.labels.priority.medium)) return 'medium';
    if (labelNames.includes(config.labels.priority.low)) return 'low';
    return undefined;
  };
  const priority = getPriority();
  
  const hasUnsavedChanges = markdownContent !== issue?.body;
  
  // Global keyboard shortcuts
  useEffect(() => {
    if (!issue) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true')) {
        return;
      }

      // Uncomment for debugging keyboard events
      // console.log('Key pressed:', e.key, { ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey });

      if (e.ctrlKey && e.key === 'e') {
        console.log('Ctrl+E detected, setting edit mode');
        e.preventDefault();
        setEditMode(true);
      } else if (e.ctrlKey && e.key === 's' && editMode) {
        console.log('Ctrl+S detected, saving markdown');
        e.preventDefault();
        useAppStore.getState().updateIssueBody(markdownContent);
        setEditMode(false);
      } else if (e.key === 'Escape' && editMode) {
        // Escape should cancel edit mode, like the Cancel button
        if (hasUnsavedChanges) {
          setShowUnsavedDialog(true);
        } else {
          setEditMode(false);
          setMarkdownContent(issue.body);
        }
      } else if (e.ctrlKey && e.key === 'c') {
        if (!priority) {
          console.log('Ctrl+C detected, but no priority selected. Action blocked.');
          return;
        }
        console.log('Ctrl+C detected, marking as complete');
        e.preventDefault();
        useAppStore.getState().markIssueComplete(issue.number);
      } else if (e.ctrlKey && e.key === 'o') {
        console.log('Ctrl+O detected, opening issue on GitHub');
        e.preventDefault();
        window.open(issue.html_url, '_blank', 'noopener,noreferrer');
      } else if (e.ctrlKey && e.key === 'h') {
        // Ctrl+H sets high priority
        if (editMode && hasUnsavedChanges) {
          setShowUnsavedDialog(true);
          setPendingAction({ type: 'setPriority', value: 'high' });
        } else {
          setPriority(issue.number, 'high');
        }
      } else if (e.ctrlKey && e.key === 'm') {
        // Ctrl+M sets medium priority
        if (editMode && hasUnsavedChanges) {
          setShowUnsavedDialog(true);
          setPendingAction({ type: 'setPriority', value: 'medium' });
        } else {
          setPriority(issue.number, 'medium');
        }
      } else if (e.ctrlKey && e.key === 'l') {
        // Ctrl+L sets low priority
        if (editMode && hasUnsavedChanges) {
          setShowUnsavedDialog(true);
          setPendingAction({ type: 'setPriority', value: 'low' });
        } else {
          setPriority(issue.number, 'low');
        }
      } else if (e.ctrlKey && e.key === 'x') {
        // Ctrl+X closes issue as not planned
        console.log('Ctrl+X detected, closing as not planned');
        e.preventDefault();
        closeIssueAsNotPlanned(issue.number);
      } else if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        // Ctrl+Shift+R refreshes all issues
        console.log('Ctrl+Shift+R detected, refreshing issues');
        e.preventDefault();
        
        setRefreshStatus('refreshing');
        refreshIssues().then((result) => {
          console.log('Refresh completed:', result);
          setRefreshStatus('completed');
          // Reset status after showing completion
          setTimeout(() => setRefreshStatus('idle'), 2000);
        }).catch((error) => {
          console.error('Refresh failed:', error);
          setRefreshStatus('idle');
        });
      } else if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        // Ctrl+Shift+S opens first Slack link
        console.log('Ctrl+Shift+S detected, opening Slack link');
        e.preventDefault();
        openFirstSlackLink();
      }
    };
    console.log('Adding keyboard event listener');
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      console.log('Removing keyboard event listener');
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [editMode, markdownContent, priority, issue?.number, issue?.html_url, setEditMode, setPriority, refreshIssues]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const handleSaveTitle = () => {
    updateTitle(titleContent);
    setEditTitleMode(false);
  };
  
  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      setEditMode(false);
      setMarkdownContent(issue.body);
    }
  };

  const handleDialogSave = () => {
    useAppStore.getState().updateIssueBody(markdownContent);
    setEditMode(false);
    setShowUnsavedDialog(false);
    if (pendingAction && pendingAction.type === 'setPriority') {
      setPriority(issue.number, pendingAction.value);
    }
    setPendingAction(null);
  };
  const handleDialogDiscard = () => {
    setEditMode(false);
    setMarkdownContent(issue.body);
    setShowUnsavedDialog(false);
    if (pendingAction && pendingAction.type === 'setPriority') {
      setPriority(issue.number, pendingAction.value);
    }
    setPendingAction(null);
  };
  const handleDialogContinue = () => {
    setShowUnsavedDialog(false);
    setPendingAction(null);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.issue-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const navigateToIssue = (index: number) => {
    useAppStore.setState({ currentIssueIndex: index });
    setIsDropdownOpen(false);
  };
  
  const handleFormatWithAI = async () => {
    setShowAIModal(true);
    setAILoading(true);
    try {
      const inputText = editMode ? markdownContent : issue.body;
      const formatted = await aiService.formatIssueWithAI(inputText);
      setAIFormatted(formatted);
    } catch (err) {
      console.error('OpenAI formatting error:', err);
      setAIFormatted('Error: Could not format with AI.');
    }
    setAILoading(false);
  };

  const handleApplyAIFormat = () => {
    setMarkdownContent(aiFormatted);
    setShowAIModal(false);
  };

  const handleDismissAIFormat = () => {
    setShowAIModal(false);
  };

  const handleRewriteWithAI = () => {
    setShowRewriteModal(true);
    setRewritePrompt('');
    setRewriteResult('');
  };

  const handleExecuteRewrite = async () => {
    if (!rewritePrompt.trim()) return;
    
    setRewriteLoading(true);
    try {
      const inputText = editMode ? markdownContent : issue.body;
      const rewritten = await aiService.rewriteIssueWithAI(inputText, rewritePrompt);
      setRewriteResult(rewritten);
    } catch (err) {
      console.error('OpenAI rewrite error:', err);
      setRewriteResult('Error: Could not rewrite with AI.');
    }
    setRewriteLoading(false);
  };

  const handleApplyRewrite = () => {
    setMarkdownContent(rewriteResult);
    setShowRewriteModal(false);
  };

  const handleDismissRewrite = () => {
    setShowRewriteModal(false);
  };

  // Extract Slack URLs from issue content
  const getSlackUrls = () => {
    if (!issue) return [];
    const slackUrlRegex = /https?:\/\/[^.\s]*\.?slack\.com\/[^\s)]+/gi;
    const content = `${issue.title} ${issue.body}`;
    return content.match(slackUrlRegex) || [];
  };

  const openFirstSlackLink = () => {
    const slackUrls = getSlackUrls();
    if (slackUrls.length > 0) {
      window.open(slackUrls[0], '_blank');
    }
  };
  
  if (!issue) return null;

  return (
    <motion.div 
      className="rounded-lg overflow-hidden shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 flex justify-between items-center border-b bg-white dark:bg-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {issue.user.login}/{ConfigService.load().github.repo || 'unknown-repo'}
            </span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              #{issue.number}
            </span>
            <a
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-500 hover:underline text-xs"
            >
              View on GitHub
            </a>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {issueNumber} of {totalIssues}
          </span>
          
          {/* Refresh Status Notification */}
          {refreshStatus === 'refreshing' && (
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
              <div className="animate-spin rounded-full h-3 w-3 border-t border-blue-600"></div>
              Refreshing...
            </div>
          )}
          {refreshStatus === 'completed' && (
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-800 text-xs">
              <Check className="w-3 h-3" />
              Refreshed
            </div>
          )}
          
          {/* Issue Dropdown */}
          <div className="relative issue-dropdown">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
              aria-label="Select issue"
            >
              <span>#{issue.number}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
                        {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-96 max-h-80 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                <div className="py-1">
                  {issues.map((issueItem, index) => (
                    <button
                      key={issueItem.id}
                      onClick={() => navigateToIssue(index)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-150 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0 ${
                        index === currentIssueIndex 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                          : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-600 font-mono text-gray-700 dark:text-gray-300 flex-shrink-0 mt-0.5">
                          #{issueItem.number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">
                            {issueItem.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {issueItem.labels.slice(0, 3).map(label => (
                              <span
                                key={label.id}
                                className="inline-block px-1.5 py-0.5 mr-1 rounded text-xs"
                                style={{
                                  backgroundColor: `#${label.color}20`,
                                  color: `#${label.color}`,
                                  border: `1px solid #${label.color}40`
                                }}
                              >
                                {label.name}
                              </span>
                            ))}
                            {issueItem.labels.length > 3 && (
                              <span className="text-gray-400">+{issueItem.labels.length - 3}</span>
                            )}
                          </div>
                        </div>
                        {index === currentIssueIndex && (
                          <div className="flex-shrink-0 text-blue-500 mt-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex">
            <button 
              onClick={() => prevIssue()}
              disabled={issueNumber === 1}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              aria-label="Previous issue"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => nextIssue()}
              disabled={issueNumber === totalIssues}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              aria-label="Next issue"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col md:flex-row gap-8">
        {/* Left column: Title and Issue Content */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold mt-1 flex items-center gap-2">
            {editTitleMode ? (
              <>
                <input
                  className="border rounded px-2 py-1 text-lg font-semibold flex-1"
                  value={titleContent}
                  onChange={e => setTitleContent(e.target.value)}
                  autoFocus
                />
                <button onClick={handleSaveTitle} className="ml-2 px-2 py-1 rounded bg-blue-500 text-white">Save</button>
                <button onClick={() => setEditTitleMode(false)} className="ml-1 px-2 py-1 rounded bg-gray-200">Cancel</button>
              </>
            ) : (
              <>
                <span>{issue.title}</span>
                <button onClick={() => setEditTitleMode(true)} className="ml-2 px-2 py-1 rounded bg-gray-200">Edit Title</button>
              </>
            )}
          </h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Created: {formatDate(issue.created_at)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Updated: {formatDate(issue.updated_at)}
            </div>
          </div>
          <div className="mb-4 mt-4">
            <h3 className="text-lg font-medium mb-2">Issue Content</h3>
            <div className="flex gap-2 mb-2">
              <button
                className="px-3 py-1 rounded bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors text-sm"
                onClick={handleFormatWithAI}
              >
                Format with AI
              </button>
              <button
                className="px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors text-sm"
                onClick={handleRewriteWithAI}
              >
                Rewrite with AI
              </button>
            </div>
            {editMode ? (
              <MarkdownEditor value={markdownContent} onChange={setMarkdownContent} />
            ) : (
              <MarkdownPreview
                markdown={issue.body}
                onAppendToMarkdown={(content) => setMarkdownContent((prev) => prev + content)}
                currentMarkdown={markdownContent}
              />
            )}
            <div className="flex gap-2 mt-2">
              {editMode ? (
                <>
                  <button onClick={handleCancelEdit} className="px-3 py-1 rounded bg-gray-200">Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditMode(true)} className="px-3 py-1 rounded bg-gray-200">Edit</button>
              )}
            </div>
            {/* AI Modal */}
            {showAIModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
                  <h3 className="text-lg font-semibold mb-4">AI-Formatted Issue</h3>
                  {aiLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : (
                    <pre className="bg-gray-100 rounded p-4 mb-4 whitespace-pre-wrap text-sm max-h-64 overflow-auto">{aiFormatted}</pre>
                  )}
                  <div className="flex gap-2 justify-end mt-2">
                    <button onClick={handleDismissAIFormat} className="px-3 py-1 rounded bg-gray-200">Dismiss</button>
                    <button onClick={handleApplyAIFormat} className="px-3 py-1 rounded bg-purple-500 text-white" disabled={aiLoading}>Apply</button>
                  </div>
                </div>
              </div>
            )}

            {/* Rewrite Modal */}
            {showRewriteModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
                  <h3 className="text-lg font-semibold mb-4">Rewrite Issue with AI</h3>
                  
                  {/* Prompt Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rewrite Instructions
                    </label>
                    <textarea
                      value={rewritePrompt}
                      onChange={(e) => setRewritePrompt(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="e.g., Make it more technical, simplify the language, add more detail, change the tone to be more urgent..."
                    />
                  </div>

                  {/* Generate Button */}
                  {!rewriteResult && (
                    <div className="mb-4">
                      <button
                        onClick={handleExecuteRewrite}
                        disabled={!rewritePrompt.trim() || rewriteLoading}
                        className="px-4 py-2 rounded bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {rewriteLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Rewriting...
                          </>
                        ) : (
                          'Generate Rewrite'
                        )}
                      </button>
                    </div>
                  )}

                  {/* Result */}
                  {rewriteResult && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rewritten Issue
                      </label>
                      <pre className="bg-gray-100 rounded p-4 whitespace-pre-wrap text-sm max-h-64 overflow-auto">{rewriteResult}</pre>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-end">
                    <button onClick={handleDismissRewrite} className="px-3 py-1 rounded bg-gray-200">
                      {rewriteResult ? 'Cancel' : 'Close'}
                    </button>
                    {rewriteResult && (
                      <button onClick={handleApplyRewrite} className="px-3 py-1 rounded bg-blue-500 text-white">
                        Apply Rewrite
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Right column: Priority, Labels, Actions */}
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Priority</h3>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(issue.number, p)}
                  className={`px-3 py-1 rounded-md text-sm font-medium capitalize transition-colors ${
                    priority === p
                      ? p === 'high' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : p === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-pressed={priority === p}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Labels</h3>
            <LabelManager issueNumber={issue.number} />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Actions</h3>
            <div className="flex flex-col gap-3">
              <a 
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
              >
                View on GitHub
              </a>
              <button 
                onClick={() => {
                  if (!priority) return;
                  useAppStore.getState().markIssueComplete(issue.number);
                }}
                className={`px-4 py-2 text-sm rounded-md flex items-center justify-center gap-2 transition-colors bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700${!priority ? ' opacity-50 cursor-not-allowed' : ''}`}
                disabled={!priority}
                title={!priority ? 'Select a priority before marking as complete' : ''}
              >
                <Check className="w-4 h-4" />
                Mark as Complete
              </button>
              <button 
                onClick={() => closeIssueAsNotPlanned(issue.number)}
                className="px-4 py-2 text-sm rounded-md flex items-center justify-center gap-2 transition-colors bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                title="Close this issue as not planned"
              >
                <X className="w-4 h-4" />
                Close as Not Planned
              </button>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Keyboard Shortcuts</h3>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800">Alt + ←</kbd> Previous issue</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800">Alt + →</kbd> Next issue</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800">Ctrl + E</kbd> Edit description</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800">Ctrl + S</kbd> Save changes</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800">Ctrl + C</kbd> Mark as complete</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800">Ctrl + O</kbd> Open on GitHub</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800">Ctrl + H</kbd> Set high priority</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800">Ctrl + M</kbd> Set medium priority</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800">Ctrl + L</kbd> Set low priority</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800">Ctrl + X</kbd> Close as not planned</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800">Ctrl + Shift + R</kbd> Refresh all issues</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800">Ctrl + Shift + S</kbd> Open Slack link</li>
            </ul>
          </div>
        </div>
      </div>
      {/* Unsaved changes dialog */}
      {showUnsavedDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Unsaved Changes</h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">You have unsaved changes. What would you like to do?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={handleDialogSave} className="px-3 py-1 rounded bg-blue-500 text-white">Save</button>
              <button onClick={handleDialogDiscard} className="px-3 py-1 rounded bg-red-500 text-white">Discard</button>
              <button onClick={handleDialogContinue} className="px-3 py-1 rounded bg-gray-200">Continue Editing</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default IssueViewer