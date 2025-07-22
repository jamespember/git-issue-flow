import React, { useState } from 'react';
import { isSlackWebUrl, openSlackUrl } from '../utils/slackUtils';
import SlackThreadPreview from './SlackThreadPreview';

interface IssueFormatterProps {
  markdown: string;
}

// Helper to extract fields and links from markdown
function parseIssueMarkdown(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  let name = '';
  let priority = '';
  let description = '';
  let inDescription = false;
  const links: { label: string; url: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^Name of bug[:\s]/i.test(line)) {
      name = line.replace(/^Name of bug[:\s]*/i, '').trim();
      inDescription = false;
    } else if (/^Priority[:\s]/i.test(line)) {
      priority = line.replace(/^Priority[:\s]*/i, '').trim();
      inDescription = false;
    } else if (/^(Loom|Loom \/ Video recording)[:\s]/i.test(line)) {
      const url = line.replace(/^(Loom|Loom \/ Video recording)[:\s]*/i, '').trim();
      if (url.startsWith('http')) links.push({ label: 'Loom', url });
      inDescription = false;
    } else if (/^Portal link[:\s]/i.test(line)) {
      const url = line.replace(/^Portal link[:\s]*/i, '').trim();
      if (url.startsWith('http')) links.push({ label: 'Portal', url });
      inDescription = false;
    } else if (/^Slack Link[:\s]/i.test(line)) {
      const url = line.replace(/^Slack Link[:\s]*/i, '').trim();
      if (url.startsWith('http')) links.push({ label: 'Slack', url });
      inDescription = false;
    } else if (/^Description[:\s]/i.test(line)) {
      description = line.replace(/^Description[:\s]*/i, '').trim();
      inDescription = true;
    } else if (inDescription) {
      // Continue collecting description until next field or empty line
      if (/^\w+[:\s]/.test(line) && !/^Description[:\s]/i.test(line)) {
        inDescription = false;
      } else {
        description += (description ? '\n' : '') + line;
      }
    }
  }

  return { name, priority, description, links };
}

const IssueFormatter: React.FC<IssueFormatterProps> = ({ markdown }) => {
  const { name, priority, description, links } = parseIssueMarkdown(markdown);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="border rounded-md p-4 bg-gray-50 mb-4">
      <h4 className="font-semibold mb-2">Standardized Issue Summary</h4>
      <div className="mb-2">
        <strong>Name of Bug:</strong> {name || <span className="text-gray-400">Not provided</span>}
      </div>
      <div className="mb-2">
        <strong>Priority:</strong> {priority || <span className="text-gray-400">Not provided</span>}
      </div>
      <div className="mb-2">
        <strong>Description:</strong>
        <div className="ml-2 text-sm text-gray-700 whitespace-pre-line">
          {description || <span className="text-gray-400">Not provided</span>}
        </div>
      </div>
      {links.length > 0 && (
        <div className="mt-4">
          <strong>Links:</strong>
          <ul className="list-disc ml-6 mt-1">
            {links.map((link, idx) => (
              <li key={idx}>
                <span className="font-medium mr-1">{link.label}:</span>
                {link.label === 'Slack' && isSlackWebUrl(link.url) ? (
                  <div className="flex items-center gap-2">
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 underline break-all hover:text-blue-800"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setPreviewPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
                        setPreviewUrl(link.url);
                      }}
                      onMouseLeave={() => {
                        setTimeout(() => setPreviewUrl(null), 300);
                      }}
                    >
                      {link.url}
                    </a>
                    <button
                      onClick={() => openSlackUrl(link.url)}
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      title="Open in Slack Desktop App"
                    >
                      Open in Slack
                    </button>
                  </div>
                ) : (
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{link.url}</a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Slack Thread Preview */}
      <SlackThreadPreview
        url={previewUrl || ''}
        isVisible={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        position={previewPosition || undefined}
      />
    </div>
  );
};

export default IssueFormatter; 