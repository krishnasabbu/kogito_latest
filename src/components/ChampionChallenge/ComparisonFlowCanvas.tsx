import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  ConnectionLineType,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from 'react-flow-renderer';
import { ComparisonFlowNode } from './ComparisonFlowNode';
import { NodeMetric } from '../../types/championChallenge';
import { Card } from '../ui/card';

interface ComparisonFlowCanvasProps {
  championMetrics: NodeMetric[];
  challengeMetrics: NodeMetric[];
  onNodeClick?: (metric: NodeMetric) => void;
}

const nodeTypes = {
  comparisonNode: ComparisonFlowNode,
};

export const ComparisonFlowCanvas: React.FC<ComparisonFlowCanvasProps> = ({
  championMetrics,
  challengeMetrics,
  onNodeClick,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    const championX = 50;
    const challengeX = 450;
    const startY = 100;
    const verticalSpacing = 200;

    championMetrics.forEach((metric, index) => {
      const nodeId = `champion-${metric.nodeId}-${index}`;

      newNodes.push({
        id: nodeId,
        type: 'comparisonNode',
        position: { x: championX, y: startY + index * verticalSpacing },
        draggable: true,
        data: {
          metric,
          variant: 'champion',
          isHighlighted: selectedNodeId === nodeId,
          onClick: () => {
            setSelectedNodeId(nodeId);
            onNodeClick?.(metric);
          },
        },
      });

      if (index > 0) {
        newEdges.push({
          id: `champion-edge-${index}`,
          source: `champion-${championMetrics[index - 1].nodeId}-${index - 1}`,
          target: nodeId,
          type: 'smoothstep',
          animated: metric.status === 'success',
          style: {
            stroke: metric.status === 'error' ? '#ef4444' : '#C40404',
            strokeWidth: 2,
          },
        });
      }
    });

    challengeMetrics.forEach((metric, index) => {
      const nodeId = `challenge-${metric.nodeId}-${index}`;

      newNodes.push({
        id: nodeId,
        type: 'comparisonNode',
        position: { x: challengeX, y: startY + index * verticalSpacing },
        draggable: true,
        data: {
          metric,
          variant: 'challenge',
          isHighlighted: selectedNodeId === nodeId,
          onClick: () => {
            setSelectedNodeId(nodeId);
            onNodeClick?.(metric);
          },
        },
      });

      if (index > 0) {
        newEdges.push({
          id: `challenge-edge-${index}`,
          source: `challenge-${challengeMetrics[index - 1].nodeId}-${index - 1}`,
          target: nodeId,
          type: 'smoothstep',
          animated: metric.status === 'success',
          style: {
            stroke: metric.status === 'error' ? '#ef4444' : '#FFD700',
            strokeWidth: 2,
          },
        });
      }
    });

    const maxLength = Math.max(championMetrics.length, challengeMetrics.length);
    for (let i = 0; i < maxLength; i++) {
      if (championMetrics[i] && challengeMetrics[i]) {
        const timeDiff = Math.abs(
          championMetrics[i].executionTimeMs - challengeMetrics[i].executionTimeMs
        );

        newEdges.push({
          id: `comparison-${i}`,
          source: `champion-${championMetrics[i].nodeId}-${i}`,
          target: `challenge-${challengeMetrics[i].nodeId}-${i}`,
          type: 'straight',
          animated: false,
          style: {
            stroke: '#94a3b8',
            strokeWidth: 1,
            strokeDasharray: '5,5',
          },
          label: timeDiff > 0 ? `Δ ${timeDiff.toFixed(0)}ms` : '',
          labelStyle: {
            fill: '#64748b',
            fontSize: 10,
            fontWeight: 600,
          },
        });
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [championMetrics, challengeMetrics, selectedNodeId, onNodeClick]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  const totalChampionTime = championMetrics.reduce(
    (sum, m) => sum + m.executionTimeMs,
    0
  );
  const totalChallengeTime = challengeMetrics.reduce(
    (sum, m) => sum + m.executionTimeMs,
    0
  );
  const timeDifference = Math.abs(totalChampionTime - totalChallengeTime);

  return (
    <div className="w-full h-full relative">
      {/* Legend Card */}
      <div className="absolute top-4 left-4 z-10">
        <Card className="p-3 bg-white dark:bg-dark-surface shadow-lg border-light-border dark:border-dark-border">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">
              Legend
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-wells-red"></div>
                <span className="font-medium font-wells text-light-text-primary dark:text-dark-text-primary">
                  Champion
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-wells-gold"></div>
                <span className="font-medium font-wells text-light-text-primary dark:text-dark-text-primary">
                  Challenge
                </span>
              </div>
            </div>
            <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary pt-1 border-t border-light-border dark:border-dark-border">
              💡 Drag nodes to reposition
            </div>
          </div>
        </Card>
      </div>

      {/* Summary Card */}
      <div className="absolute top-4 right-4 z-10">
        <Card className="p-3 bg-white dark:bg-dark-surface shadow-lg border-light-border dark:border-dark-border">
          <div className="text-sm space-y-2">
            <div className="font-semibold text-light-text-primary dark:text-dark-text-primary">
              Execution Summary
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">
                  Champion:
                </span>
                <span className="font-mono font-semibold text-wells-red">
                  {totalChampionTime}ms
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">
                  Challenge:
                </span>
                <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                  {totalChallengeTime}ms
                </span>
              </div>
              {timeDifference > 0 && (
                <div className="flex items-center justify-between gap-4 pt-1 border-t border-light-border dark:border-dark-border">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">
                    Difference:
                  </span>
                  <span className="font-mono font-semibold text-light-text-primary dark:text-dark-text-primary">
                    {timeDifference}ms
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background
          color="#e2e8f0"
          gap={16}
          className="bg-light-bg dark:bg-dark-bg"
        />
        <Controls
          className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-lg"
        />
        <MiniMap
          nodeColor={(node) => {
            const variant = node.data?.variant;
            return variant === 'champion' ? '#C40404' : '#FFD700';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border"
        />
      </ReactFlow>
    </div>
  );
};
