import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ChampionChallengeExecution } from '../../types/championChallenge';
import { championChallengeService } from '../../services/championChallengeService';
import { Trophy, TrendingUp, Zap, CheckCircle, RefreshCw, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

export const CompareAllSimpleDashboard: React.FC = () => {
  const [executions, setExecutions] = useState<ChampionChallengeExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExecutions();
  }, []);

  const loadExecutions = async () => {
    setIsLoading(true);
    try {
      const data = await championChallengeService.listExecutions();
      setExecutions(data.filter(e => e.status === 'completed'));
    } catch (error) {
      console.error('Failed to load executions:', error);
      toast.error('Failed to load executions');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Loading executions...
          </p>
        </div>
      </div>
    );
  }

  if (executions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-light-text-tertiary dark:text-dark-text-tertiary mb-4 mx-auto" />
          <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            No Completed Executions
          </h3>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
            Run some champion vs challenge executions first
          </p>
        </div>
      </div>
    );
  }

  // Calculate aggregate metrics from existing executions
  const calculateMetrics = () => {
    const totalExecutions = executions.length;

    // Champion vs Challenge times
    const championTimes = executions
      .map(e => e.metrics?.champion?.reduce((sum, m) => sum + m.executionTimeMs, 0) || 0)
      .filter(t => t > 0);

    const challengeTimes = executions
      .map(e => e.metrics?.challenge?.reduce((sum, m) => sum + m.executionTimeMs, 0) || 0)
      .filter(t => t > 0);

    const championAvg = championTimes.reduce((sum, t) => sum + t, 0) / championTimes.length || 0;
    const challengeAvg = challengeTimes.reduce((sum, t) => sum + t, 0) / challengeTimes.length || 0;
    const improvement = championAvg > 0 ? ((championAvg - challengeAvg) / championAvg) * 100 : 0;

    // Winner distribution
    const championWins = executions.filter(e =>
      (e.metrics?.champion?.reduce((sum, m) => sum + m.executionTimeMs, 0) || 0) <
      (e.metrics?.challenge?.reduce((sum, m) => sum + m.executionTimeMs, 0) || 0)
    ).length;

    const challengeWins = executions.filter(e =>
      (e.metrics?.challenge?.reduce((sum, m) => sum + m.executionTimeMs, 0) || 0) <
      (e.metrics?.champion?.reduce((sum, m) => sum + m.executionTimeMs, 0) || 0)
    ).length;

    const ties = totalExecutions - championWins - challengeWins;

    // Success rates
    const championErrors = executions.filter(e =>
      e.metrics?.champion?.some(m => m.status === 'error')
    ).length;

    const challengeErrors = executions.filter(e =>
      e.metrics?.challenge?.some(m => m.status === 'error')
    ).length;

    const championSuccessRate = ((totalExecutions - championErrors) / totalExecutions) * 100;
    const challengeSuccessRate = ((totalExecutions - challengeErrors) / totalExecutions) * 100;

    // Time series data
    const timeSeriesData = executions
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(e => ({
        date: new Date(e.createdAt).toLocaleDateString(),
        champion: e.metrics?.champion?.reduce((sum, m) => sum + m.executionTimeMs, 0) || 0,
        challenge: e.metrics?.challenge?.reduce((sum, m) => sum + m.executionTimeMs, 0) || 0,
      }));

    return {
      totalExecutions,
      championAvg,
      challengeAvg,
      improvement,
      championWins,
      challengeWins,
      ties,
      championSuccessRate,
      challengeSuccessRate,
      championErrors,
      challengeErrors,
      timeSeriesData,
    };
  };

  const metrics = calculateMetrics();

  const pieData = [
    { name: 'Challenge Wins', value: metrics.challengeWins, color: '#10b981' },
    { name: 'Champion Wins', value: metrics.championWins, color: '#3b82f6' },
    { name: 'Ties', value: metrics.ties, color: '#6b7280' },
  ];

  const winner = metrics.challengeWins > metrics.championWins ? 'CHALLENGE' :
                 metrics.championWins > metrics.challengeWins ? 'CHAMPION' : 'TIE';

  const recommendation = metrics.improvement > 10 ? 'Deploy Challenge - Significantly Faster' :
                         metrics.improvement < -10 ? 'Keep Champion - Better Performance' :
                         'Continue Testing - No Clear Winner';

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Executive Summary */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Winner: {winner}</h2>
              </div>
              <p className="text-purple-100 mb-4">
                Based on {metrics.totalExecutions} completed executions
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                  <span className="text-sm">All Executions Analyzed</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold mb-2">
                {Math.abs(metrics.improvement).toFixed(1)}%
              </div>
              <div className="text-purple-100">
                {metrics.improvement > 0 ? 'Challenge Faster' : metrics.improvement < 0 ? 'Champion Faster' : 'Same'}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-purple-400">
            <div className="text-lg font-semibold">Recommendation:</div>
            <div className="text-purple-100">{recommendation}</div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              Total Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
              {metrics.totalExecutions}
            </div>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2">
              Completed comparisons
            </p>
          </CardContent>
        </Card>

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
                  {metrics.championAvg.toFixed(0)}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 dark:text-green-400">Challenge</span>
                <span className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                  {metrics.challengeAvg.toFixed(0)}ms
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
                  {metrics.championSuccessRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 dark:text-green-400">Challenge</span>
                <span className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                  {metrics.challengeSuccessRate.toFixed(1)}%
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
                  {metrics.championErrors}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 dark:text-green-400">Challenge</span>
                <span className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                  {metrics.challengeErrors}
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
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {metrics.challengeWins}
                </div>
                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  Challenge Wins
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {metrics.championWins}
                </div>
                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  Champion Wins
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {metrics.ties}
                </div>
                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  Ties
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Series Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="champion"
                  stroke="#3b82f6"
                  name="Champion (ms)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="challenge"
                  stroke="#10b981"
                  name="Challenge (ms)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={loadExecutions} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
};
