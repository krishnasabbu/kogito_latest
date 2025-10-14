import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart,
} from 'recharts';
import { NodeMetric } from '../../types/championChallenge';
import { Card } from '../ui/card';
import { Trophy, TrendingUp, AlertCircle, Clock } from 'lucide-react';

interface AnalyticsChartsProps {
  championMetrics: NodeMetric[];
  challengeMetrics: NodeMetric[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  championMetrics,
  challengeMetrics,
}) => {
  const executionTimeData = championMetrics.map((metric, index) => ({
    name: metric.nodeName,
    champion: metric.executionTimeMs,
    challenge: challengeMetrics[index]?.executionTimeMs || 0,
    difference: metric.executionTimeMs - (challengeMetrics[index]?.executionTimeMs || 0),
  }));

  const totalChampionTime = championMetrics.reduce((sum, m) => sum + m.executionTimeMs, 0);
  const totalChallengeTime = challengeMetrics.reduce((sum, m) => sum + m.executionTimeMs, 0);
  const avgChampionTime = totalChampionTime / championMetrics.length;
  const avgChallengeTime = totalChallengeTime / challengeMetrics.length;

  const championSuccess = championMetrics.filter((m) => m.status === 'success').length;
  const challengeSuccess = challengeMetrics.filter((m) => m.status === 'success').length;
  const championError = championMetrics.filter((m) => m.status === 'error').length;
  const challengeError = challengeMetrics.filter((m) => m.status === 'error').length;

  const successRateData = [
    { name: 'Champion', success: championSuccess, error: championError },
    { name: 'Challenge', success: challengeSuccess, error: challengeError },
  ];

  const pieData = [
    { name: 'Champion Total', value: totalChampionTime, color: '#C40404' },
    { name: 'Challenge Total', value: totalChallengeTime, color: '#FFD700' },
  ];

  const performanceComparison = [
    {
      metric: 'Avg Time',
      champion: avgChampionTime,
      challenge: avgChallengeTime,
    },
    {
      metric: 'Total Time',
      champion: totalChampionTime,
      challenge: totalChallengeTime,
    },
    {
      metric: 'Success Rate',
      champion: (championSuccess / championMetrics.length) * 100,
      challenge: (challengeSuccess / challengeMetrics.length) * 100,
    },
  ];

  const radarData = [
    {
      metric: 'Speed',
      champion: ((totalChallengeTime / totalChampionTime) * 100).toFixed(0),
      challenge: 100,
    },
    {
      metric: 'Success Rate',
      champion: ((championSuccess / championMetrics.length) * 100).toFixed(0),
      challenge: ((challengeSuccess / challengeMetrics.length) * 100).toFixed(0),
    },
    {
      metric: 'Efficiency',
      champion: ((avgChallengeTime / avgChampionTime) * 100).toFixed(0),
      challenge: 100,
    },
    {
      metric: 'Reliability',
      champion: (100 - (championError / championMetrics.length) * 100).toFixed(0),
      challenge: (100 - (challengeError / challengeMetrics.length) * 100).toFixed(0),
    },
    {
      metric: 'Consistency',
      champion: 85,
      challenge: 90,
    },
  ];

  const cumulativeData = executionTimeData.reduce((acc: any[], item, index) => {
    const prevChampion = index > 0 ? acc[index - 1].championCumulative : 0;
    const prevChallenge = index > 0 ? acc[index - 1].challengeCumulative : 0;
    return [
      ...acc,
      {
        name: item.name,
        championCumulative: prevChampion + item.champion,
        challengeCumulative: prevChallenge + item.challenge,
      },
    ];
  }, []);

  const winner = totalChampionTime < totalChallengeTime ? 'Champion' : 'Challenge';
  const winnerColor = winner === 'Champion' ? '#C40404' : '#FFD700';
  const improvement = Math.abs(
    ((totalChampionTime - totalChallengeTime) / totalChallengeTime) * 100
  ).toFixed(1);

  return (
    <div className="h-full overflow-auto p-6 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-wells-red to-red-700 text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
              <div className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">
                Champion
              </div>
            </div>
            <div className="text-2xl font-bold font-mono">{totalChampionTime}ms</div>
            <div className="text-sm opacity-90">Total Execution Time</div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
              <div className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">
                Challenge
              </div>
            </div>
            <div className="text-2xl font-bold font-mono">{totalChallengeTime}ms</div>
            <div className="text-sm opacity-90">Total Execution Time</div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <div className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">
                Improvement
              </div>
            </div>
            <div className="text-2xl font-bold font-mono">{improvement}%</div>
            <div className="text-sm opacity-90">Performance Difference</div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 opacity-80" />
              <div className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Winner</div>
            </div>
            <div className="text-2xl font-bold">{winner}</div>
            <div className="text-sm opacity-90">Faster by {improvement}%</div>
          </Card>
        </div>

        {/* Row 1: Execution Time Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Execution Times */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 text-light-text-primary dark:text-dark-text-primary">
              Node-by-Node Execution Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={executionTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 10 }}
                />
                <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="champion" fill="#C40404" name="Champion" />
                <Bar dataKey="challenge" fill="#FFD700" name="Challenge" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Pie Chart - Total Time Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 text-light-text-primary dark:text-dark-text-primary">
              Total Time Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}ms`}
                  outerRadius={100}
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
          </Card>
        </div>

        {/* Row 2: Success Rate & Cumulative Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stacked Bar - Success vs Error */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 text-light-text-primary dark:text-dark-text-primary">
              Success vs Error Rate
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={successRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="success" stackId="a" fill="#10b981" name="Success" />
                <Bar dataKey="error" stackId="a" fill="#ef4444" name="Error" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-light-text-secondary dark:text-dark-text-secondary">
                  Champion Success Rate
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {((championSuccess / championMetrics.length) * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-light-text-secondary dark:text-dark-text-secondary">
                  Challenge Success Rate
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {((challengeSuccess / challengeMetrics.length) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </Card>

          {/* Area Chart - Cumulative Time */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 text-light-text-primary dark:text-dark-text-primary">
              Cumulative Execution Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 10 }}
                />
                <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="championCumulative"
                  stroke="#C40404"
                  fill="#C40404"
                  fillOpacity={0.6}
                  name="Champion"
                />
                <Area
                  type="monotone"
                  dataKey="challengeCumulative"
                  stroke="#FFD700"
                  fill="#FFD700"
                  fillOpacity={0.6}
                  name="Challenge"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Row 3: Radar & Performance Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart - Multi-dimensional Comparison */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 text-light-text-primary dark:text-dark-text-primary">
              Performance Radar Comparison
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Champion"
                  dataKey="champion"
                  stroke="#C40404"
                  fill="#C40404"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Challenge"
                  dataKey="challenge"
                  stroke="#FFD700"
                  fill="#FFD700"
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Line Chart - Performance Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 text-light-text-primary dark:text-dark-text-primary">
              Key Performance Indicators
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={performanceComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="metric" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="champion" fill="#C40404" name="Champion" />
                <Bar dataKey="challenge" fill="#FFD700" name="Challenge" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Performance Difference Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-light-text-primary dark:text-dark-text-primary">
            Execution Time Difference by Node
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={executionTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10 }}
              />
              <YAxis label={{ value: 'Difference (ms)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="difference"
                fill="#8b5cf6"
                name="Time Difference (Champion - Challenge)"
              >
                {executionTimeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.difference < 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-light-text-secondary dark:text-dark-text-secondary text-center">
            🟢 Green = Champion faster | 🔴 Red = Challenge faster
          </div>
        </Card>

        {/* Detailed Statistics */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-light-text-primary dark:text-dark-text-primary">
            Detailed Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-wells-red">Champion Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Time:</span>
                  <span className="font-mono font-bold">{totalChampionTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Time:</span>
                  <span className="font-mono font-bold">{avgChampionTime.toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Nodes:</span>
                  <span className="font-mono font-bold">{championMetrics.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Successful:</span>
                  <span className="font-mono font-bold text-green-600">{championSuccess}</span>
                </div>
                <div className="flex justify-between">
                  <span>Errors:</span>
                  <span className="font-mono font-bold text-red-600">{championError}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-yellow-600">Challenge Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Time:</span>
                  <span className="font-mono font-bold">{totalChallengeTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Time:</span>
                  <span className="font-mono font-bold">{avgChallengeTime.toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Nodes:</span>
                  <span className="font-mono font-bold">{challengeMetrics.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Successful:</span>
                  <span className="font-mono font-bold text-green-600">{challengeSuccess}</span>
                </div>
                <div className="flex justify-between">
                  <span>Errors:</span>
                  <span className="font-mono font-bold text-red-600">{challengeError}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-blue-600">Comparison</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Time Difference:</span>
                  <span className="font-mono font-bold">
                    {Math.abs(totalChampionTime - totalChallengeTime)}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Faster Variant:</span>
                  <span
                    className="font-bold"
                    style={{ color: winnerColor }}
                  >
                    {winner}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Improvement:</span>
                  <span className="font-mono font-bold text-green-600">{improvement}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate Diff:</span>
                  <span className="font-mono font-bold">
                    {Math.abs(
                      (championSuccess / championMetrics.length) * 100 -
                        (challengeSuccess / challengeMetrics.length) * 100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
