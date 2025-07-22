import React, { useState, useEffect } from 'react';
import { UserConfig, EXAMPLE_CONFIGS } from '../config/userConfig';
import { ConfigService } from '../services/configService';
import { githubService } from '../services/github';
import { slackApiService } from '../services/slackApi';
import { aiService } from '../services/aiService';
import { Save, Download, Upload, RotateCcw, Check, X, AlertTriangle, Github, MessageSquare, Bot, ExternalLink, Info, HelpCircle, ChevronDown, Tag } from 'lucide-react';

interface GitHubLabel {
  id: number;
  name: string;
  color: string;
}

const Settings: React.FC = () => {
  const [config, setConfig] = useState<UserConfig>(ConfigService.load());
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showTokens, setShowTokens] = useState(false);
  const [showGitHubHelp, setShowGitHubHelp] = useState(false);
  const [showSlackHelp, setShowSlackHelp] = useState(false);
  const [showOpenAIHelp, setShowOpenAIHelp] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<GitHubLabel[]>([]);
  const [labelsLoading, setLabelsLoading] = useState(false);
  const [labelsError, setLabelsError] = useState<string | null>(null);

  // Test states
  const [githubTestState, setGitHubTestState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [githubTestResult, setGitHubTestResult] = useState<string>('');
  const [slackTestState, setSlackTestState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [slackTestResult, setSlackTestResult] = useState<string>('');
  const [openaiTestState, setOpenAITestState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [openaiTestResult, setOpenAITestResult] = useState<string>('');
  
  useEffect(() => {
    const original = ConfigService.load();
    setIsDirty(JSON.stringify(config) !== JSON.stringify(original));
  }, [config]);

  useEffect(() => {
    // Fetch labels when GitHub config changes and is valid
    if (config.github.owner && config.github.repo && config.github.token) {
      fetchGitHubLabels();
    } else {
      setAvailableLabels([]);
      setLabelsError(null);
    }
  }, [config.github.owner, config.github.repo, config.github.token]);

  const fetchGitHubLabels = async () => {
    if (!config.github.owner || !config.github.repo || !config.github.token) {
      return;
    }

    setLabelsLoading(true);
    setLabelsError(null);
    
    try {
      const labels = await githubService.fetchLabels(config.github.owner, config.github.repo);
      setAvailableLabels(labels);
    } catch (error) {
      setLabelsError(error instanceof Error ? error.message : 'Failed to fetch labels');
      setAvailableLabels([]);
    } finally {
      setLabelsLoading(false);
    }
  };

  const handleSave = () => {
    // Allow saving GitHub credentials without requiring priority labels
    const hasGitHubCredentials = config.github.owner && config.github.repo && config.github.token;
    const hasPriorityLabels = config.labels.priority.high && config.labels.priority.medium && config.labels.priority.low;
    
    const validation = ConfigService.validate(config, hasPriorityLabels);
    setValidationErrors(validation.errors);
    
    if (!validation.isValid) {
      setSaveStatus('error');
      return;
    }

    try {
      setSaveStatus('saving');
      ConfigService.save(config);
      setSaveStatus('saved');
      setIsDirty(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Failed to save configuration:', error);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      ConfigService.reset();
      setConfig(ConfigService.load());
      setIsDirty(false);
      setValidationErrors([]);
    }
  };

  const handleExport = () => {
    const exportData = ConfigService.export();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gitissueflow-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = ConfigService.import(e.target?.result as string);
        if (result.success) {
          setConfig(ConfigService.load());
          setIsDirty(false);
          alert('Configuration imported successfully!');
        } else {
          alert(`Import failed: ${result.error}`);
        }
      } catch (error) {
        alert('Failed to import configuration file.');
      }
    };
    reader.readAsText(file);
  };

  const applyExample = (exampleKey: keyof typeof EXAMPLE_CONFIGS) => {
    const example = EXAMPLE_CONFIGS[exampleKey];
    setConfig({
      ...config,
      github: { ...config.github, ...example.github },
      labels: { ...config.labels, ...example.labels }
    });
  };

  // Label selection components
  const LabelDropdown: React.FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    disabled?: boolean;
  }> = ({ value, onChange, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedLabel = availableLabels.find(label => label.name === value);
    
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            {selectedLabel && (
              <span 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: `#${selectedLabel.color}` }}
              />
            )}
            <span className={selectedLabel ? 'text-gray-900' : 'text-gray-500'}>
              {selectedLabel ? selectedLabel.name : placeholder}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && !disabled && (
          <div 
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2">
              <input
                type="text"
                placeholder="Search labels or type custom..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="border-t border-gray-200">
              {availableLabels
                .filter(label => label.name.toLowerCase().includes(value.toLowerCase()))
                .map(label => (
                  <button
                    key={label.id}
                    onClick={() => {
                      onChange(label.name);
                      setIsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: `#${label.color}` }}
                    />
                    <span>{label.name}</span>
                  </button>
                ))
              }
              {availableLabels.filter(label => label.name.toLowerCase().includes(value.toLowerCase())).length === 0 && value && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No matching labels. Current value will be used as custom label.
                </div>
              )}
            </div>
          </div>
        )}
        
        {isOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  };

  const MultiLabelSelect: React.FC<{
    values: string[];
    onChange: (values: string[]) => void;
    placeholder: string;
    disabled?: boolean;
  }> = ({ values, onChange, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredLabels = availableLabels.filter(label => 
      label.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !values.includes(label.name)
    );
    
    const addLabel = (labelName: string) => {
      if (!values.includes(labelName)) {
        onChange([...values, labelName]);
      }
    };
    
    const removeLabel = (labelName: string) => {
      onChange(values.filter(v => v !== labelName));
    };
    
    const addCustomLabel = () => {
      if (searchTerm.trim() && !values.includes(searchTerm.trim())) {
        onChange([...values, searchTerm.trim()]);
        setSearchTerm('');
      }
    };
    
    return (
      <div className="relative">
        <div className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <div className="flex flex-wrap gap-1 mb-1">
            {values.map(labelName => {
              const label = availableLabels.find(l => l.name === labelName);
              return (
                <span 
                  key={labelName}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-sm rounded-md"
                >
                  {label && (
                    <span 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: `#${label.color}` }}
                    />
                  )}
                  <span>{labelName}</span>
                  <button
                    type="button"
                    onClick={() => removeLabel(labelName)}
                    className="text-gray-400 hover:text-gray-600 ml-1"
                    disabled={disabled}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className="w-full text-left text-gray-500 text-sm disabled:cursor-not-allowed flex items-center justify-between"
          >
            <span>{values.length === 0 ? placeholder : `${values.length} selected`}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {isOpen && !disabled && (
          <div 
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 border-b border-gray-200">
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="Search labels or add custom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      if (searchTerm.trim()) {
                        // Clear search first if there's text
                        setSearchTerm('');
                      } else {
                        // Close dropdown only if search is empty
                        setIsOpen(false);
                      }
                      return;
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomLabel();
                    }
                  }}
                />
                {searchTerm.trim() && !availableLabels.some(l => l.name === searchTerm.trim()) && (
                  <button
                    type="button"
                    onClick={addCustomLabel}
                    className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
            <div>
              {filteredLabels.map(label => (
                <button
                  key={label.id}
                  onClick={() => {
                    addLabel(label.name);
                    setSearchTerm('');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <span 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: `#${label.color}` }}
                  />
                  <span>{label.name}</span>
                </button>
              ))
              }
              {filteredLabels.length === 0 && searchTerm && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {availableLabels.some(l => l.name.toLowerCase() === searchTerm.toLowerCase()) 
                    ? 'Label already selected' 
                    : 'Press Enter or click Add to create custom label'
                  }
                </div>
              )}
              {filteredLabels.length === 0 && !searchTerm && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  All available labels selected
                </div>
              )}
            </div>
          </div>
        )}
        
        {isOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  };

  // Test functions
  const testGitHubConnection = async () => {
    if (!config.github.owner || !config.github.repo || !config.github.token) {
      setGitHubTestState('error');
      setGitHubTestResult('Please fill in all GitHub fields before testing');
      return;
    }

    setGitHubTestState('testing');
    setGitHubTestResult('');

    const result = await githubService.testConnection(config.github.owner, config.github.repo, config.github.token);
    
    if (result.success) {
      setGitHubTestState('success');
      setGitHubTestResult(`✓ Connected successfully as ${result.user}`);
    } else {
      setGitHubTestState('error');
      setGitHubTestResult(`✗ ${result.error}`);
    }

    // Reset after 5 seconds
    setTimeout(() => {
      setGitHubTestState('idle');
      setGitHubTestResult('');
    }, 5000);
  };

  const testSlackConnection = async () => {
    if (!config.slack?.botToken) {
      setSlackTestState('error');
      setSlackTestResult('Please provide a Slack bot token before testing');
      return;
    }

    setSlackTestState('testing');
    setSlackTestResult('');

    const result = await slackApiService.testConnection(config.slack.botToken);
    
    if (result.success) {
      setSlackTestState('success');
      setSlackTestResult(`✓ Connected successfully to ${result.info?.teamName} as ${result.info?.botName}`);
    } else {
      setSlackTestState('error');
      setSlackTestResult(`✗ ${result.error}`);
    }

    // Reset after 5 seconds
    setTimeout(() => {
      setSlackTestState('idle');
      setSlackTestResult('');
    }, 5000);
  };

  const testOpenAIConnection = async () => {
    if (!config.openai?.apiKey) {
      setOpenAITestState('error');
      setOpenAITestResult('Please provide an OpenAI API key before testing');
      return;
    }

    setOpenAITestState('testing');
    setOpenAITestResult('');

    const result = await aiService.testConnection(config.openai.apiKey);
    
    if (result.success) {
      setOpenAITestState('success');
      setOpenAITestResult(`✓ Connected successfully - ${result.info?.model} (${result.info?.usage})`);
    } else {
      setOpenAITestState('error');
      setOpenAITestResult(`✗ ${result.error}`);
    }

    // Reset after 5 seconds
    setTimeout(() => {
      setOpenAITestState('idle');
      setOpenAITestResult('');
    }, 5000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure GitHub Issue Groomer for your repository</p>
        </div>
        
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-sm text-orange-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Unsaved changes
            </span>
          )}
          
          <button
            onClick={handleSave}
            disabled={!isDirty || saveStatus === 'saving'}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveStatus === 'saving' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
            ) : saveStatus === 'saved' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
            <X className="w-5 h-5" />
            Configuration Errors
          </div>
          <ul className="list-disc list-inside space-y-1 text-red-700">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Start Examples */}
      <section className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Start Examples</h2>
        <p className="text-gray-600 mb-4">Get started quickly with these common configurations:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(EXAMPLE_CONFIGS).map(([key, example]) => (
            <button
              key={key}
              onClick={() => applyExample(key as keyof typeof EXAMPLE_CONFIGS)}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-white transition-colors"
            >
              <div className="font-medium text-gray-900">{key}</div>
              <div className="text-sm text-gray-600 mt-1">
                {example.github.owner}/{example.github.repo}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Priority: {Object.values(example.labels.priority).join(', ')}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* GitHub Configuration */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Github className="w-5 h-5" />
          <h2 className="text-xl font-semibold">GitHub Configuration</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repository Owner
            </label>
            <input
              type="text"
              placeholder="e.g., facebook"
              value={config.github.owner}
              onChange={(e) => setConfig({...config, github: {...config.github, owner: e.target.value}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              The username or organization that owns the repository
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repository Name
            </label>
            <input
              type="text"
              placeholder="e.g., react"
              value={config.github.repo}
              onChange={(e) => setConfig({...config, github: {...config.github, repo: e.target.value}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              The name of the repository (without the owner part)
            </p>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Personal Access Token
            </label>
            <button
              onClick={() => setShowTokens(!showTokens)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showTokens ? 'Hide' : 'Show'} token
            </button>
          </div>
          <input
            type={showTokens ? "text" : "password"}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={config.github.token}
            onChange={(e) => setConfig({...config, github: {...config.github, token: e.target.value}})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Test GitHub Connection */}
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={testGitHubConnection}
              disabled={githubTestState === 'testing' || !config.github.owner || !config.github.repo || !config.github.token}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {githubTestState === 'testing' ? (
                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-gray-600"></div>
              ) : githubTestState === 'success' ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : githubTestState === 'error' ? (
                <X className="w-3 h-3 text-red-600" />
              ) : (
                <ExternalLink className="w-3 h-3" />
              )}
              {githubTestState === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
            {githubTestResult && (
              <span className={`text-xs ${githubTestState === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {githubTestResult}
              </span>
            )}
          </div>
          
          {/* GitHub Token Help Section */}
          <div className="mt-4">
            <button
              onClick={() => setShowGitHubHelp(!showGitHubHelp)}
              className="flex items-center gap-2 w-full p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900 flex-1 text-left">How to create a GitHub Personal Access Token</h4>
              <span className={`text-blue-600 transition-transform ${showGitHubHelp ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {showGitHubHelp && (
              <div className="mt-2 p-4 bg-blue-50 border border-blue-200 border-t-0 rounded-b-lg">
            
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <span className="font-semibold bg-blue-200 text-blue-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <p>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1">
                    GitHub Settings → Developer settings → Personal access tokens <ExternalLink className="w-3 h-3" />
                  </a></p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="font-semibold bg-blue-200 text-blue-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <p>Click <strong>"Generate new token"</strong> → <strong>"Generate new token (classic)"</strong></p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="font-semibold bg-blue-200 text-blue-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <p>Give it a descriptive name like <code className="bg-blue-200 px-1 rounded">"GitIssueFlow"</code></p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="font-semibold bg-blue-200 text-blue-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                <div>
                  <p><strong>Select scopes:</strong> Check <code className="bg-blue-200 px-1 rounded">repo</code> (gives full repository access)</p>
                  <p className="text-xs text-blue-600 mt-1">For private repos, you need the full "repo" scope. For public repos, you can use "public_repo" instead.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="font-semibold bg-blue-200 text-blue-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                <div>
                  <p>Click <strong>"Generate token"</strong> and copy the token (starts with <code className="bg-blue-200 px-1 rounded">ghp_</code>)</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Save the token immediately - GitHub only shows it once!</span>
                  </div>
                </div>
              </div>
            </div>
            
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <Info className="w-4 h-4" />
                    <span>Your token is stored locally in your browser and never sent to external servers.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Label Configuration */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Label Configuration</h2>
          {config.github.owner && config.github.repo && config.github.token && (
            <div className="flex items-center gap-2 text-sm">
              {labelsLoading && (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-blue-600"></div>
                  <span className="text-gray-600">Loading labels...</span>
                </>
              )}
              {!labelsLoading && labelsError && (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-red-600">Failed to load labels</span>
                </>
              )}
              {!labelsLoading && !labelsError && availableLabels.length > 0 && (
                <>
                  <Tag className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">{availableLabels.length} labels loaded</span>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* GitHub Connection Status for Labels */}
        {(!config.github.owner || !config.github.repo || !config.github.token) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <Info className="w-5 h-5" />
              <span className="font-medium">Connect to GitHub to see available labels</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Configure your GitHub repository details above to automatically load and suggest labels from your repository.
            </p>
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Priority Labels</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">High Priority</label>
                <LabelDropdown
                  value={config.labels.priority.high}
                  onChange={(value) => setConfig({
                    ...config, 
                    labels: {...config.labels, priority: {...config.labels.priority, high: value}}
                  })}
                  placeholder="Select high priority label"
                  disabled={labelsLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medium Priority</label>
                <LabelDropdown
                  value={config.labels.priority.medium}
                  onChange={(value) => setConfig({
                    ...config, 
                    labels: {...config.labels, priority: {...config.labels.priority, medium: value}}
                  })}
                  placeholder="Select medium priority label"
                  disabled={labelsLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Low Priority</label>
                <LabelDropdown
                  value={config.labels.priority.low}
                  onChange={(value) => setConfig({
                    ...config, 
                    labels: {...config.labels, priority: {...config.labels.priority, low: value}}
                  })}
                  placeholder="Select low priority label"
                  disabled={labelsLoading}
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Groomed Label</label>
            <div className="w-full md:w-1/3">
              <LabelDropdown
                value={config.labels.groomed}
                onChange={(value) => setConfig({...config, labels: {...config.labels, groomed: value}})}
                placeholder="Select groomed label"
                disabled={labelsLoading}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">Label to mark issues as reviewed/groomed</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Excluded Labels</label>
            <MultiLabelSelect
              values={config.labels.exclude}
              onChange={(values) => setConfig({
                ...config, 
                labels: {...config.labels, exclude: values}
              })}
              placeholder="Select labels to exclude from grooming"
              disabled={labelsLoading}
            />
            <p className="text-sm text-gray-600 mt-1">Issues with these labels will be excluded from grooming searches</p>
          </div>
        </div>
      </section>

      {/* Optional Integrations */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Optional Integrations</h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5" />
              <h3 className="text-lg font-medium">Slack Integration</h3>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Optional</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bot Token</label>
                <input
                  type={showTokens ? "text" : "password"}
                  placeholder="xoxb-xxxxxxxxxxxxxxxxxxxx"
                  value={config.slack?.botToken || ''}
                  onChange={(e) => setConfig({
                    ...config, 
                    slack: {...config.slack, botToken: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-600 mt-1">Enables Slack thread previews with AI summaries when you hover over Slack links in issues</p>
                
                {/* Test Slack Connection */}
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={testSlackConnection}
                    disabled={slackTestState === 'testing' || !config.slack?.botToken}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {slackTestState === 'testing' ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-gray-600"></div>
                    ) : slackTestState === 'success' ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : slackTestState === 'error' ? (
                      <X className="w-3 h-3 text-red-600" />
                    ) : (
                      <ExternalLink className="w-3 h-3" />
                    )}
                    {slackTestState === 'testing' ? 'Testing...' : 'Test Connection'}
                  </button>
                  {slackTestResult && (
                    <span className={`text-xs ${slackTestState === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {slackTestResult}
                    </span>
                  )}
                </div>
                
                {/* Slack Token Help Section */}
                <div className="mt-4">
                  <button
                    onClick={() => setShowSlackHelp(!showSlackHelp)}
                    className="flex items-center gap-2 w-full p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <HelpCircle className="w-5 h-5 text-purple-600" />
                    <h4 className="font-medium text-purple-900 flex-1 text-left">How to create a Slack Bot Token</h4>
                    <span className={`text-purple-600 transition-transform ${showSlackHelp ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  
                  {showSlackHelp && (
                    <div className="mt-2 p-4 bg-purple-50 border border-purple-200 border-t-0 rounded-b-lg">
                  
                  <div className="space-y-3 text-sm text-purple-800">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold bg-purple-200 text-purple-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      <div>
                        <p>Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline font-medium inline-flex items-center gap-1">
                          Slack API → Your Apps <ExternalLink className="w-3 h-3" />
                        </a> and click <strong>"Create New App"</strong></p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="font-semibold bg-purple-200 text-purple-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      <div>
                        <p>Choose <strong>"From scratch"</strong>, name it <code className="bg-purple-200 px-1 rounded">"GitIssueFlow"</code>, and select your workspace</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="font-semibold bg-purple-200 text-purple-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      <div>
                        <p>Go to <strong>"OAuth & Permissions"</strong> in the sidebar</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="font-semibold bg-purple-200 text-purple-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                      <div>
                        <p><strong>Add Bot Token Scopes:</strong></p>
                        <ul className="mt-1 ml-4 space-y-1 text-xs">
                          <li>• <code className="bg-purple-200 px-1 rounded">channels:history</code> - Read message history</li>
                          <li>• <code className="bg-purple-200 px-1 rounded">channels:read</code> - View channel information</li>
                          <li>• <code className="bg-purple-200 px-1 rounded">users:read</code> - View user information</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="font-semibold bg-purple-200 text-purple-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                      <div>
                        <p>Click <strong>"Install to Workspace"</strong> and authorize the app</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="font-semibold bg-purple-200 text-purple-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">6</span>
                      <div>
                        <p>Copy the <strong>"Bot User OAuth Token"</strong> (starts with <code className="bg-purple-200 px-1 rounded">xoxb-</code>)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="font-semibold bg-purple-200 text-purple-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">7</span>
                      <div>
                        <p>Invite the bot to channels you want to preview: <code className="bg-purple-200 px-1 rounded">/invite @YourBotName</code></p>
                      </div>
                    </div>
                  </div>
                  
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <div className="flex items-center gap-2 text-xs text-purple-700">
                          <Info className="w-4 h-4" />
                          <span>You'll also need to run the included <code className="bg-purple-200 px-1 rounded">slack-proxy.cjs</code> server for CORS handling.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-5 h-5" />
              <h3 className="text-lg font-medium">OpenAI Integration</h3>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Optional</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input
                type={showTokens ? "text" : "password"}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
                value={config.openai?.apiKey || ''}
                onChange={(e) => setConfig({
                  ...config, 
                  openai: {...config.openai, apiKey: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-600 mt-1">Enables AI-powered issue formatting, rewriting, and Slack thread summaries</p>
              
              {/* Test OpenAI Connection */}
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={testOpenAIConnection}
                  disabled={openaiTestState === 'testing' || !config.openai?.apiKey}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {openaiTestState === 'testing' ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-gray-600"></div>
                  ) : openaiTestState === 'success' ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : openaiTestState === 'error' ? (
                    <X className="w-3 h-3 text-red-600" />
                  ) : (
                    <ExternalLink className="w-3 h-3" />
                  )}
                  {openaiTestState === 'testing' ? 'Testing...' : 'Test Connection'}
                </button>
                {openaiTestResult && (
                  <span className={`text-xs ${openaiTestState === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {openaiTestResult}
                  </span>
                )}
              </div>
              
              {/* OpenAI API Key Help Section */}
              <div className="mt-4">
                <button
                  onClick={() => setShowOpenAIHelp(!showOpenAIHelp)}
                  className="flex items-center gap-2 w-full p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <HelpCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-900 flex-1 text-left">How to get an OpenAI API Key</h4>
                  <span className={`text-green-600 transition-transform ${showOpenAIHelp ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {showOpenAIHelp && (
                  <div className="mt-2 p-4 bg-green-50 border border-green-200 border-t-0 rounded-b-lg">
                
                <div className="space-y-3 text-sm text-green-800">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold bg-green-200 text-green-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <div>
                      <p>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium inline-flex items-center gap-1">
                        OpenAI Platform → API Keys <ExternalLink className="w-3 h-3" />
                      </a></p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="font-semibold bg-green-200 text-green-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <div>
                      <p>Sign up or log in to your OpenAI account</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="font-semibold bg-green-200 text-green-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <div>
                      <p>Click <strong>"Create new secret key"</strong></p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="font-semibold bg-green-200 text-green-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                    <div>
                      <p>Give it a name like <code className="bg-green-200 px-1 rounded">"GitIssueFlow"</code> and click <strong>"Create secret key"</strong></p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="font-semibold bg-green-200 text-green-900 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                    <div>
                      <p>Copy the API key (starts with <code className="bg-green-200 px-1 rounded">sk-</code>)</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Save the key immediately - OpenAI only shows it once!</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-green-700">
                          <Info className="w-4 h-4" />
                          <span><strong>Features enabled:</strong> Format with AI, Rewrite with AI, Slack thread summaries</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-green-700">
                          <span className="w-4 h-4 flex-shrink-0"></span>
                          <span><strong>Usage:</strong> This uses GPT-3.5-turbo, typically costs $0.01-0.05 per request</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Settings */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Workflow Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Exclude Prioritized Issues</h3>
              <p className="text-sm text-gray-600">Don't show issues that already have priority labels in search results</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.workflow.excludePrioritized}
                onChange={(e) => setConfig({
                  ...config, 
                  workflow: {...config.workflow, excludePrioritized: e.target.checked}
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Exclude Dependency Issues</h3>
              <p className="text-sm text-gray-600">Don't show issues with excluded labels in search results</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.workflow.excludeDependencies}
                onChange={(e) => setConfig({
                  ...config, 
                  workflow: {...config.workflow, excludeDependencies: e.target.checked}
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Batch Size</label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.workflow.defaultBatchSize}
              onChange={(e) => setConfig({
                ...config, 
                workflow: {...config.workflow, defaultBatchSize: parseInt(e.target.value) || 30}
              })}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-1">Number of issues to load per search (1-100)</p>
          </div>
        </div>
      </section>

      {/* Import/Export */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Backup & Restore</h2>
        
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export Settings
          </button>
          
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import Settings
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;