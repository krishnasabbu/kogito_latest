const BACKEND_BASE_URL = 'http://localhost:8989';

// ========== TYPE DEFINITIONS ==========

// Comparison types (Master)
interface ComparisonRequest {
  name: string;
  description?: string;
  championWorkflowId: string;
  challengeWorkflowId: string;
}

interface ComparisonResponse {
  id: string;
  name: string;
  description: string;
  championWorkflowId: string;
  challengeWorkflowId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  totalExecutions: number;
  completedExecutions: number;
  runningExecutions: number;
  failedExecutions: number;
  lastExecutionAt: string | null;
}

// Execution types (Detail)
interface ExecutionResponse {
  id: string;
  name: string;
  description: string;
  championWorkflowId: string;
  challengeWorkflowId: string;
  requestPayload: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  createdBy: string;
  totalChampionTimeMs: number;
  totalChallengeTimeMs: number;
  winner: string;
  championMetrics: NodeMetricResponse[];
  challengeMetrics: NodeMetricResponse[];
}

interface NodeMetricResponse {
  id: string;
  variant: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  requestData: string;
  responseData: string;
  executionTimeMs: number;
  status: string;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string;
  metadata: string;
}

// ========== API SERVICE CLASS ==========

class ChampionChallengeApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${BACKEND_BASE_URL}/api/v1/champion-challenge`;
  }

  // ========== COMPARISON METHODS (MASTER) ==========

  async createComparison(request: ComparisonRequest): Promise<ComparisonResponse> {
    const response = await fetch(`${this.baseUrl}/comparisons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create comparison: ${response.statusText}`);
    }

    return await response.json();
  }

  async listComparisons(): Promise<ComparisonResponse[]> {
    const response = await fetch(`${this.baseUrl}/comparisons`);

    if (!response.ok) {
      throw new Error(`Failed to list comparisons: ${response.statusText}`);
    }

    return await response.json();
  }

  async getComparison(id: string): Promise<ComparisonResponse> {
    const response = await fetch(`${this.baseUrl}/comparisons/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to get comparison: ${response.statusText}`);
    }

    return await response.json();
  }

  async deleteComparison(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/comparisons/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete comparison: ${response.statusText}`);
    }
  }

  // ========== EXECUTION METHODS (DETAIL) ==========

  async executeComparison(comparisonId: string, requestPayload: any): Promise<ExecutionResponse> {
    const response = await fetch(`${this.baseUrl}/comparisons/${comparisonId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to execute comparison: ${response.statusText}`);
    }

    return await response.json();
  }

  async listExecutions(comparisonId: string): Promise<ExecutionResponse[]> {
    const response = await fetch(`${this.baseUrl}/comparisons/${comparisonId}/executions`);

    if (!response.ok) {
      throw new Error(`Failed to list executions: ${response.statusText}`);
    }

    return await response.json();
  }

  async getExecution(executionId: string): Promise<ExecutionResponse> {
    const response = await fetch(`${this.baseUrl}/executions/${executionId}`);

    if (!response.ok) {
      throw new Error(`Failed to get execution: ${response.statusText}`);
    }

    return await response.json();
  }
}

export const championChallengeApiService = new ChampionChallengeApiService();

export type {
  ComparisonRequest,
  ComparisonResponse,
  ExecutionResponse,
  NodeMetricResponse,
};
