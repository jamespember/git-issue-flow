import React from 'react';
import SlackThreadPreview from './SlackThreadPreview';

const SlackPreviewDemo: React.FC = () => {
  const [showPreview, setShowPreview] = React.useState(false);
  const [position, setPosition] = React.useState<{ x: number; y: number }>({ x: 200, y: 200 });

  // Example Slack URLs for testing
  const exampleUrls = [
    'https://app.slack.com/client/T1234567890/C1234567890/thread/C1234567890-1234567890.123456',
    'https://slack.com/app/T1234567890/C1234567890',
    'https://app.slack.com/client/T1234567890/C1234567890'
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Slack Thread Preview Demo</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">How it works:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Hover over any Slack link to see a thread preview</li>
            <li>Preview shows participant count, reply count, and first few messages</li>
            <li>Works with public channels (no authentication required)</li>
            <li>Graceful fallback for private channels or inaccessible threads</li>
            <li>Click "Open in Slack" to open in desktop app or browser</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Example Slack Links:</h2>
          <div className="space-y-3">
            {exampleUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm font-medium">Example {index + 1}:</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
                    setShowPreview(true);
                  }}
                  onMouseLeave={() => {
                    setTimeout(() => setShowPreview(false), 300);
                  }}
                >
                  {url}
                </a>
                <span className="text-xs text-gray-500">(Hover to preview)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Features:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-green-600">✅ What Works:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Public channel threads</li>
                <li>• Message preview (first 5 messages)</li>
                <li>• Participant and reply counts</li>
                <li>• Timestamp formatting</li>
                <li>• Basic Slack formatting cleanup</li>
                <li>• Desktop app integration</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-orange-600">⚠️ Limitations:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Private channels require auth</li>
                <li>• Limited to public API access</li>
                <li>• No real-time updates</li>
                <li>• Rate limiting applies</li>
                <li>• Some URL formats may not work</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Component */}
      <SlackThreadPreview
        url={exampleUrls[0]}
        isVisible={showPreview}
        onClose={() => setShowPreview(false)}
        position={position}
      />
    </div>
  );
};

export default SlackPreviewDemo; 