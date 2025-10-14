import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'react-flow-renderer';
import { NodeMetric } from '../../types/championChallenge';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface ComparisonNodeData {
  metric: NodeMetric;
  variant: 'champion' | 'challenge';
  isHighlighted?: boolean;
  onClick?: () => void;
}

export const ComparisonFlowNode = memo(({ data }: NodeProps<ComparisonNodeData>) => {
  const { metric, variant, isHighlighted, onClick } = data;

  const getStatusIcon = () => {
    switch (metric.status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'skipped':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (metric.status) {
      case 'success':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      case 'skipped':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const variantColor = variant === 'champion' ? 'bg-wells-red' : 'bg-wells-gold text-gray-900';

  return (
    <div
      className={`min-w-[200px] rounded-lg border-2 shadow-lg transition-all duration-200 cursor-pointer hover:shadow-xl ${
        getStatusColor()
      } ${isHighlighted ? 'ring-4 ring-wells-red' : ''}`}
      onClick={onClick}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className={`${variantColor} text-white px-3 py-1 text-xs font-semibold rounded-t`}>
        {variant.toUpperCase()}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{metric.nodeName}</div>
            <div className="text-xs text-gray-500">{metric.nodeType}</div>
          </div>
          <div className="flex-shrink-0">{getStatusIcon()}</div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Time:</span>
            <span className="font-mono font-semibold">{metric.executionTimeMs}ms</span>
          </div>

          {metric.metadata?.memoryUsed !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Memory:</span>
              <span className="font-mono">{metric.metadata.memoryUsed.toFixed(1)}MB</span>
            </div>
          )}

          {metric.metadata?.cpuUsage !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">CPU:</span>
              <span className="font-mono">{metric.metadata.cpuUsage.toFixed(1)}%</span>
            </div>
          )}
        </div>

        {metric.errorMessage && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700">
            {metric.errorMessage}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

ComparisonFlowNode.displayName = 'ComparisonFlowNode';
