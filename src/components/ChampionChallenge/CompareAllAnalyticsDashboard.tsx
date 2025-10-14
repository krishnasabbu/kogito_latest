import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ChampionChallengeExecution, NodeMetric } from '../../types/championChallenge';
import { useChampionChallengeStore } from '../../stores/championChallengeStore';
import { Trophy, TrendingUp, TrendingDown, Zap, CheckCircle, AlertCircle, Clock, Activity, Database, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Area, AreaChart } from 'recharts';
import { championChallengeService } from '../../services/championChallengeService';

export const CompareAllAnalyticsDashboard: React.FC = () => {
  const { executions } = useChampionChallengeStore();
  const [expandedExecution, setExpandedExecution] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await championChallengeService.listExecutions();
    } finally {
      setIsRefreshing(false);
    }
  };

  const analytics = useMemo(() => {
    if (executions.length === 0) return null;

    const allChampionMetrics: NodeMetric[] = [];
    const allChallengeMetrics: NodeMetric[] = [];

    executions.forEach(exec => {
      if (exec.metrics) {
        allChampionMetrics.push(...(exec.metrics.champion || []));
        allChallengeMetrics.push(...(exec.metrics.challenge || []));
      }
    });

    const championTimes = allChampionMetrics.map(m => m.executionTimeMs);
    const challengeTimes = allChallengeMetrics.map(m => m.executionTimeMs);

    const calculateStats = (values: number[]) => {
      if (values.length === 0) return { avg: 0, min: 0, max: 0, median: 0, p95: 0, stdDev: 0 };
      const sorted = [...values].sort((a, b) => a - b);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const median = sorted[Math.floor(sorted.length / 2)];
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      return {
        avg,
        min: Math.min(...values),
        max: Math.max(...values),
        median,
        p95,
        stdDev
      };
    };

    const championStats = calculateStats(championTimes);
    const challengeStats = calculateStats(challengeTimes);

    const championErrors = allChampionMetrics.filter(m => m.status === 'error').length;
    const challengeErrors = allChallengeMetrics.filter(m => m.status === 'error').length;

    const championSuccessRate = allChampionMetrics.length > 0
      ? ((allChampionMetrics.length - championErrors) / allChampionMetrics.length) * 100
      : 0;
    const challengeSuccessRate = allChallengeMetrics.length > 0
      ? ((allChallengeMetrics.length - challengeErrors) / allChallengeMetrics.length) * 100
      : 0;

    const nodePerformanceMap = new Map<string, { champion: number[], challenge: number[], name: string }>();

    allChampionMetrics.forEach(m => {
      if (!nodePerformanceMap.has(m.nodeId)) {
        nodePerformanceMap.set(m.nodeId, { champion: [], challenge: [], name: m.nodeName });
      }
      nodePerformanceMap.get(m.nodeId)!.champion.push(m.executionTimeMs);
    });

    allChallengeMetrics.forEach(m => {
      if (!nodePerformanceMap.has(m.nodeId)) {
        nodePerformanceMap.set(m.nodeId, { champion: [], challenge: [], name: m.nodeName });
      }
      nodePerformanceMap.get(m.nodeId)!.challenge.push(m.executionTimeMs);
    });

    const nodeComparisons = Array.from(nodePerformanceMap.entries()).map(([nodeId, data]) => {
      const champAvg = data.champion.length > 0 ? data.champion.reduce((a, b) => a + b, 0) / data.champion.length : 0;
      const challAvg = data.challenge.length > 0 ? data.challenge.reduce((a, b) => a + b, 0) / data.challenge.length : 0;
      return {
        nodeId,
        nodeName: data.name,
        championAvg: champAvg,
        challengeAvg: challAvg,
        improvement: champAvg > 0 ? ((champAvg - challAvg) / champAvg) * 100 : 0,
        winner: challAvg < champAvg ? 'challenge' : champAvg < challAvg ? 'champion' : 'tie'
      };
    }).sort((a, b) => Math.abs(b.improvement) - Math.abs(a.improvement));

    const executionTimeline = executions.map(exec => {
      const champTotal = exec.metrics?.champion?.reduce((sum, m) => sum + m.executionTimeMs, 0) || 0;
      const challTotal = exec.metrics?.challenge?.reduce((sum, m) => sum + m.executionTimeMs, 0) || 0;
      return {
        name: exec.name,
        date: new Date(exec.createdAt).toLocaleDateString(),
        champion: champTotal,
        challenge: challTotal,
        diff: champTotal - challTotal
      };
    });

    const performanceDistribution = {
      champion: championTimes.reduce((acc, time) => {
        const bucket = Math.floor(time / 100) * 100;
        acc[bucket] = (acc[bucket] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      challenge: challengeTimes.reduce((acc, time) => {
        const bucket = Math.floor(time / 100) * 100;
        acc[bucket] = (acc[bucket] || 0) + 1;
        return acc;
      }, {} as Record<number, number>)
    };

    const allBuckets = new Set([
      ...Object.keys(performanceDistribution.champion),
      ...Object.keys(performanceDistribution.challenge)
    ]);

    const distributionData = Array.from(allBuckets).sort((a, b) => Number(a) - Number(b)).map(bucket => ({
      range: `${bucket}-${Number(bucket) + 100}ms`,
      champion: performanceDistribution.champion[Number(bucket)] || 0,
      challenge: performanceDistribution.challenge[Number(bucket)] || 0
    }));

    const nodeTypePerformance = new Map<string, { champion: number[], challenge: number[] }>();

    allChampionMetrics.forEach(m => {
      if (!nodeTypePerformance.has(m.nodeType)) {
        nodeTypePerformance.set(m.nodeType, { champion: [], challenge: [] });
      }
      nodeTypePerformance.get(m.nodeType)!.champion.push(m.executionTimeMs);
    });

    allChallengeMetrics.forEach(m => {
      if (!nodeTypePerformance.has(m.nodeType)) {
        nodeTypePerformance.set(m.nodeType, { champion: [], challenge: [] });
      }
      nodeTypePerformance.get(m.nodeType)!.challenge.push(m.executionTimeMs);
    });

    const nodeTypeData = Array.from(nodeTypePerformance.entries()).map(([type, data]) => ({
      type,
      championAvg: data.champion.length > 0 ? data.champion.reduce((a, b) => a + b, 0) / data.champion.length : 0,
      challengeAvg: data.challenge.length > 0 ? data.challenge.reduce((a, b) => a + b, 0) / data.challenge.length : 0,
      championCount: data.champion.length,
      challengeCount: data.challenge.length
    }));

    const radarData = [
      { metric: 'Avg Time', champion: championStats.avg, challenge: challengeStats.avg, fullMark: Math.max(championStats.avg, challengeStats.avg) * 1.2 },
      { metric: 'P95', champion: championStats.p95, challenge: challengeStats.p95, fullMark: Math.max(championStats.p95, challengeStats.p95) * 1.2 },
      { metric: 'Max', champion: championStats.max, challenge: challengeStats.max, fullMark: Math.max(championStats.max, challengeStats.max) * 1.2 },
      { metric: 'Success Rate', champion: championSuccessRate, challenge: challengeSuccessRate, fullMark: 100 },
      { metric: 'Consistency', champion: 100 - (championStats.stdDev / championStats.avg * 100), challenge: 100 - (challengeStats.stdDev / challengeStats.avg * 100), fullMark: 100 }
    ];

    return {
      totalExecutions: executions.length,
      championStats,
      challengeStats,
      championErrors,
      challengeErrors,
      championSuccessRate,
      challengeSuccessRate,
      nodeComparisons,
      executionTimeline,
      distributionData,
      nodeTypeData,
      radarData,
      allChampionMetrics,
      allChallengeMetrics
    };
  }, [executions]);

  if (!analytics || executions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Activity className="w-16 h-16 text-light-text-tertiary dark:text-dark-text-tertiary mb-4 mx-auto" />
          <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            No Executions Found
          </h3>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
            Total executions in store: {executions.length}
          </p>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>
    );
  }

  const improvement = analytics.championStats.avg > 0
    ? ((analytics.championStats.avg - analytics.challengeStats.avg) / analytics.championStats.avg) * 100
    : 0;

  const winner = improvement > 0 ? 'CHALLENGE' : improvement < 0 ? 'CHAMPION' : 'TIE';

  const COLORS = {
    champion: '#3b82f6',
    challenge: '#10b981',
    tie: '#6b7280',
    error: '#ef4444',
    success: '#10b981'
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header Stats */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
              Aggregate Analytics Dashboard
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
              Analyzing {analytics.totalExecutions} executions • {analytics.allChampionMetrics.length + analytics.allChallengeMetrics.length} total node executions
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Executive Summary */}
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-6 h-6" />
                  <h3 className="text-2xl font-bold">Winner: {winner}</h3>
                </div>
                <p className="text-purple-100 text-sm">
                  Based on {analytics.totalExecutions} executions
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold">{Math.abs(improvement).toFixed(1)}%</div>
                <div className="text-purple-100 text-sm mt-1">
                  {improvement > 0 ? 'Challenge Faster' : 'Champion Faster'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{analytics.championSuccessRate.toFixed(1)}% vs {analytics.challengeSuccessRate.toFixed(1)}%</div>
                <div className="text-purple-100 text-sm mt-1">Success Rates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Avg Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 dark:text-blue-400">C</span>
                  <span className="text-lg font-bold">{analytics.championStats.avg.toFixed(0)}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 dark:text-green-400">Ch</span>
                  <span className="text-lg font-bold">{analytics.challengeStats.avg.toFixed(0)}ms</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Median</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 dark:text-blue-400">C</span>
                  <span className="text-lg font-bold">{analytics.championStats.median.toFixed(0)}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 dark:text-green-400">Ch</span>
                  <span className="text-lg font-bold">{analytics.challengeStats.median.toFixed(0)}ms</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-light-text-secondary dark:text-dark-text-secondary">P95</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 dark:text-blue-400">C</span>
                  <span className="text-lg font-bold">{analytics.championStats.p95.toFixed(0)}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 dark:text-green-400">Ch</span>
                  <span className="text-lg font-bold">{analytics.challengeStats.p95.toFixed(0)}ms</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Min/Max</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 dark:text-blue-400">C</span>
                  <span className="text-sm font-bold">{analytics.championStats.min}-{analytics.championStats.max}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 dark:text-green-400">Ch</span>
                  <span className="text-sm font-bold">{analytics.challengeStats.min}-{analytics.challengeStats.max}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Std Dev</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 dark:text-blue-400">C</span>
                  <span className="text-lg font-bold">{analytics.championStats.stdDev.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 dark:text-green-400">Ch</span>
                  <span className="text-lg font-bold">{analytics.challengeStats.stdDev.toFixed(0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 dark:text-blue-400">C</span>
                  <span className="text-lg font-bold text-red-600">{analytics.championErrors}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 dark:text-green-400">Ch</span>
                  <span className="text-lg font-bold text-red-600">{analytics.challengeErrors}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart - Overall Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Multi-Dimensional Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={analytics.radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis />
                  <Radar name="Champion" dataKey="champion" stroke={COLORS.champion} fill={COLORS.champion} fillOpacity={0.3} />
                  <Radar name="Challenge" dataKey="challenge" stroke={COLORS.challenge} fill={COLORS.challenge} fillOpacity={0.3} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Timeline Execution */}
          <Card>
            <CardHeader>
              <CardTitle>Execution Timeline (Total Time)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.executionTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="champion" stackId="1" stroke={COLORS.champion} fill={COLORS.champion} fillOpacity={0.6} />
                  <Area type="monotone" dataKey="challenge" stackId="2" stroke={COLORS.challenge} fill={COLORS.challenge} fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid - Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Distribution (Histogram)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="champion" fill={COLORS.champion} name="Champion" />
                  <Bar dataKey="challenge" fill={COLORS.challenge} name="Challenge" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Node Type Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Node Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.nodeTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="type" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="championAvg" fill={COLORS.champion} name="Champion Avg (ms)" />
                  <Bar dataKey="challengeAvg" fill={COLORS.challenge} name="Challenge Avg (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Node Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Node-Level Performance Comparison (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-light-border dark:border-dark-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold">Node Name</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">Champion Avg</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">Challenge Avg</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">Improvement</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold">Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.nodeComparisons.slice(0, 10).map((node) => (
                    <tr key={node.nodeId} className="border-b border-light-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 text-sm">{node.nodeName}</td>
                      <td className="py-3 px-4 text-sm text-right">{node.championAvg.toFixed(0)}ms</td>
                      <td className="py-3 px-4 text-sm text-right">{node.challengeAvg.toFixed(0)}ms</td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className={node.improvement > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {node.improvement > 0 ? '+' : ''}{node.improvement.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          node.winner === 'challenge' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          node.winner === 'champion' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {node.winner === 'challenge' ? 'Challenge' : node.winner === 'champion' ? 'Champion' : 'Tie'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Individual Execution Deep Dive */}
        <Card>
          <CardHeader>
            <CardTitle>Individual Execution Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {executions.map((exec) => (
                <div key={exec.id} className="border border-light-border dark:border-dark-border rounded-lg">
                  <button
                    onClick={() => setExpandedExecution(expandedExecution === exec.id ? null : exec.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{exec.name}</span>
                      <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {new Date(exec.createdAt).toLocaleString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        exec.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {exec.status}
                      </span>
                    </div>
                    {expandedExecution === exec.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>

                  {expandedExecution === exec.id && (
                    <div className="px-4 pb-4 space-y-4">
                      {/* Request Payload */}
                      <div>
                        <h4 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">Request Payload:</h4>
                        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                          {JSON.stringify(exec.requestPayload, null, 2)}
                        </pre>
                      </div>

                      {/* Node Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                            Champion Nodes ({exec.metrics?.champion?.length || 0})
                          </h4>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {exec.metrics?.champion?.map((metric, idx) => (
                              <div key={idx} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-xs">
                                <div className="font-semibold mb-1">{metric.nodeName} ({metric.nodeType})</div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>Time: {metric.executionTimeMs}ms</div>
                                  <div>Status: <span className={metric.status === 'success' ? 'text-green-600' : 'text-red-600'}>{metric.status}</span></div>
                                </div>
                                {metric.requestData && (
                                  <details className="mt-2">
                                    <summary className="cursor-pointer text-blue-600">Request</summary>
                                    <pre className="mt-1 bg-white dark:bg-gray-900 p-2 rounded overflow-x-auto">
                                      {JSON.stringify(metric.requestData, null, 2)}
                                    </pre>
                                  </details>
                                )}
                                {metric.responseData && (
                                  <details className="mt-2">
                                    <summary className="cursor-pointer text-blue-600">Response</summary>
                                    <pre className="mt-1 bg-white dark:bg-gray-900 p-2 rounded overflow-x-auto">
                                      {JSON.stringify(metric.responseData, null, 2)}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                            Challenge Nodes ({exec.metrics?.challenge?.length || 0})
                          </h4>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {exec.metrics?.challenge?.map((metric, idx) => (
                              <div key={idx} className="bg-green-50 dark:bg-green-900/20 p-3 rounded text-xs">
                                <div className="font-semibold mb-1">{metric.nodeName} ({metric.nodeType})</div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>Time: {metric.executionTimeMs}ms</div>
                                  <div>Status: <span className={metric.status === 'success' ? 'text-green-600' : 'text-red-600'}>{metric.status}</span></div>
                                </div>
                                {metric.requestData && (
                                  <details className="mt-2">
                                    <summary className="cursor-pointer text-green-600">Request</summary>
                                    <pre className="mt-1 bg-white dark:bg-gray-900 p-2 rounded overflow-x-auto">
                                      {JSON.stringify(metric.requestData, null, 2)}
                                    </pre>
                                  </details>
                                )}
                                {metric.responseData && (
                                  <details className="mt-2">
                                    <summary className="cursor-pointer text-green-600">Response</summary>
                                    <pre className="mt-1 bg-white dark:bg-gray-900 p-2 rounded overflow-x-auto">
                                      {JSON.stringify(metric.responseData, null, 2)}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
