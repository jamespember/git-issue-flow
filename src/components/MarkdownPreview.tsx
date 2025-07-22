import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { isSlackWebUrl, openSlackUrl } from '../utils/slackUtils';
import SlackThreadPreview from './SlackThreadPreview';

type MarkdownPreviewProps = {
  markdown: string;
  onAppendToMarkdown?: (content: string) => void; // New prop
  currentMarkdown?: string; // Pass the current markdown for duplicate check
};

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ markdown, onAppendToMarkdown, currentMarkdown }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="p-4 border rounded-md overflow-auto max-h-[400px] prose dark:prose-invert prose-sm prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 dark:border-gray-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: (props) => {
            if (props.src?.startsWith('https://github.com/') && props.src.includes('/assets/')) {
              return (
                <a
                  href={props.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  [View image on GitHub]
                </a>
              );
            }
            return <img {...props} className="max-w-full rounded shadow" alt={props.alt || ''} />;
          },
          a: (props) => {
            const { href, children, ...rest } = props;
            if (href && isSlackWebUrl(href)) {
              return (
                <span className="inline-flex items-center gap-1">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setPreviewPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
                      setPreviewUrl(href);
                    }}
                    onMouseLeave={() => {
                      setTimeout(() => setPreviewUrl(null), 300);
                    }}
                    {...rest}
                  >
                    {children}
                  </a>
                  <button
                    onClick={() => openSlackUrl(href)}
                    className="px-1.5 py-0.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    title="Open in Slack Desktop App"
                  >
                    📱
                  </button>
                </span>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
                {...rest}
              >
                {children}
              </a>
            );
          }
        }}
      >
        {markdown}
      </ReactMarkdown>
      
      {/* Slack Thread Preview */}
      <SlackThreadPreview
        url={previewUrl || ''}
        isVisible={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        position={previewPosition || undefined}
        appendToIssueMarkdown={onAppendToMarkdown}
        currentMarkdown={currentMarkdown}
      />
    </div>
  );
};

export default MarkdownPreview;