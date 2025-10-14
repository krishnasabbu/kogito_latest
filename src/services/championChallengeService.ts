import { MockChampionChallengeService } from './mockChampionChallengeService';
import type { ChampionChallengeExecution } from '../types/championChallenge';

class ChampionChallengeService {
  private mockService: MockChampionChallengeService;

  constructor() {
    this.mockService = new MockChampionChallengeService();
  }

  async createExecution(
    name: string,
    description: string,
    championWorkflowId: string,
    challengeWorkflowId: string,
    requestPayload: any
  ): Promise<ChampionChallengeExecution> {
    return this.mockService.createExecution(
      name,
      description,
      championWorkflowId,
      challengeWorkflowId,
      requestPayload
    );
  }

  async listExecutions(): Promise<ChampionChallengeExecution[]> {
    return this.mockService.listExecutions();
  }

  async loadExecution(executionId: string): Promise<ChampionChallengeExecution | null> {
    return this.mockService.getExecution(executionId);
  }

  async getExecution(executionId: string): Promise<ChampionChallengeExecution | null> {
    return this.mockService.getExecution(executionId);
  }
}

export const championChallengeService = new ChampionChallengeService();
