import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, ExternalLink, X, Sparkles } from 'lucide-react';
import { slackApiService, SlackThread, SlackMessage } from '../services/slackApi';
import { ConfigService } from '../services/configService';

const MARGIN = 12; // px

interface SlackThreadPreviewProps {
  url: string;
  isVisible: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  appendToIssueMarkdown?: (content: string) => void; // New prop
  currentMarkdown?: string; // Add this prop
}

const SlackThreadPreview: React.FC<SlackThreadPreviewProps> = ({
  url,
  isVisible,
  onClose,
  position,
  appendToIssueMarkdown,
  currentMarkdown
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [thread, setThread] = useState<SlackThread | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [summaryAdded, setSummaryAdded] = useState(false);

  useEffect(() => {
    if (isVisible && url) {
      loadThreadPreview();
    }
  }, [isVisible, url]);

  useEffect(() => {
    if (isVisible && position && ref.current) {
      setTimeout(() => {
        const popover = ref.current;
        if (!popover) return;
        const { innerWidth, innerHeight } = window;
        const rect = popover.getBoundingClientRect();
        let left = position.x;
        let top = position.y;
        if (left + rect.width + MARGIN > innerWidth) {
          left = innerWidth - rect.width - MARGIN;
        }
        if (top + rect.height + MARGIN > innerHeight) {
          top = innerHeight - rect.height - MARGIN;
        }
        left = Math.max(MARGIN, left);
        top = Math.max(MARGIN, top);
        setStyle({ left, top });
      }, 0);
    }
  }, [isVisible, position, thread, loading, error]);

  // AI summary effect
  useEffect(() => {
    if (thread && thread.messages.length > 0) {
      setAiSummary(null);
      setAiLoading(true);
      getAiSummary(thread.messages)
        .then((summary) => setAiSummary(summary))
        .catch(() => setAiSummary('AI summary unavailable.'))
        .finally(() => setAiLoading(false));
    }
  }, [thread]);

  const loadThreadPreview = async () => {
    setLoading(true);
    setError(null);
    setThread(null);
    setAiSummary(null);
    setAiLoading(false);
    setSummaryAdded(false); // Reset added state on new preview
    try {
      const threadData = await slackApiService.getThreadPreview(url);
      if (threadData) {
        setThread(threadData);
      } else {
        setError('Unable to load thread preview');
      }
    } catch (err) {
      setError('Failed to load thread preview');
      console.error('Error loading thread preview:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAiSummary = async (messages: SlackMessage[]): Promise<string> => {
    const config = ConfigService.load();
    const apiKey = config.openai?.apiKey;
    if (!apiKey) return 'No OpenAI API key configured in Settings.';
    const prompt = `You are an expert at summarizing Slack bug threads for a backlog groomer. Given the following Slack thread, provide a concise, actionable summary (1-2 sentences) for a groomer. Focus on the main takeaway, whether it is a bug or not, and any clear suggestions (e.g., not a bug, still a bug, hard, easy, etc).\n\nThread:\n${messages.map(m => `- ${m.username || m.user || 'User'}: ${m.text}`).join('\n')}`;
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 120,
          temperature: 0.2
        })
      });
      if (!res.ok) throw new Error('OpenAI API error');
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || 'No summary.';
    } catch (err) {
      return 'AI summary unavailable.';
    }
  };

  const formatTimestamp = (ts: string) => {
    const date = new Date(parseFloat(ts) * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessageText = (text: string) => {
    return slackApiService.formatMessageText(text);
  };

  // Helper: Check if summary already exists in markdown
  const summarySectionHeader = '## Context from Slack thread';
  const summaryExists = currentMarkdown && aiSummary
    ? currentMarkdown.includes(summarySectionHeader) && currentMarkdown.includes(aiSummary)
    : false;

  // Handler to append summary to issue markdown
  const handleAppendSummary = () => {
    if (aiSummary && appendToIssueMarkdown && !summaryAdded && !summaryExists) {
      const section = `\n\n## Context from Slack thread\n\n${aiSummary}\n`;
      appendToIssueMarkdown(section);
      setSummaryAdded(true);
    }
  };

  // Reset summaryAdded when thread or summary changes
  useEffect(() => {
    setSummaryAdded(false);
  }, [thread, aiSummary, isVisible]);

  // Click outside to close
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add a small delay to prevent immediate closing when the popover first opens
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          zIndex: 9999,
          left: style.left,
          top: style.top,
          maxWidth: 400,
          maxHeight: '70vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          borderRadius: 8,
          background: 'white',
        }}
        className="your-popover-class"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-sm">Slack Thread Preview</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* AI Summary */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="font-semibold text-sm text-gray-700">AI Summary</span>
          </div>
          <div className="bg-purple-50 text-purple-900 rounded p-2 text-sm min-h-[32px] mb-2">
            {aiLoading ? (
              <span className="animate-pulse text-gray-400">Generating summary...</span>
            ) : (
              aiSummary
            )}
          </div>
          {appendToIssueMarkdown && (
            <button
              className="px-3 py-1 rounded bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={handleAppendSummary}
              disabled={aiLoading || !aiSummary || summaryAdded || summaryExists}
              title={summaryExists ? 'Summary already added to ticket' : undefined}
            >
              {summaryAdded || summaryExists ? (
                <>
                  <span>{summaryExists ? 'Already added' : 'Added!'}</span>
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </>
              ) : (
                'Add summary to ticket'
              )}
            </button>
          )}
        </div>
        {/* Content */}
        <div>
          {loading && (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading thread...</p>
            </div>
          )}
          {error && (
            <div className="p-6 text-center">
              <p className="text-sm text-red-500 mb-2">{error}</p>
              <p className="text-xs text-gray-500">
                This might be a private channel or the thread is not accessible
              </p>
            </div>
          )}
          {thread && !loading && (
            <div className="p-4">
              {/* Thread Info */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{thread.participant_count} participants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{thread.reply_count} replies</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Channel: #{thread.channel_name || thread.channel}
                </div>
              </div>
              {/* Messages */}
              <div className="space-y-3">
                {thread.messages.slice(0, 10).map((message: SlackMessage, idx: number) => (
                  <div key={message.ts} className="border-l-2 border-gray-200 dark:border-gray-600 pl-3">
                    <div className="flex items-start gap-2 mb-1">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {message.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {message.username || 'User'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(message.ts)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {formatMessageText(message.text)}
                        </p>
                        {/* Show reactions for the parent message only */}
                        {idx === 0 && message.reactions && message.reactions.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {message.reactions.map((reaction: any) => (
                              <span
                                key={reaction.name}
                                className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full text-sm"
                                title={reaction.name}
                              >
                                <span className="mr-1">{`:${reaction.name}:`}</span>
                                <span>{reaction.count}</span>
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Render images from attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.attachments.map((att, i) => (
                              <React.Fragment key={i}>
                                {att.thumb_url && (
                                  <a href={att.image_url || att.thumb_url} target="_blank" rel="noopener noreferrer">
                                    <img src={att.thumb_url} alt={att.title || 'Slack attachment thumbnail'} className="max-h-20 rounded border shadow" />
                                  </a>
                                )}
                                {!att.thumb_url && att.image_url && (
                                  <a href={att.image_url} target="_blank" rel="noopener noreferrer">
                                    <img src={att.image_url} alt={att.title || 'Slack attachment image'} className="max-h-40 rounded border shadow" />
                                  </a>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                        {/* Render images from files */}
                        {message.files && message.files.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.files.filter(f => f.mimetype && f.mimetype.startsWith('image/')).map((file, i) => {
                              const isSlackFile = file.url_private.startsWith('https://files.slack.com/');
                              
                              if (isSlackFile) {
                                // For Slack files, we need to proxy through our secure endpoint
                                // This is a simplified approach - in production you'd want to implement blob URL creation
                                return (
                                  <div key={i} className="text-sm text-gray-600 p-2 border rounded">
                                    📎 {file.title || file.name || 'Slack Image'} 
                                    <br />
                                    <span className="text-xs">Image preview requires direct Slack access</span>
                                  </div>
                                );
                              }
                              
                              // For non-Slack files, display directly
                              const proxyUrl = file.thumb_360 || file.url_private;
                              const fullProxyUrl = file.url_private;
                              return (
                                <a key={i} href={fullProxyUrl} target="_blank" rel="noopener noreferrer">
                                  <img src={proxyUrl} alt={file.title || file.name || 'Image'} className="max-h-40 rounded border shadow" />
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {thread.messages.length > 10 && (
                  <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                    ... and {thread.messages.length - 10} more messages
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Slack
                </a>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default SlackThreadPreview; 