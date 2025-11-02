import React, { useState, useMemo, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Position,
} from 'react-flow-renderer';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Code,
  AlertCircle,
} from 'lucide-react';

interface NodeMetric {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  executionTimeMs: number;
  status: 'success' | 'error';
  timestamp: string;
  requestData?: any;
  responseData?: any;
  errorMessage?: string;
}

interface ExecutionData {
  id: string;
  name: string;
  inputRequest: any;
  outputResults: any;
  metrics: {
    champion: NodeMetric[];
    challenge: NodeMetric[];
  };
}

interface ExecutionFlowVisualizationProps {
  execution: ExecutionData;
  variant?: 'champion' | 'challenge';
}

const FlowNode: React.FC<{ data: any }> = ({ data }) => {
  const { nodeName, status, executionTimeMs, nodeType } = data;

  const getStatusIcon = () => {
    if (status === 'success')
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'error') return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-blue-500" />;
  };

  const getStatusColor = () => {
    if (status === 'success') return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    if (status === 'error') return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] transition-all hover:shadow-xl cursor-pointer ${getStatusColor()}`}
    >
      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon()}
        <div className="font-semibold text-sm text-gray-900 dark:text-white">
          {nodeName}
        </div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3" />
          <span className="font-mono">{executionTimeMs}ms</span>
        </div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {nodeType}
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  flowNode: FlowNode,
};

export const ExecutionFlowVisualization: React.FC<
  ExecutionFlowVisualizationProps
> = ({ execution, variant = 'champion' }) => {
  const [selectedNode, setSelectedNode] = useState<NodeMetric | null>(null);
  const [collapsedPanels, setCollapsedPanels] = useState({
    input: false,
    output: false,
    logs: false,
  });

  const metrics = variant === 'champion'
    ? execution.metrics.champion
    : execution.metrics.challenge;

  const { nodes, edges } = useMemo(() => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    metrics.forEach((metric, index) => {
      const yPosition = index * 120 + 50;

      flowNodes.push({
        id: metric.nodeId,
        type: 'flowNode',
        position: { x: 250, y: yPosition },
        data: {
          ...metric,
          onClick: () => setSelectedNode(metric),
        },
      });

      if (index > 0) {
        flowEdges.push({
          id: `e-${metrics[index - 1].nodeId}-${metric.nodeId}`,
          source: metrics[index - 1].nodeId,
          target: metric.nodeId,
          animated: true,
          style: {
            stroke: variant === 'champion' ? '#D71E28' : '#FFCD41',
            strokeWidth: 2,
          },
        });
      }
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [metrics, variant]);

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const metric = metrics.find((m) => m.nodeId === node.id);
      if (metric) {
        setSelectedNode(metric);
      }
    },
    [metrics]
  );

  const togglePanel = (panel: keyof typeof collapsedPanels) => {
    setCollapsedPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  const renderJsonData = (data: any, title: string) => {
    if (!data) return null;
    return (
      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Code className="w-4 h-4" />
          {title}
        </div>
        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs font-mono overflow-auto max-h-64 border border-gray-200 dark:border-gray-700">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-4 p-6 bg-light-bg dark:bg-dark-bg">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col overflow-hidden">
          <div
            className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer"
            onClick={() => togglePanel('input')}
          >
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              <h3 className="font-semibold">Input Request</h3>
            </div>
            {collapsedPanels.input ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </div>
          {!collapsedPanels.input && (
            <div className="flex-1 overflow-auto p-4">
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs font-mono border border-gray-200 dark:border-gray-700">
                {JSON.stringify(execution.inputRequest, null, 2)}
              </pre>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <h3 className="font-semibold">Execution Flow</h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-white/20 rounded-full">
                {metrics.length} nodes
              </span>
            </div>
            <div className="text-sm">
              {variant === 'champion' ? (
                <span className="px-3 py-1 bg-red-500 rounded-full font-semibold">
                  Champion
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-500 text-gray-900 rounded-full font-semibold">
                  Challenge
                </span>
              )}
            </div>
          </div>
          <div className="flex-1">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={handleNodeClick}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              attributionPosition="bottom-left"
            >
              <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
              <Controls className="bg-white dark:bg-gray-800 shadow-lg" />
              <MiniMap
                nodeColor={(node) => {
                  const metric = metrics.find((m) => m.nodeId === node.id);
                  if (metric?.status === 'success') return '#10b981';
                  if (metric?.status === 'error') return '#ef4444';
                  return '#3b82f6';
                }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              />
            </ReactFlow>
          </div>
        </Card>

        <Card className="flex flex-col overflow-hidden">
          <div
            className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-500 to-green-600 text-white cursor-pointer"
            onClick={() => togglePanel('output')}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <h3 className="font-semibold">Execution Results</h3>
            </div>
            {collapsedPanels.output ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </div>
          {!collapsedPanels.output && (
            <div className="flex-1 overflow-auto p-4">
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs font-mono border border-gray-200 dark:border-gray-700">
                {JSON.stringify(execution.outputResults, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      </div>

      <Card className="flex flex-col overflow-hidden max-h-[400px]">
        <div
          className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600 text-white cursor-pointer"
          onClick={() => togglePanel('logs')}
        >
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <h3 className="font-semibold">Execution Logs</h3>
            {selectedNode && (
              <span className="px-2 py-0.5 text-xs font-medium bg-white/20 rounded-full">
                {selectedNode.nodeName}
              </span>
            )}
          </div>
          {collapsedPanels.logs ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronUp className="w-5 h-5" />
          )}
        </div>
        {!collapsedPanels.logs && (
          <div className="flex-1 overflow-auto p-4">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    {selectedNode.status === 'success' ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                    <div>
                      <div className="font-semibold text-lg text-gray-900 dark:text-white">
                        {selectedNode.nodeName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedNode.nodeType}
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Execution Time
                    </div>
                    <div className="text-lg font-semibold font-mono text-gray-900 dark:text-white">
                      {selectedNode.executionTimeMs}ms
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Status
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        selectedNode.status === 'success'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {selectedNode.status.toUpperCase()}
                    </div>
                  </div>
                </div>

                {selectedNode.errorMessage && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-red-700 dark:text-red-400 mb-1">
                          Error Message
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-300">
                          {selectedNode.errorMessage}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    {renderJsonData(selectedNode.requestData, 'Request Payload')}
                  </div>
                  <div>
                    {renderJsonData(
                      selectedNode.responseData,
                      'Response Payload'
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>
                      Timestamp:{' '}
                      {new Date(selectedNode.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Activity className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" />
                <div className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                  No Node Selected
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  Click on any node in the flow graph to view its execution details
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
