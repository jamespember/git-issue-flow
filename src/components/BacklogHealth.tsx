import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Clock, Target, Search, RefreshCw, ExternalLink } from 'lucide-react';
import { githubService } from '../services/github';
import { BacklogAnalyzer, BacklogMetrics } from '../services/backlogAnalyzer';
import { ConfigService } from '../services/configService';

const BacklogHealth: React.FC = () => {
  const [metrics, setMetrics] = useState<BacklogMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const analyzer = new BacklogAnalyzer();

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const config = ConfigService.load();
      if (!config.github.owner || !config.github.repo) {
        throw new Error('GitHub repository not configured');
      }

      // Fetch ALL issues for comprehensive analysis
      const allIssues = await githubService.searchAllIssues({
        owner: config.github.owner,
        repo: config.github.repo, 
        query: 'is:issue is:open',
        per_page: 100
      });
      
      console.log('Loaded issues for health analysis:', allIssues.length);
      
      const analysisResult = analyzer.analyzeBacklog(allIssues);
      setMetrics(analysisResult);
    } catch (err) {
      console.error('Error loading health data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load backlog health data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Analyzing Backlog Health</div>
          <div className="text-sm text-gray-500 mt-2">This may take a moment for large repositories</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center p-8 rounded-lg bg-red-50 text-red-600 max-w-md">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Cannot Load Health Data</h3>
          <p className="mb-4">{error}</p>
          <button 
            onClick={loadHealthData}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return <div>No data available</div>;
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getHealthIcon = (overall: string) => {
    switch (overall) {
      case 'healthy': return '🟢';
      case 'needs-attention': return '🟡';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  const getGitHubSearchUrl = (problemType: string) => {
    const config = ConfigService.load();
    const baseUrl = `https://github.com/${config.github.owner}/${config.github.repo}/issues`;
    
    switch (problemType) {
      case 'ancient-issues': {
        // Issues older than 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const dateStr = sixMonthsAgo.toISOString().split('T')[0];
        return `${baseUrl}?q=is:open is:issue created:<${dateStr}`.replace(/ /g, '+');
      }
      
      case 'priority-skew': {
        // High priority issues
        return `${baseUrl}?q=is:open is:issue label:"${config.labels.priority.high}"`.replace(/ /g, '+');
      }
      
      case 'grooming-backlog': {
        // Issues without priority labels
        const priorityLabels = [
          config.labels.priority.high,
          config.labels.priority.medium,
          config.labels.priority.low
        ].map(label => `-label:"${label}"`).join(' ');
        return `${baseUrl}?q=is:open is:issue ${priorityLabels}`.replace(/ /g, '+');
      }
      
      case 'creation-rate': {
        // Issues created in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentDateStr = thirtyDaysAgo.toISOString().split('T')[0];
        return `${baseUrl}?q=is:open is:issue created:>${recentDateStr}`.replace(/ /g, '+');
      }
      
      default:
        return `${baseUrl}?q=is:open is:issue`.replace(/ /g, '+');
    }
  };

  const getSearchQuery = (problemType: string) => {
    const config = ConfigService.load();
    
    switch (problemType) {
      case 'ancient-issues': {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const dateStr = sixMonthsAgo.toISOString().split('T')[0];
        return `is:open is:issue created:<${dateStr}`;
      }
      
      case 'priority-skew': {
        return `is:open is:issue label:"${config.labels.priority.high}"`;
      }
      
      case 'grooming-backlog': {
        const priorityLabels = [
          config.labels.priority.high,
          config.labels.priority.medium,
          config.labels.priority.low
        ].map(label => `-label:"${label}"`).join(' ');
        return `is:open is:issue ${priorityLabels}`;
      }
      
      case 'creation-rate': {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentDateStr = thirtyDaysAgo.toISOString().split('T')[0];
        return `is:open is:issue created:>${recentDateStr}`;
      }
      
      default:
        return 'is:open is:issue';
    }
  };

  const openInGitIssueFlow = (problemType: string) => {
    const query = getSearchQuery(problemType);
    // Trigger CommandK and set the search query
    const searchEvent = new CustomEvent('openCommandK', { detail: { query } });
    window.dispatchEvent(searchEvent);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Backlog Health</h1>
        <p className="text-gray-600 mt-2">Analysis of {metrics.totalIssues} open issues</p>
      </div>

      {/* Overall Health Score - Hero Section */}
      <div className={`text-center p-8 rounded-xl border-2 ${getHealthColor(metrics.healthScore.score)}`}>
        <div className="text-6xl mb-4">{getHealthIcon(metrics.healthScore.overall)}</div>
        <div className="text-4xl font-bold mb-2">{metrics.healthScore.score}/100</div>
        <div className="text-xl font-medium capitalize mb-4">
          {metrics.healthScore.overall.replace('-', ' ')} Backlog
        </div>
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Age: {metrics.healthScore.factors.ageHealth}/100</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>Priority: {metrics.healthScore.factors.priorityHealth}/100</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Velocity: {metrics.healthScore.factors.velocityHealth}/100</span>
          </div>
        </div>
      </div>

      {/* Problems Alert */}
      {metrics.problems.length > 0 && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Issues Detected</h3>
          </div>
          <div className="grid gap-3">
            {metrics.problems.map((problem, index) => (
              <div key={index} className={`p-3 rounded-md ${problem.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {problem.severity === 'critical' ? '🔴' : '⚠️'} {problem.message}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openInGitIssueFlow(problem.type)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                        problem.severity === 'critical' 
                          ? 'bg-red-200 text-red-900 hover:bg-red-300' 
                          : 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300'
                      }`}
                    >
                      <Search className="w-3 h-3" />
                      Search Here
                    </button>
                    <a
                      href={getGitHubSearchUrl(problem.type)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                        problem.severity === 'critical' 
                          ? 'bg-red-200 text-red-900 hover:bg-red-300' 
                          : 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300'
                      }`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      View in GitHub
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Age Distribution */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Issue Age</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Fresh (0-7d)</span>
              <span className="font-medium">{metrics.ageDistribution.fresh}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">Recent (1-4w)</span>
              <span className="font-medium">{metrics.ageDistribution.recent}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-orange-600">Aging (1-3m)</span>
              <span className="font-medium">{metrics.ageDistribution.aging}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-600">Stale (3m+)</span>
              <span className="font-medium">{metrics.ageDistribution.stale + metrics.ageDistribution.ancient}</span>
            </div>
          </div>
        </div>

        {/* Priority Balance */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Priority Balance</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-red-600">High</span>
              <span className="font-medium">{metrics.priorityBalance.high}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-orange-600">Medium</span>
              <span className="font-medium">{metrics.priorityBalance.medium}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Low</span>
              <span className="font-medium">{metrics.priorityBalance.low}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ungroomed</span>
              <span className="font-medium">{metrics.priorityBalance.ungroomed}</span>
            </div>
          </div>
        </div>

        {/* Velocity (Last 30 Days) */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Last 30 Days</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">Created</span>
              <span className="font-medium">{metrics.velocity.issuesCreatedLast30Days}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Groomed</span>
              <span className="font-medium">{metrics.velocity.issuesGroomedLast30Days}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-600">Avg Days to Groom</span>
              <span className="font-medium">{Math.round(metrics.velocity.averageAgeToGroom)}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">Take Action</h3>
          <div className="space-y-2">
            <button 
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              className="w-full text-left text-sm text-blue-700 hover:text-blue-900 flex items-center gap-2 p-2 rounded hover:bg-blue-100"
            >
              <Search className="w-4 h-4" />
              Search Issues (⌘K)
            </button>
            <button 
              onClick={loadHealthData}
              className="w-full text-left text-sm text-blue-700 hover:text-blue-900 flex items-center gap-2 p-2 rounded hover:bg-blue-100"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Action Recommendations */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Recommended Actions</h3>
        <div className="grid gap-3">
          {metrics.priorityBalance.ungroomed > 20 && (
            <div className="p-3 bg-white rounded border-l-4 border-blue-500">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-gray-900">Prioritize Ungroomed Issues</div>
                  <div className="text-sm text-gray-600">
                    {metrics.priorityBalance.ungroomed} issues lack priority labels (high/medium/low). These need grooming to assign appropriate priority.
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <button
                    onClick={() => openInGitIssueFlow('grooming-backlog')}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-900 rounded hover:bg-blue-200 transition-colors"
                  >
                    <Search className="w-3 h-3" />
                    Search Here
                  </button>
                  <a
                    href={getGitHubSearchUrl('grooming-backlog')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-900 rounded hover:bg-blue-200 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View in GitHub
                  </a>
                </div>
              </div>
            </div>
          )}
          {metrics.velocity.averageAgeToGroom > 14 && (
            <div className="p-3 bg-white rounded border-l-4 border-orange-500">
              <div className="font-medium text-gray-900">Speed Up Grooming</div>
              <div className="text-sm text-gray-600">
                Issues take {Math.round(metrics.velocity.averageAgeToGroom)} days to groom. Aim for under 7 days to maintain context.
              </div>
            </div>
          )}
          {(metrics.ageDistribution.stale + metrics.ageDistribution.ancient) > 10 && (
            <div className="p-3 bg-white rounded border-l-4 border-red-500">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-gray-900">Review Old Issues</div>
                  <div className="text-sm text-gray-600">
                    {metrics.ageDistribution.stale + metrics.ageDistribution.ancient} issues are 3+ months old. Consider closing outdated ones.
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <button
                    onClick={() => openInGitIssueFlow('ancient-issues')}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-900 rounded hover:bg-red-200 transition-colors"
                  >
                    <Search className="w-3 h-3" />
                    Search Here
                  </button>
                  <a
                    href={getGitHubSearchUrl('ancient-issues')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-900 rounded hover:bg-red-200 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View in GitHub
                  </a>
                </div>
              </div>
            </div>
          )}
          {metrics.velocity.issuesCreatedLast30Days > metrics.velocity.issuesGroomedLast30Days * 2 && (
            <div className="p-3 bg-white rounded border-l-4 border-yellow-500">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-gray-900">High Intake Rate</div>
                  <div className="text-sm text-gray-600">
                    Creating issues faster than grooming them. Consider filtering or batching new issues.
                  </div>
                </div>
                <a
                  href={getGitHubSearchUrl('creation-rate')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-900 rounded hover:bg-yellow-200 transition-colors flex-shrink-0"
                >
                  <ExternalLink className="w-3 h-3" />
                  View in GitHub
                </a>
              </div>
            </div>
          )}
          {metrics.problems.length === 0 && metrics.healthScore.score >= 80 && (
            <div className="p-3 bg-white rounded border-l-4 border-green-500">
              <div className="font-medium text-gray-900">Healthy Backlog!</div>
              <div className="text-sm text-gray-600">
                Your backlog is in good shape. Keep up the regular grooming to maintain this health score.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BacklogHealth;