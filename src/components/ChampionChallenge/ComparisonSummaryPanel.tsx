import React from 'react';
import { Card } from '../ui/card';
import { ComparisonSummary } from '../../types/championChallenge';
import { Trophy, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface ComparisonSummaryPanelProps {
  summary: ComparisonSummary;
}

export const ComparisonSummaryPanel: React.FC<ComparisonSummaryPanelProps> = ({
  summary,
}) => {
  const renderMetricCard = (
    title: string,
    metric: any,
    unit: string,
    inverse: boolean = false
  ) => {
    const isChampionBetter = inverse
      ? metric.winner === 'champion'
        ? metric.challengeValue < metric.championValue
        : metric.championValue < metric.challengeValue
      : metric.winner === 'champion';

    const getWinnerIcon = () => {
      if (metric.winner === 'tie')
        return <Minus className="w-5 h-5 text-gray-500" />;
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    };

    const getTrendIcon = (value: number) => {
      if (Math.abs(value) < 1) return null;
      return value > 0 ? (
        <TrendingUp className="w-4 h-4 text-red-500" />
      ) : (
        <TrendingDown className="w-4 h-4 text-green-500" />
      );
    };

    return (
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-600">{title}</h4>
            {getWinnerIcon()}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div
              className={`p-3 rounded-lg ${
                isChampionBetter ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'
              }`}
            >
              <div className="text-xs text-gray-600 mb-1">Champion</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold">
                  {metric.championValue.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">{unit}</span>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg ${
                !isChampionBetter && metric.winner !== 'tie'
                  ? 'bg-purple-50 border-2 border-purple-300'
                  : 'bg-gray-50'
              }`}
            >
              <div className="text-xs text-gray-600 mb-1">Challenge</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold">
                  {metric.challengeValue.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">{unit}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-gray-600">Difference</span>
            <div className="flex items-center gap-2">
              {getTrendIcon(metric.differencePercentage)}
              <span
                className={`text-sm font-semibold ${
                  Math.abs(metric.differencePercentage) < 1
                    ? 'text-gray-600'
                    : metric.differencePercentage > 0
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {metric.differencePercentage > 0 ? '+' : ''}
                {metric.differencePercentage.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold mb-1">Performance Comparison</h3>
        <p className="text-sm text-gray-600">
          Side-by-side metrics comparison between champion and challenge
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderMetricCard(
          'Total Execution Time',
          summary.totalExecutionTime,
          'ms',
          false
        )}
        {renderMetricCard(
          'Average Node Time',
          summary.averageNodeTime,
          'ms',
          false
        )}
        {renderMetricCard('Success Rate', summary.successRate, '%', true)}
        {renderMetricCard('Error Count', summary.errorCount, 'errors', false)}
      </div>

      <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold mb-1">Overall Winner</h4>
            <p className="text-sm text-gray-600">
              Based on execution time and success rate
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-2xl font-bold">
                {summary.totalExecutionTime.winner === 'champion'
                  ? 'Champion'
                  : summary.totalExecutionTime.winner === 'challenge'
                  ? 'Challenge'
                  : 'Tie'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {summary.totalExecutionTime.winner !== 'tie' &&
                `${Math.abs(summary.totalExecutionTime.differencePercentage).toFixed(
                  1
                )}% faster`}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
