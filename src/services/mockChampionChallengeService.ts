import { v4 as uuidv4 } from 'uuid';
import {
  ChampionChallengeExecution,
  NodeMetric,
} from '../types/championChallenge';

export class MockChampionChallengeService {
  private executions: ChampionChallengeExecution[] = [];

  constructor() {
    this.generateMockExecutions();
  }

  async createExecution(
    name: string,
    description: string,
    championWorkflowId: string,
    challengeWorkflowId: string,
    requestPayload: any
  ): Promise<ChampionChallengeExecution> {
    const execution: ChampionChallengeExecution = {
      id: uuidv4(),
      name,
      description,
      championWorkflowId,
      challengeWorkflowId,
      requestPayload,
      status: 'running',
      startedAt: new Date(),
      createdAt: new Date(),
      metrics: {
        champion: [],
        challenge: [],
      },
    };

    this.executions.push(execution);

    setTimeout(() => {
      this.completeExecution(execution.id);
    }, 2000);

    return execution;
  }

  private async completeExecution(executionId: string) {
    const execution = this.executions.find((e) => e.id === executionId);
    if (!execution) return;

    execution.metrics.champion = this.generateMetrics(executionId, 'champion');
    execution.metrics.challenge = this.generateMetrics(executionId, 'challenge');
    execution.status = 'completed';
    execution.completedAt = new Date();
  }

  private generateMetrics(executionId: string, variant: 'champion' | 'challenge'): NodeMetric[] {
    const nodes = [
      { id: 'start', name: 'Start Event', type: 'startEvent' },
      { id: 'validate', name: 'Validate Payment', type: 'serviceTask' },
      { id: 'check-fraud', name: 'Fraud Detection', type: 'serviceTask' },
      { id: 'process-payment', name: 'Process Payment', type: 'serviceTask' },
      { id: 'gateway', name: 'Payment Gateway', type: 'exclusiveGateway' },
      { id: 'send-confirmation', name: 'Send Confirmation', type: 'serviceTask' },
      { id: 'update-ledger', name: 'Update Ledger', type: 'serviceTask' },
      { id: 'end', name: 'End Event', type: 'endEvent' },
    ];

    const baseMultiplier = variant === 'champion' ? 1 : 1.3;

    return nodes.map((node, index) => {
      const executionTime = Math.floor((Math.random() * 300 + 100) * baseMultiplier);
      const status = Math.random() > 0.9 && index > 2 ? 'error' : 'success';

      return {
        id: `${executionId}-${variant}-${node.id}`,
        executionId,
        variant,
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        requestData: {
          transactionId: `TXN-${Math.random().toString(36).substr(2, 9)}`,
          amount: 1250.75,
          currency: 'USD',
          customerId: 'CUST-12345',
          timestamp: new Date().toISOString(),
        },
        responseData: {
          status: status === 'success' ? 'approved' : 'failed',
          processingTime: executionTime,
          transactionId: `TXN-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          code: status === 'success' ? 200 : 500,
        },
        executionTimeMs: executionTime,
        status,
        errorMessage: status === 'error' ? `Error in ${node.name}: Connection timeout` : undefined,
        startedAt: new Date(Date.now() - executionTime),
        completedAt: new Date(),
        metadata: {
          memoryUsed: Math.random() * 80 + 20,
          cpuUsage: Math.random() * 70 + 10,
          requestSize: Math.floor(Math.random() * 5000 + 1000),
          responseSize: Math.floor(Math.random() * 8000 + 2000),
        },
      };
    });
  }

  async getExecution(executionId: string): Promise<ChampionChallengeExecution> {
    const execution = this.executions.find((e) => e.id === executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }
    return execution;
  }

  async listExecutions(): Promise<ChampionChallengeExecution[]> {
    return [...this.executions].reverse();
  }

  private generateMockExecutions() {
    const mockData = [
      {
        name: 'Payment Flow v1 vs v2 - High Volume Test',
        description: 'Comparing legacy payment processing with optimized version under high load',
        championWorkflowId: 'payment-flow-v1',
        challengeWorkflowId: 'payment-flow-v2',
        status: 'completed' as const,
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        name: 'Order Fulfillment - Standard vs Express',
        description: 'Testing standard fulfillment workflow against express shipping optimization',
        championWorkflowId: 'order-flow-standard',
        challengeWorkflowId: 'order-flow-express',
        status: 'completed' as const,
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      },
      {
        name: 'KYC Verification - Current vs Enhanced',
        description: 'Evaluating enhanced KYC checks with additional fraud detection steps',
        championWorkflowId: 'kyc-current',
        challengeWorkflowId: 'kyc-enhanced',
        status: 'completed' as const,
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ];

    mockData.forEach((data) => {
      const execution: ChampionChallengeExecution = {
        id: uuidv4(),
        name: data.name,
        description: data.description,
        championWorkflowId: data.championWorkflowId,
        challengeWorkflowId: data.challengeWorkflowId,
        requestPayload: {
          testMode: true,
          volume: 'high',
          region: 'US-EAST',
        },
        status: data.status,
        startedAt: new Date(data.completedAt.getTime() - 1000 * 60 * 5),
        completedAt: data.completedAt,
        createdAt: new Date(data.completedAt.getTime() - 1000 * 60 * 10),
        metrics: {
          champion: this.generateMetrics('mock', 'champion'),
          challenge: this.generateMetrics('mock', 'challenge'),
        },
      };

      this.executions.push(execution);
    });
  }
}

export const mockChampionChallengeService = new MockChampionChallengeService();
