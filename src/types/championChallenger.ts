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
  executionTimeMs: number;
  status: 'success' | 'error';
  timestamp: string;
  data?: any;
}
