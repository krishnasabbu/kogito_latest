export interface NodeMetric {
  id: string;
  executionId: string;
  variant: 'champion' | 'challenge';
  nodeId: string;
  nodeName: string;
  nodeType: string;
  requestData: any;
  responseData: any;
  executionTimeMs: number;
  status: 'success' | 'error' | 'skipped';
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
  metadata?: {
    memoryUsed?: number;
    cpuUsage?: number;
    [key: string]: any;
  };
}

export interface ChampionChallengeExecution {
  id: string;
  name: string;
  description?: string;
  championWorkflowId: string;
  challengeWorkflowId: string;
  requestPayload: any;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  metrics: {
    champion: NodeMetric[];
    challenge: NodeMetric[];
  };
}

export interface MetricComparison {
  id: string;
  executionId: string;
  metricName: string;
  championValue: number;
  challengeValue: number;
  differencePercentage: number;
  winner: 'champion' | 'challenge' | 'tie';
}

export interface ComparisonSummary {
  totalExecutionTime: MetricComparison;
  averageNodeTime: MetricComparison;
  successRate: MetricComparison;
  errorCount: MetricComparison;
  totalNodes: MetricComparison;
}

export interface JsonFilter {
  id: string;
  path: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'exists' | 'notExists';
  value?: any;
  enabled: boolean;
}

export interface ComparisonFilter {
  variant?: 'champion' | 'challenge' | 'both';
  status?: 'success' | 'error' | 'skipped' | 'all';
  nodeTypes?: string[];
  executionTimeRange?: {
    min: number;
    max: number;
  };
  jsonFilters: JsonFilter[];
}

export interface ComparisonMaster {
  id: string;
  name: string;
  description?: string;
  workflowPair: string;
  championWorkflowId: string;
  challengeWorkflowId: string;
  status: 'PENDING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  totalExecutions: number;
  includedExecutions: number;
  outlierCount: number;
  aggregateMetrics?: AggregateMetrics;
  statisticalAnalysis?: StatisticalAnalysis;
  createdAt: Date;
  completedAt?: Date;
  createdBy?: string;
}

export interface ExecutionMapping {
  id: string;
  comparisonId: string;
  executionId: string;
  included: boolean;
  outlierFlag: boolean;
  outlierReason?: string;
  outlierScore?: number;
  executionOrder: number;
  createdAt: Date;
}

export interface AggregateMetrics {
  totalExecutions: number;
  includedExecutions: number;
  outlierCount: number;

  performance: {
    championAvgTime: number;
    championMedianTime: number;
    championP95: number;
    challengeAvgTime: number;
    challengeMedianTime: number;
    challengeP95: number;
    improvement: number;
    consistency: {
      championStdDev: number;
      challengeStdDev: number;
    };
  };

  reliability: {
    championSuccessRate: number;
    challengeSuccessRate: number;
    championErrorCount: number;
    challengeErrorCount: number;
  };

  winnerDistribution: {
    championWins: number;
    challengeWins: number;
    ties: number;
    winRate: number;
  };

  nodeAggregates: NodeAggregate[];
  timeSeries: TimeSeriesPoint[];
}

export interface StatisticalAnalysis {
  sampleSize: number;
  confidenceLevel: number;
  pValue: number;
  isSignificant: boolean;
  recommendation: string;
  testMethod: string;
}

export interface NodeAggregate {
  nodeId: string;
  nodeName: string;
  championAvgTime: number;
  challengeAvgTime: number;
  executionCount: number;
  improvement: number;
  winner: 'champion' | 'challenge' | 'tie';
}

export interface TimeSeriesPoint {
  timestamp: string;
  championAvg: number;
  challengeAvg: number;
  count: number;
  championMin?: number;
  championMax?: number;
  challengeMin?: number;
  challengeMax?: number;
}
