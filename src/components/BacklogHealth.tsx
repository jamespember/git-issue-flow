import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, Clock, Target, HelpCircle } from 'lucide-react';
import { githubService } from '../services/github';
import { BacklogAnalyzer, BacklogMetrics } from '../services/backlogAnalyzer';

const BacklogHealth: React.FC = () => {
  const [metrics, setMetrics] = useState<BacklogMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const analyzer = new BacklogAnalyzer();

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    setLoading(true);
    setError(null);
    setLoadingProgress('Fetching all issues from GitHub...');
    
    try {
      // Fetch ALL issues for comprehensive analysis (includes prioritized issues)
      const allIssues = await githubService.searchAllIssues({
        owner: 'komo-tech',
        repo: 'komo-platform', 
        query: 'is:issue is:open', // Get all open issues (including prioritized ones)
        per_page: 100
      });
      
      setLoadingProgress(`Analyzing ${allIssues.length} issues...`);
      console.log('Loaded issues for health analysis:', allIssues.length);
      
      const analysisResult = analyzer.analyzeBacklog(allIssues);
      setMetrics(analysisResult);
    } catch (err) {
      console.error('Error loading health data:', err);
      setError('Failed to load backlog health data');
    } finally {
      setLoading(false);
      setLoadingProgress('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading Backlog Health</div>
          {loadingProgress && (
            <div className="text-sm text-gray-500 mt-2">{loadingProgress}</div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center p-8 rounded-lg bg-red-50 text-red-600">
          <h3 className="text-lg font-medium mb-2">Error Loading Health Data</h3>
          <p className="mb-4">{error}</p>
          <button 
            onClick={loadHealthData}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return <div>No data available</div>;
  }

  // Prepare chart data
  const ageChartData = [
    { name: 'Fresh (0-7d)', value: metrics.ageDistribution.fresh, fill: '#10b981' },
    { name: 'Recent (1-4w)', value: metrics.ageDistribution.recent, fill: '#3b82f6' },
    { name: 'Aging (1-3m)', value: metrics.ageDistribution.aging, fill: '#f59e0b' },
    { name: 'Stale (3-6m)', value: metrics.ageDistribution.stale, fill: '#ef4444' },
    { name: 'Ancient (6m+)', value: metrics.ageDistribution.ancient, fill: '#7c2d12' }
  ].filter(item => item.value > 0);

  const priorityChartData = [
    { name: 'High', value: metrics.priorityBalance.high, fill: '#ef4444' },
    { name: 'Medium', value: metrics.priorityBalance.medium, fill: '#f59e0b' },
    { name: 'Low', value: metrics.priorityBalance.low, fill: '#10b981' },
    { name: 'Ungroomed', value: metrics.priorityBalance.ungroomed, fill: '#6b7280' }
  ].filter(item => item.value > 0);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getHealthIcon = (overall: string) => {
    switch (overall) {
      case 'healthy': return '🟢';
      case 'needs-attention': return '🟡';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  // Tooltip component for explanations
  const ExplainerTooltip: React.FC<{ title: string; content: React.ReactNode }> = ({ title, content }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    return (
      <div className="relative inline-block">
        <button
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        {isVisible && (
          <div className="absolute z-50 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg -top-2 left-6">
            <div className="font-semibold mb-1">{title}</div>
            <div className="text-gray-200">{content}</div>
            <div className="absolute -left-1 top-3 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Backlog Health Dashboard</h1>
          <ExplainerTooltip 
            title="Backlog Health Overview"
            content={
              <div>
                This dashboard analyzes your entire backlog to identify potential problems and track key health metrics. 
                A healthy backlog has a good mix of fresh and recent issues, balanced priorities, and steady grooming velocity.
              </div>
            }
          />
        </div>
        <p className="text-gray-600 mt-1">Analysis of {metrics.totalIssues} total issues</p>
      </div>

      {/* Health Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border-2 ${getHealthColor(metrics.healthScore.score)}`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getHealthIcon(metrics.healthScore.overall)}</span>
            <div className="flex-1">
              <div className="text-2xl font-bold">{metrics.healthScore.score}/100</div>
              <div className="text-sm font-medium capitalize">{metrics.healthScore.overall.replace('-', ' ')}</div>
            </div>
            <ExplainerTooltip 
              title="Overall Health Score"
              content={
                <div>
                  <div className="mb-2">Composite score combining age, priority, and velocity health:</div>
                  <div>• <strong>80-100:</strong> Healthy backlog</div>
                  <div>• <strong>60-79:</strong> Needs attention</div>
                  <div>• <strong>0-59:</strong> Critical issues</div>
                  <div className="mt-2">Based on weighted average: Age (40%) + Priority (40%) + Velocity (20%)</div>
                </div>
              }
            />
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-blue-50 border">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <div className="text-xl font-bold text-blue-600">{metrics.healthScore.factors.ageHealth}/100</div>
              <div className="text-sm text-blue-600">Age Health</div>
            </div>
            <ExplainerTooltip 
              title="Age Health Score"
              content={
                <div>
                  <div className="mb-2">Measures how fresh your backlog is:</div>
                  <div>• Penalizes ancient issues (6+ months old)</div>
                  <div>• Penalizes stale issues (3-6 months old)</div>
                  <div>• Rewards fresh/recent issues</div>
                  <div className="mt-2"><strong>Why it matters:</strong> Old issues become harder to understand and implement. Fresh issues have better context.</div>
                </div>
              }
            />
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-purple-50 border">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            <div className="flex-1">
              <div className="text-xl font-bold text-purple-600">{metrics.healthScore.factors.priorityHealth}/100</div>
              <div className="text-sm text-purple-600">Priority Health</div>
            </div>
            <ExplainerTooltip 
              title="Priority Health Score"
              content={
                <div>
                  <div className="mb-2">Evaluates your priority distribution:</div>
                  <div>• Healthy pyramid: More low/medium than high priority</div>
                  <div>• Penalizes too many high priority items</div>
                  <div>• Penalizes large ungroomed backlogs</div>
                  <div className="mt-2"><strong>Why it matters:</strong> Everything can't be high priority. Good prioritization helps focus effort on what matters most.</div>
                </div>
              }
            />
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-green-50 border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <div className="text-xl font-bold text-green-600">{metrics.healthScore.factors.velocityHealth}/100</div>
              <div className="text-sm text-green-600">Velocity Health</div>
            </div>
            <ExplainerTooltip 
              title="Velocity Health Score"
              content={
                <div>
                  <div className="mb-2">Measures how quickly you groom issues:</div>
                  <div>• Based on average days from creation to grooming</div>
                  <div>• Penalizes slow grooming (30+ days)</div>
                  <div>• Rewards fast triage and prioritization</div>
                  <div className="mt-2"><strong>Why it matters:</strong> Fast grooming means better context retention and quicker value delivery.</div>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Problems Alert */}
      {metrics.problems.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Issues Detected</h3>
            <ExplainerTooltip 
              title="Automated Problem Detection"
              content={
                <div>
                  <div className="mb-2">These are potential problems automatically detected in your backlog:</div>
                  <div>• <strong>🔴 Critical:</strong> Requires immediate attention</div>
                  <div>• <strong>⚠️ Warning:</strong> Should be addressed soon</div>
                  <div className="mt-2">Click through to the grooming view to start addressing these issues.</div>
                </div>
              }
            />
          </div>
          <div className="space-y-2">
            {metrics.problems.map((problem, index) => (
              <div key={index} className={`p-2 rounded ${problem.severity === 'critical' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                <span className={`font-medium ${problem.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'}`}>
                  {problem.severity === 'critical' ? '🔴' : '⚠️'} {problem.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution Chart */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Age Distribution</h3>
            <ExplainerTooltip 
              title="Issue Age Categories"
              content={
                <div>
                  <div className="mb-2">Shows how long issues have been open:</div>
                  <div>• <strong>Fresh (0-7d):</strong> Brand new issues with full context</div>
                  <div>• <strong>Recent (1-4w):</strong> Still fresh, good context</div>
                  <div>• <strong>Aging (1-3m):</strong> Starting to lose context</div>
                  <div>• <strong>Stale (3-6m):</strong> Context may be outdated</div>
                  <div>• <strong>Ancient (6m+):</strong> Likely needs re-evaluation</div>
                  <div className="mt-2"><strong>Ideal:</strong> Most issues in Fresh/Recent categories</div>
                </div>
              }
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ageChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ageChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Balance Chart */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Priority Balance</h3>
            <ExplainerTooltip 
              title="Priority Distribution"
              content={
                <div>
                  <div className="mb-2">Shows how issues are prioritized:</div>
                  <div>• <strong>High:</strong> Urgent, blocking, or critical business value</div>
                  <div>• <strong>Medium:</strong> Important but not urgent</div>
                  <div>• <strong>Low:</strong> Nice to have or future considerations</div>
                  <div>• <strong>Ungroomed:</strong> Not yet prioritized (need attention)</div>
                  <div className="mt-2"><strong>Healthy pyramid:</strong> Few high, some medium, many low priority items</div>
                </div>
              }
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {priorityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Velocity Metrics */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">Velocity Metrics (Last 30 Days)</h3>
          <ExplainerTooltip 
            title="Backlog Flow Metrics"
            content={
              <div>
                <div className="mb-2">Tracks the flow of work through your backlog:</div>
                <div>• <strong>Issues Created:</strong> New issues added to backlog</div>
                <div>• <strong>Issues Groomed:</strong> Issues that got prioritized</div>
                <div>• <strong>Avg Days to Groom:</strong> Time from creation to prioritization</div>
                <div className="mt-2"><strong>Ideal:</strong> Grooming keeps pace with creation, fast triage ({"<"}7 days)</div>
              </div>
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{metrics.velocity.issuesCreatedLast30Days}</div>
            <div className="text-sm text-blue-600">Issues Created</div>
            <div className="text-xs text-gray-500 mt-1">Backlog growth rate</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{metrics.velocity.issuesGroomedLast30Days}</div>
            <div className="text-sm text-green-600">Issues Groomed</div>
            <div className="text-xs text-gray-500 mt-1">Processing capacity</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{Math.round(metrics.velocity.averageAgeToGroom)}</div>
            <div className="text-sm text-purple-600">Avg Days to Groom</div>
            <div className="text-xs text-gray-500 mt-1">Response time</div>
          </div>
        </div>
      </div>

      {/* Action Recommendations */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-blue-800">💡 Recommended Actions</h3>
        </div>
        <div className="space-y-2 text-sm text-blue-700">
          {metrics.priorityBalance.ungroomed > 50 && (
            <div>• <strong>Priority Focus:</strong> You have {metrics.priorityBalance.ungroomed} ungroomed issues. Use Command+K to search and prioritize the most important ones.</div>
          )}
          {metrics.velocity.averageAgeToGroom > 14 && (
            <div>• <strong>Speed Up Grooming:</strong> Issues are taking {Math.round(metrics.velocity.averageAgeToGroom)} days to groom on average. Aim for under 7 days to maintain context.</div>
          )}
          {(metrics.ageDistribution.ancient + metrics.ageDistribution.stale) > 10 && (
            <div>• <strong>Clean Old Issues:</strong> Consider closing or re-evaluating {metrics.ageDistribution.ancient + metrics.ageDistribution.stale} old issues that may no longer be relevant.</div>
          )}
          {metrics.velocity.issuesCreatedLast30Days > 30 && (
            <div>• <strong>Manage Intake:</strong> High creation rate ({metrics.velocity.issuesCreatedLast30Days} issues/month). Consider filtering or batching new issues.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BacklogHealth; 