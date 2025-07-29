import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, FileText, Settings as SettingsIcon, Activity, ExternalLink, Search, MessageSquare, AlertTriangle, Code, Book, Users } from 'lucide-react';

interface DocumentationViewerProps {
  onBack: () => void;
}

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  file: string;
  category: 'user' | 'developer';
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: 'configuration',
    title: 'Configuration Guide',
    description: 'Set up GitHub integration, labels, and workflow preferences for your team',
    icon: SettingsIcon,
    file: 'user-guides/configuration.md',
    category: 'user'
  },
  {
    id: 'slack-integration',
    title: 'Slack Integration',
    description: 'Enable Slack thread previews and AI-powered summaries',
    icon: MessageSquare,
    file: 'user-guides/slack-integration.md',
    category: 'user'
  },
  {
    id: 'search-syntax',
    title: 'Search Syntax Guide',
    description: 'Master GitHub search queries for efficient issue filtering',
    icon: Search,
    file: 'user-guides/search-syntax.md',
    category: 'user'
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Common issues and solutions for GitHub and Slack integration',
    icon: AlertTriangle,
    file: 'user-guides/troubleshooting.md',
    category: 'user'
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    description: 'GitHub and Slack service methods, error handling, and rate limiting',
    icon: Code,
    file: 'developer/api-reference.md',
    category: 'developer'
  },
  {
    id: 'architecture',
    title: 'Architecture Guide',
    description: 'Component relationships, state management, and data flow',
    icon: Activity,
    file: 'developer/architecture.md',
    category: 'developer'
  },
  {
    id: 'contributing',
    title: 'Contributing Guide',
    description: 'Development setup, coding standards, and testing procedures',
    icon: Users,
    file: 'developer/contributing.md',
    category: 'developer'
  },
  {
    id: 'configuration-system',
    title: 'Configuration System',
    description: 'How user settings and the config service work internally',
    icon: SettingsIcon,
    file: 'developer/configuration-system.md',
    category: 'developer'
  }
];

const DocumentationViewer: React.FC<DocumentationViewerProps> = ({ onBack }) => {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [docContent, setDocContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'user' | 'developer'>('user');

  const loadDocument = async (file: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/docs/${file}`);
      if (!response.ok) {
        throw new Error(`Failed to load documentation: ${response.statusText}`);
      }
      const content = await response.text();
      setDocContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documentation');
      setDocContent('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoc) {
      const docSection = DOC_SECTIONS.find(doc => doc.id === selectedDoc);
      if (docSection) {
        loadDocument(docSection.file);
      }
    }
  }, [selectedDoc]);

  const handleDocSelect = (docId: string) => {
    setSelectedDoc(docId);
  };

  const handleBackToIndex = () => {
    setSelectedDoc(null);
    setDocContent('');
    setError(null);
  };

  const filteredDocs = DOC_SECTIONS.filter(doc => doc.category === activeCategory);

  if (selectedDoc) {
    const currentDoc = DOC_SECTIONS.find(doc => doc.id === selectedDoc);
    
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToIndex}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Documentation</span>
              </button>
              {currentDoc && (
                <div className="flex items-center space-x-2">
                  <currentDoc.icon className="w-5 h-5 text-gray-500" />
                  <h1 className="text-xl font-semibold text-gray-900">{currentDoc.title}</h1>
                </div>
              )}
            </div>
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span className="sr-only">Close documentation</span>
              ✕
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-red-800 font-medium">Error Loading Documentation</h3>
              </div>
              <p className="text-red-700 mt-2">{error}</p>
              <button
                onClick={() => currentDoc && loadDocument(currentDoc.file)}
                className="mt-3 text-red-600 hover:text-red-800 underline text-sm"
              >
                Try again
              </button>
            </div>
          )}

          {docContent && !loading && (
            <div className="prose prose-gray max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  code: ({ inline, children }) => (
                    inline ? (
                      <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                        {children}
                      </code>
                    )
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                      {children}
                    </pre>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-700">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 bg-blue-50 p-4 my-4 italic text-blue-800">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gray-50">{children}</thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-gray-50">{children}</tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 text-sm text-gray-700">{children}</td>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-blue-600 hover:text-blue-800 underline"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {children}
                      {href?.startsWith('http') && (
                        <ExternalLink className="w-3 h-3 inline ml-1" />
                      )}
                    </a>
                  ),
                }}
              >
                {docContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App</span>
            </button>
            <div className="flex items-center space-x-2">
              <Book className="w-5 h-5 text-gray-500" />
              <h1 className="text-xl font-semibold text-gray-900">Documentation & Help</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <p className="text-gray-600 text-lg mb-6">
            Welcome to the Git Issue Flow documentation. Find guides for using the tool and information for developers.
          </p>

          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveCategory('user')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeCategory === 'user'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              User Guides
            </button>
            <button
              onClick={() => setActiveCategory('developer')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeCategory === 'developer'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Developer Docs
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleDocSelect(doc.id)}
              className="text-left p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <doc.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {doc.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://github.com/jamespember/git-issue-flow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>GitHub Repository</span>
            </a>
            <a
              href="https://github.com/jamespember/git-issue-flow/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Report Issues</span>
            </a>
            <a
              href="https://github.com/jamespember/git-issue-flow/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Discussions</span>
            </a>
            <a
              href="../LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>MIT License</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationViewer;