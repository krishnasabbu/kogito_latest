export type TestGroupStatus = 'active' | 'paused' | 'completed';
export type ConnectionStatus = 'healthy' | 'degraded' | 'down';

export interface TestGroupWithStats {
  id: string;
  name: string;
  description: string;
  status: TestGroupStatus;
  championUrl: string;
  challengeUrl: string;
  createdAt: string;
  executionCount: number;
  lastExecutionAt?: string;
  championHealth: ConnectionStatus;
  challengeHealth: ConnectionStatus;
}

export interface NodeMetric {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  executionTimeMs: number;
  status: 'success' | 'error';
  timestamp: string;
  requestData?: any;
  responseData?: any;
  errorMessage?: string;
  data?: any;
}

export interface ChampionChallengeExecution {
  id: string;
  name: string;
  description?: string;
  status: 'running' | 'completed' | 'failed';
  championWorkflowId: string;
  challengeWorkflowId: string;
  createdAt: string;
  startedAt: string;
  completedAt?: string;
  inputRequest: any;
  outputResults: any;
  metrics: {
    champion: NodeMetric[];
    challenge: NodeMetric[];
  };
}

export interface ComparisonMaster {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  executionIds: string[];
}

export interface AggregateMetrics {
  totalExecutions: number;
  avgExecutionTime: number;
  successRate: number;
  nodeMetrics: {
    nodeName: string;
    avgTime: number;
    successCount: number;
    errorCount: number;
  }[];
}
