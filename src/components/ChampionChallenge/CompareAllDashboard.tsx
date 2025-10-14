import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ComparisonMaster, AggregateMetrics } from '../../types/championChallenge';
import { Trophy, TrendingUp, TrendingDown, Zap, CheckCircle, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface CompareAllDashboardProps {
  comparison: ComparisonMaster;
  metrics: AggregateMetrics | null;
  onRefresh: () => void;
}

export const CompareAllDashboard: React.FC<CompareAllDashboardProps> = ({
  comparison,
  metrics,
  onRefresh,
}) => {
  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
            Click "Calculate Metrics" to analyze this comparison
          </div>
          <Button onClick={onRefresh} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Calculate Metrics
          </Button>
        </div>
      </div>
    );
  }

  const { performance, reliability, winnerDistribution, statistical } = metrics;

  const pieData = [
    { name: 'Challenge Wins', value: winnerDistribution.challengeWins, color: '#10b981' },
    { name: 'Champion Wins', value: winnerDistribution.championWins, color: '#3b82f6' },
    { name: 'Ties', value: winnerDistribution.ties, color: '#6b7280' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Executive Summary */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-6 h-6" />
                <h2 className="text-2xl font-bold">
                  Winner: {winnerDistribution.challengeWins > winnerDistribution.championWins ? 'CHALLENGE' : 'CHAMPION'}
                </h2>
              </div>
              <p className="text-purple-100 mb-4">
                Based on {comparison.totalExecutions} executions • {statistical.confidenceLevel}% confidence
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                  <span className="text-sm">P-Value: {statistical.pValue.toFixed(3)}</span>
                </div>
                {statistical.isSignificant && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Statistically Significant</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold mb-2">
                {Math.abs(performance.improvement).toFixed(1)}%
              </div>
              <div className="text-purple-100">
                {performance.improvement > 0 ? 'Faster' : 'Slower'}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-purple-400">
            <div className="text-lg font-semibold">Recommendation:</div>
            <div className="text-purple-100">{statistical.recommendation}</div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              Avg Execution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600 dark:text-blue-400">Champion</span>
                <span className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                  {performance.championAvgTime.toFixed(0)}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 dark:text-green-400">Challenge</span>
                <span className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                  {performance.challengeAvgTime.toFixed(0)}ms
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              P95 Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600 dark:text-blue-400">Champion</span>
                <span className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                  {performance.championP95.toFixed(0)}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 dark:text-green-400">Challenge</span>
                <span className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                  {performance.challengeP95.toFixed(0)}ms
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600 dark:text-blue-400">Champion</span>
                <span className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                  {reliability.championSuccessRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 dark:text-green-400">Challenge</span>
                <span className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                  {reliability.challengeSuccessRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              Error Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600 dark:text-blue-400">Champion</span>
                <span className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                  {reliability.championErrorCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 dark:text-green-400">Challenge</span>
                <span className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                  {reliability.challengeErrorCount}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Winner Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Winner Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {winnerDistribution.winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Challenge Win Rate
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Series Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="championAvg" stroke="#3b82f6" name="Champion" />
                <Line type="monotone" dataKey="challengeAvg" stroke="#10b981" name="Challenge" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Node-Level Breakdown */}
      {metrics.nodeAggregates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Node-Level Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-light-border dark:border-dark-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                      Node
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                      Champion Avg
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                      Challenge Avg
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                      Improvement
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                      Winner
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.nodeAggregates.slice(0, 10).map((node, index) => (
                    <tr key={node.nodeId} className="border-b border-light-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 text-sm text-light-text-primary dark:text-dark-text-primary">
                        {node.nodeName}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-light-text-primary dark:text-dark-text-primary">
                        {node.championAvgTime.toFixed(0)}ms
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-light-text-primary dark:text-dark-text-primary">
                        {node.challengeAvgTime.toFixed(0)}ms
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span
                          className={`font-semibold ${
                            node.improvement > 0
                              ? 'text-green-600 dark:text-green-400'
                              : node.improvement < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {node.improvement > 0 && '+'}
                          {node.improvement.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {node.winner === 'challenge' && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full">
                            Challenge
                          </span>
                        )}
                        {node.winner === 'champion' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium rounded-full">
                            Champion
                          </span>
                        )}
                        {node.winner === 'tie' && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
                            Tie
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
