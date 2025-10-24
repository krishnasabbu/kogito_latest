export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  timestamp: string;
}

class MockHealthService {
  async checkHealth(url: string): Promise<HealthCheckResult> {
    return {
      status: 'healthy',
      latency: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

export const mockHealthService = new MockHealthService();
