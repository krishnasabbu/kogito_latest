export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  timestamp: string;
}

export interface MockEndpoint {
  name: string;
  url: string;
  description: string;
}

class MockHealthService {
  async checkHealth(url: string): Promise<HealthCheckResult> {
    return {
      status: 'healthy',
      latency: 0,
      timestamp: new Date().toISOString(),
    };
  }

  getMockEndpoints(): MockEndpoint[] {
    return [
      {
        name: 'Mock Champion API',
        url: 'https://mock-api-champion.example.com',
        description: 'Production payment service endpoint',
      },
      {
        name: 'Mock Challenger API',
        url: 'https://mock-api-challenger-1.example.com',
        description: 'Fast payment service endpoint',
      },
    ];
  }
}

export const mockHealthService = new MockHealthService();
