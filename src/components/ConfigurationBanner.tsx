import React from 'react';
import { AlertTriangle, Settings, ExternalLink } from 'lucide-react';
import { ConfigService } from '../services/configService';

interface ConfigurationBannerProps {
  onGoToSettings: () => void;
}

const ConfigurationBanner: React.FC<ConfigurationBannerProps> = ({ onGoToSettings }) => {
  const config = ConfigService.load();
  const validation = ConfigService.validate(config);

  if (validation.isValid) {
    return null;
  }

  const hasGitHubConfig = config.github.owner && config.github.repo && config.github.token;
  const hasBasicLabels = config.labels.priority.high && config.labels.priority.medium && config.labels.priority.low;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Configuration Required
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            {!hasGitHubConfig && (
              <p className="mb-2">
                Please configure your GitHub repository and access token to start managing issues.
              </p>
            )}
            {!hasBasicLabels && (
              <p className="mb-2">
                Priority labels need to be configured for issue management.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={onGoToSettings}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                Open Settings
              </button>
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white text-amber-800 hover:bg-gray-50 border border-amber-200 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Create GitHub Token
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationBanner;