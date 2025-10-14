import { ComparisonMaster, AggregateMetrics } from '../types/championChallenge';

const BACKEND_BASE_URL = 'http://localhost:8989';

interface ComparisonRequest {
  name: string;
  description?: string;
  championWorkflowId: string;
  challengeWorkflowId: string;
  executionIds: string[];
}

interface ComparisonResponse {
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
  createdAt: string;
  completedAt?: string;
  createdBy?: string;
}

class ComparisonApiService {
  private baseUrl = `${BACKEND_BASE_URL}/api/v1/comparisons`;

  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async createComparison(request: ComparisonRequest): Promise<ComparisonMaster> {
    const response = await this.apiCall<ComparisonResponse>('', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return this.mapToComparisonMaster(response);
  }

  async listComparisons(): Promise<ComparisonMaster[]> {
    const response = await this.apiCall<ComparisonResponse[]>('', {
      method: 'GET',
    });
    return response.map(this.mapToComparisonMaster);
  }

  async getComparison(comparisonId: string): Promise<ComparisonMaster> {
    const response = await this.apiCall<ComparisonResponse>(`/${comparisonId}`, {
      method: 'GET',
    });
    return this.mapToComparisonMaster(response);
  }

  async addExecution(comparisonId: string, executionId: string): Promise<void> {
    await this.apiCall<void>(`/${comparisonId}/executions`, {
      method: 'POST',
      body: JSON.stringify({ executionId }),
    });
  }

  async removeExecution(comparisonId: string, executionId: string): Promise<void> {
    await this.apiCall<void>(`/${comparisonId}/executions/${executionId}`, {
      method: 'DELETE',
    });
  }

  async getAggregateMetrics(comparisonId: string): Promise<AggregateMetrics> {
    return await this.apiCall<AggregateMetrics>(`/${comparisonId}/aggregate-metrics`, {
      method: 'GET',
    });
  }

  async deleteComparison(comparisonId: string): Promise<void> {
    await this.apiCall<void>(`/${comparisonId}`, {
      method: 'DELETE',
    });
  }

  private mapToComparisonMaster(response: ComparisonResponse): ComparisonMaster {
    return {
      id: response.id,
      name: response.name,
      description: response.description,
      workflowPair: response.workflowPair,
      championWorkflowId: response.championWorkflowId,
      challengeWorkflowId: response.challengeWorkflowId,
      status: response.status,
      totalExecutions: response.totalExecutions,
      includedExecutions: response.includedExecutions,
      outlierCount: response.outlierCount,
      createdAt: new Date(response.createdAt),
      completedAt: response.completedAt ? new Date(response.completedAt) : undefined,
      createdBy: response.createdBy,
    };
  }
}

export const comparisonApiService = new ComparisonApiService();
export { ComparisonApiService };
export type { ComparisonRequest, ComparisonResponse };
