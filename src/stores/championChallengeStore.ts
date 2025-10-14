import { create } from 'zustand';
import {
  ChampionChallengeExecution,
  NodeMetric,
  MetricComparison,
  ComparisonSummary,
  ComparisonFilter,
} from '../types/championChallenge';

interface ChampionChallengeState {
  executions: ChampionChallengeExecution[];
  currentExecution: ChampionChallengeExecution | null;
  filters: ComparisonFilter;

  addExecution: (execution: ChampionChallengeExecution) => void;
  updateExecution: (id: string, updates: Partial<ChampionChallengeExecution>) => void;
  setCurrentExecution: (execution: ChampionChallengeExecution | null) => void;
  addNodeMetric: (executionId: string, metric: NodeMetric) => void;
  getComparisonSummary: (executionId: string) => ComparisonSummary | null;
  setFilters: (filters: Partial<ComparisonFilter>) => void;
  getFilteredMetrics: (executionId: string) => { champion: NodeMetric[]; challenge: NodeMetric[] };
}

const defaultFilters: ComparisonFilter = {
  variant: 'both',
  status: 'all',
  nodeTypes: [],
  jsonFilters: [],
};

export const useChampionChallengeStore = create<ChampionChallengeState>((set, get) => ({
  executions: [],
  currentExecution: null,
  filters: defaultFilters,

  addExecution: (execution) => {
    set((state) => ({
      executions: [...state.executions, execution],
    }));
  },

  updateExecution: (id, updates) => {
    set((state) => ({
      executions: state.executions.map((exec) =>
        exec.id === id ? { ...exec, ...updates } : exec
      ),
      currentExecution:
        state.currentExecution?.id === id
          ? { ...state.currentExecution, ...updates }
          : state.currentExecution,
    }));
  },

  setCurrentExecution: (execution) => {
    set({ currentExecution: execution });
  },

  addNodeMetric: (executionId, metric) => {
    set((state) => {
      const execution = state.executions.find((e) => e.id === executionId);
      if (!execution) return state;

      const updatedExecution = {
        ...execution,
        metrics: {
          ...execution.metrics,
          [metric.variant]: [...execution.metrics[metric.variant], metric],
        },
      };

      return {
        executions: state.executions.map((e) =>
          e.id === executionId ? updatedExecution : e
        ),
        currentExecution:
          state.currentExecution?.id === executionId
            ? updatedExecution
            : state.currentExecution,
      };
    });
  },

  getComparisonSummary: (executionId) => {
    const execution = get().executions.find((e) => e.id === executionId);
    if (!execution) return null;

    const championMetrics = execution.metrics.champion;
    const challengeMetrics = execution.metrics.challenge;

    const calculateComparison = (
      name: string,
      champValue: number,
      challValue: number
    ): MetricComparison => {
      const diff = ((challValue - champValue) / champValue) * 100;
      const winner =
        champValue < challValue
          ? 'champion'
          : challValue < champValue
          ? 'challenge'
          : 'tie';

      return {
        id: `${executionId}-${name}`,
        executionId,
        metricName: name,
        championValue: champValue,
        challengeValue: challValue,
        differencePercentage: diff,
        winner,
      };
    };

    const championTotalTime = championMetrics.reduce(
      (sum, m) => sum + m.executionTimeMs,
      0
    );
    const challengeTotalTime = challengeMetrics.reduce(
      (sum, m) => sum + m.executionTimeMs,
      0
    );

    const championAvgTime =
      championMetrics.length > 0 ? championTotalTime / championMetrics.length : 0;
    const challengeAvgTime =
      challengeMetrics.length > 0 ? challengeTotalTime / challengeMetrics.length : 0;

    const championSuccessRate =
      (championMetrics.filter((m) => m.status === 'success').length /
        championMetrics.length) *
      100;
    const challengeSuccessRate =
      (challengeMetrics.filter((m) => m.status === 'success').length /
        challengeMetrics.length) *
      100;

    const championErrors = championMetrics.filter((m) => m.status === 'error').length;
    const challengeErrors = challengeMetrics.filter((m) => m.status === 'error').length;

    return {
      totalExecutionTime: calculateComparison(
        'Total Execution Time (ms)',
        championTotalTime,
        challengeTotalTime
      ),
      averageNodeTime: calculateComparison(
        'Average Node Time (ms)',
        championAvgTime,
        challengeAvgTime
      ),
      successRate: {
        ...calculateComparison('Success Rate (%)', championSuccessRate, challengeSuccessRate),
        winner:
          championSuccessRate > challengeSuccessRate
            ? 'champion'
            : challengeSuccessRate > championSuccessRate
            ? 'challenge'
            : 'tie',
      },
      errorCount: {
        ...calculateComparison('Error Count', championErrors, challengeErrors),
        winner:
          championErrors < challengeErrors
            ? 'champion'
            : challengeErrors < championErrors
            ? 'challenge'
            : 'tie',
      },
      totalNodes: calculateComparison(
        'Total Nodes',
        championMetrics.length,
        challengeMetrics.length
      ),
    };
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  getFilteredMetrics: (executionId) => {
    const execution = get().executions.find((e) => e.id === executionId);
    if (!execution) return { champion: [], challenge: [] };

    const { filters } = get();

    const filterMetrics = (metrics: NodeMetric[]): NodeMetric[] => {
      return metrics.filter((metric) => {
        if (filters.status && filters.status !== 'all' && metric.status !== filters.status) {
          return false;
        }

        if (
          filters.nodeTypes &&
          filters.nodeTypes.length > 0 &&
          !filters.nodeTypes.includes(metric.nodeType)
        ) {
          return false;
        }

        if (filters.executionTimeRange) {
          const { min, max } = filters.executionTimeRange;
          if (metric.executionTimeMs < min || metric.executionTimeMs > max) {
            return false;
          }
        }

        if (filters.jsonFilters && filters.jsonFilters.length > 0) {
          for (const filter of filters.jsonFilters) {
            if (!filter.enabled) continue;

            const getValue = (obj: any, path: string) => {
              return path.split('.').reduce((acc, part) => acc?.[part], obj);
            };

            const requestValue = getValue(metric.requestData, filter.path);
            const responseValue = getValue(metric.responseData, filter.path);
            const value = requestValue !== undefined ? requestValue : responseValue;

            switch (filter.operator) {
              case 'equals':
                if (value !== filter.value) return false;
                break;
              case 'contains':
                if (
                  typeof value === 'string' &&
                  !value.includes(filter.value)
                )
                  return false;
                break;
              case 'greater':
                if (typeof value !== 'number' || value <= filter.value)
                  return false;
                break;
              case 'less':
                if (typeof value !== 'number' || value >= filter.value)
                  return false;
                break;
              case 'exists':
                if (value === undefined) return false;
                break;
              case 'notExists':
                if (value !== undefined) return false;
                break;
            }
          }
        }

        return true;
      });
    };

    let championFiltered = execution.metrics.champion;
    let challengeFiltered = execution.metrics.challenge;

    if (filters.variant === 'champion') {
      challengeFiltered = [];
    } else if (filters.variant === 'challenge') {
      championFiltered = [];
    }

    return {
      champion: filterMetrics(championFiltered),
      challenge: filterMetrics(challengeFiltered),
    };
  },
}));
