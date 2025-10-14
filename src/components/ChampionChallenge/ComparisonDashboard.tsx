import React, { useState, useEffect, useMemo } from 'react';
import { useChampionChallengeStore } from '../../stores/championChallengeStore';
import { ComparisonFlowCanvas } from './ComparisonFlowCanvas';
import { ComparisonSummaryPanel } from './ComparisonSummaryPanel';
import { FilterPanel } from './FilterPanel';
import { JsonFilterPanel } from './JsonFilterPanel';
import { MetricDetailCard } from './MetricDetailCard';
import { AnalyticsCharts } from './AnalyticsCharts';
import { NodeMetric } from '../../types/championChallenge';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs } from '../ui/tabs';
import {
  LayoutGrid,
  ListFilter,
  Workflow,
  BarChart3,
  X,
  Maximize2,
  Minimize2,
  TrendingUp,
} from 'lucide-react';

interface ComparisonDashboardProps {
  executionId: string;
}

export const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({
  executionId,
}) => {
  const {
    executions,
    filters,
    setFilters,
    getComparisonSummary,
    getFilteredMetrics,
  } = useChampionChallengeStore();

  const [selectedMetric, setSelectedMetric] = useState<NodeMetric | null>(null);
  const [activeTab, setActiveTab] = useState<
    'flow' | 'summary' | 'analytics' | 'details'
  >('flow');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(true);
  const [showJsonFilters, setShowJsonFilters] = useState(false);

  const execution = executions.find((e) => e.id === executionId);
  const summary = execution ? getComparisonSummary(executionId) : null;
  const filteredMetrics = getFilteredMetrics(executionId);

  const availableNodeTypes = useMemo(() => {
    if (!execution) return [];
    const types = new Set<string>();
    execution.metrics.champion.forEach((m) => types.add(m.nodeType));
    execution.metrics.challenge.forEach((m) => types.add(m.nodeType));
    return Array.from(types);
  }, [execution]);

  const availableJsonPaths = useMemo(() => {
    if (!execution) return [];
    const paths = new Set<string>();

    const extractPaths = (obj: any, prefix = '') => {
      if (!obj || typeof obj !== 'object') return;
      Object.keys(obj).forEach((key) => {
        const path = prefix ? `${prefix}.${key}` : key;
        paths.add(path);
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          extractPaths(obj[key], path);
        }
      });
    };

    [...execution.metrics.champion, ...execution.metrics.challenge].forEach(
      (metric) => {
        extractPaths(metric.requestData);
        extractPaths(metric.responseData);
      }
    );

    return Array.from(paths);
  }, [execution]);

  const getComparisonMetric = (metric: NodeMetric): NodeMetric | undefined => {
    if (!execution) return undefined;
    const oppositeVariant = metric.variant === 'champion' ? 'challenge' : 'champion';
    const oppositeMetrics = execution.metrics[oppositeVariant];
    return oppositeMetrics.find((m) => m.nodeId === metric.nodeId);
  };

  if (!execution) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">Execution not found</div>
      </Card>
    );
  }

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <Card className="border-b rounded-none">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{execution.name}</h2>
              {execution.description && (
                <p className="text-sm text-gray-600 mt-1">{execution.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
              >
                <ListFilter className="w-4 h-4 mr-2" />
                {showFilterPanel ? 'Hide' : 'Show'} Filters
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b">
            <button
              onClick={() => setActiveTab('flow')}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'flow'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Workflow className="w-4 h-4" />
              Flow Visualization
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'summary'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Summary
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'details'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Details
            </button>
          </div>
        </div>
      </Card>

      <div className="flex-1 flex overflow-hidden">
        {showFilterPanel && (
          <div className="w-80 border-r overflow-y-auto bg-gray-50 p-4 space-y-4">
            <FilterPanel
              filters={filters}
              onChange={(newFilters) => setFilters(newFilters)}
              availableNodeTypes={availableNodeTypes}
            />

            <div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowJsonFilters(!showJsonFilters)}
                className="w-full"
              >
                {showJsonFilters ? 'Hide' : 'Show'} JSON Filters
              </Button>
            </div>

            {showJsonFilters && (
              <JsonFilterPanel
                filters={filters.jsonFilters}
                onChange={(newFilters) =>
                  setFilters({ jsonFilters: newFilters })
                }
                availableKeys={availableJsonPaths}
              />
            )}

            <Card className="p-3 bg-white">
              <div className="text-sm space-y-2">
                <div className="font-semibold">Filtered Results</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Champion Nodes:</span>
                    <span className="font-mono font-semibold">
                      {filteredMetrics.champion.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Challenge Nodes:</span>
                    <span className="font-mono font-semibold">
                      {filteredMetrics.challenge.length}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {activeTab === 'flow' && (
              <div className="h-full">
                <ComparisonFlowCanvas
                  championMetrics={filteredMetrics.champion}
                  challengeMetrics={filteredMetrics.challenge}
                  onNodeClick={setSelectedMetric}
                />
              </div>
            )}

            {activeTab === 'summary' && summary && (
              <div className="p-6">
                <ComparisonSummaryPanel summary={summary} />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="h-full">
                <AnalyticsCharts
                  championMetrics={filteredMetrics.champion}
                  challengeMetrics={filteredMetrics.challenge}
                />
              </div>
            )}

            {activeTab === 'details' && (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      Champion Nodes
                    </h3>
                    <div className="space-y-4">
                      {filteredMetrics.champion.map((metric) => (
                        <MetricDetailCard
                          key={metric.id}
                          metric={metric}
                          comparisonMetric={getComparisonMetric(metric)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                      Challenge Nodes
                    </h3>
                    <div className="space-y-4">
                      {filteredMetrics.challenge.map((metric) => (
                        <MetricDetailCard
                          key={metric.id}
                          metric={metric}
                          comparisonMetric={getComparisonMetric(metric)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedMetric && (
          <div className="w-96 border-l overflow-y-auto bg-white">
            <div className="sticky top-0 bg-white border-b z-10">
              <div className="flex items-center justify-between p-4">
                <h3 className="font-semibold">Node Details</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedMetric(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <MetricDetailCard
                metric={selectedMetric}
                comparisonMetric={getComparisonMetric(selectedMetric)}
              />
            </div>
          </div>
        )}
      </div>

      <Card className="border-t rounded-none">
        <div className="p-3 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-600">Status:</span>
              <span
                className={`ml-2 font-semibold ${
                  execution.status === 'completed'
                    ? 'text-green-600'
                    : execution.status === 'running'
                    ? 'text-blue-600'
                    : 'text-red-600'
                }`}
              >
                {execution.status.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <span className="ml-2 font-semibold font-mono">
                {execution.completedAt
                  ? `${(
                      (new Date(execution.completedAt).getTime() -
                        new Date(execution.startedAt).getTime()) /
                      1000
                    ).toFixed(2)}s`
                  : 'Running...'}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Started: {new Date(execution.startedAt).toLocaleString()}
          </div>
        </div>
      </Card>
    </div>
  );
};
