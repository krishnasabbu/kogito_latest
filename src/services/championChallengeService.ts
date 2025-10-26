class ChampionChallengeService {
  async executeComparison(data: any): Promise<any> {
    return {};
  }

  async listExecutions(): Promise<any[]> {
    return [];
  }

  async loadExecution(executionId: string): Promise<any | null> {
    return null;
  }
}

export const championChallengeService = new ChampionChallengeService();
