import { create } from 'zustand';
import { ChampionChallengeExecution } from '../types/championChallenger';

interface FilterState {
  nodeTypes: string[];
  statusFilter: 'all' | 'success' | 'error';
  minExecutionTime?: number;
  maxExecutionTime?: number;
}

interface ChampionChallengeState {
  testGroups: any[];
  executions: ChampionChallengeExecution[];
  currentExecution: ChampionChallengeExecution | null;
  filters: FilterState;
  setTestGroups: (groups: any[]) => void;
  addExecution: (execution: ChampionChallengeExecution) => void;
  setCurrentExecution: (execution: ChampionChallengeExecution | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  getComparisonSummary: (executionId: string) => any;
  getFilteredMetrics: (executionId: string) => any;
}

export const useChampionChallengeStore = create<ChampionChallengeState>((set, get) => ({
  testGroups: [],
  executions: [],
  currentExecution: null,
  filters: {
    nodeTypes: [],
    statusFilter: 'all',
  },
  setTestGroups: (testGroups) => set({ testGroups }),
  addExecution: (execution) =>
    set((state) => ({
      executions: [...state.executions.filter(e => e.id !== execution.id), execution],
    })),
  setCurrentExecution: (execution) => set({ currentExecution: execution }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  getComparisonSummary: (executionId: string) => {
    const execution = get().executions.find((e) => e.id === executionId);
    if (!execution) return null;

    const championTime = execution.metrics.champion.reduce(
      (sum, m) => sum + m.executionTimeMs,
      0
    );
    const challengeTime = execution.metrics.challenge.reduce(
      (sum, m) => sum + m.executionTimeMs,
      0
    );

    return {
      championTime,
      challengeTime,
      winner: championTime < challengeTime ? 'champion' : 'challenge',
      difference: Math.abs(championTime - challengeTime),
    };
  },
  getFilteredMetrics: (executionId: string) => {
    const execution = get().executions.find((e) => e.id === executionId);
    if (!execution) return { champion: [], challenge: [] };

    const { filters } = get();

    const filterMetrics = (metrics: any[]) => {
      return metrics.filter((metric) => {
        if (filters.statusFilter !== 'all' && metric.status !== filters.statusFilter) {
          return false;
        }
        if (
          filters.nodeTypes.length > 0 &&
          !filters.nodeTypes.includes(metric.nodeType)
        ) {
          return false;
        }
        if (
          filters.minExecutionTime !== undefined &&
          metric.executionTimeMs < filters.minExecutionTime
        ) {
          return false;
        }
        if (
          filters.maxExecutionTime !== undefined &&
          metric.executionTimeMs > filters.maxExecutionTime
        ) {
          return false;
        }
        return true;
      });
    };

    return {
      champion: filterMetrics(execution.metrics.champion),
      challenge: filterMetrics(execution.metrics.challenge),
    };
  },
}));
