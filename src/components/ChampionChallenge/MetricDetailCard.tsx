import React, { useState } from 'react';
import { Card } from '../ui/card';
import { NodeMetric } from '../../types/championChallenge';
import { CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';

interface MetricDetailCardProps {
  metric: NodeMetric;
  comparisonMetric?: NodeMetric;
}

export const MetricDetailCard: React.FC<MetricDetailCardProps> = ({
  metric,
  comparisonMetric,
}) => {
  const [showRequest, setShowRequest] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const calculateDifference = (value1: number, value2: number) => {
    const diff = ((value2 - value1) / value1) * 100;
    const isPositive = diff > 0;
    return {
      value: Math.abs(diff).toFixed(1),
      isPositive,
      color: isPositive ? 'text-red-600' : 'text-green-600',
    };
  };

  const variantColor = metric.variant === 'champion' ? 'bg-blue-600' : 'bg-purple-600';
  const variantLabel = metric.variant === 'champion' ? 'Champion' : 'Challenge';

  return (
    <Card className="overflow-hidden">
      <div className={`${variantColor} text-white px-4 py-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(metric.status)}
            <span className="font-semibold">{variantLabel}</span>
          </div>
          <span className="text-sm opacity-90">{metric.nodeType}</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{metric.nodeName}</h3>
          <p className="text-sm text-gray-600">Node ID: {metric.nodeId}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Execution Time</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{metric.executionTimeMs}</span>
              <span className="text-sm text-gray-500">ms</span>
              {comparisonMetric && (
                <span
                  className={`text-sm ${
                    calculateDifference(
                      comparisonMetric.executionTimeMs,
                      metric.executionTimeMs
                    ).color
                  }`}
                >
                  {calculateDifference(
                    comparisonMetric.executionTimeMs,
                    metric.executionTimeMs
                  ).isPositive
                    ? '+'
                    : '-'}
                  {
                    calculateDifference(
                      comparisonMetric.executionTimeMs,
                      metric.executionTimeMs
                    ).value
                  }
                  %
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-600">Status</div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  metric.status === 'success'
                    ? 'bg-green-100 text-green-700'
                    : metric.status === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {metric.status}
              </span>
            </div>
          </div>
        </div>

        {metric.metadata && Object.keys(metric.metadata).length > 0 && (
          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
            {metric.metadata.memoryUsed !== undefined && (
              <div className="space-y-1">
                <div className="text-xs text-gray-600">Memory Used</div>
                <div className="text-lg font-semibold">
                  {metric.metadata.memoryUsed.toFixed(2)} MB
                </div>
              </div>
            )}

            {metric.metadata.cpuUsage !== undefined && (
              <div className="space-y-1">
                <div className="text-xs text-gray-600">CPU Usage</div>
                <div className="text-lg font-semibold">
                  {metric.metadata.cpuUsage.toFixed(2)}%
                </div>
              </div>
            )}
          </div>
        )}

        {metric.errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm font-medium text-red-700 mb-1">Error</div>
            <div className="text-sm text-red-600">{metric.errorMessage}</div>
          </div>
        )}

        <div className="space-y-2 pt-3 border-t">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRequest(!showRequest)}
              className="w-full justify-between hover:bg-gray-100"
            >
              <span className="font-medium">Request Data</span>
              {showRequest ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {showRequest && metric.requestData && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 overflow-auto max-h-64">
                <pre className="text-xs font-mono">{formatJson(metric.requestData)}</pre>
              </div>
            )}
          </div>

          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResponse(!showResponse)}
              className="w-full justify-between hover:bg-gray-100"
            >
              <span className="font-medium">Response Data</span>
              {showResponse ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {showResponse && metric.responseData && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 overflow-auto max-h-64">
                <pre className="text-xs font-mono">{formatJson(metric.responseData)}</pre>
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t text-xs text-gray-500">
          <div>Started: {new Date(metric.startedAt).toLocaleString()}</div>
          {metric.completedAt && (
            <div>Completed: {new Date(metric.completedAt).toLocaleString()}</div>
          )}
        </div>
      </div>
    </Card>
  );
};
