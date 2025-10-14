export interface MockHealthEndpoint {
  url: string;
  name: string;
  responseTime: number;
  shouldFail?: boolean;
}

const mockEndpoints: MockHealthEndpoint[] = [
  {
    url: 'https://mock-api-champion.example.com/health',
    name: 'Champion Service',
    responseTime: 150,
    shouldFail: false,
  },
  {
    url: 'https://mock-api-challenger-1.example.com/health',
    name: 'Challenger Service 1',
    responseTime: 120,
    shouldFail: false,
  },
  {
    url: 'https://mock-api-challenger-2.example.com/health',
    name: 'Challenger Service 2',
    responseTime: 200,
    shouldFail: false,
  },
  {
    url: 'https://mock-api-challenger-3.example.com/health',
    name: 'Challenger Service 3 (Slow)',
    responseTime: 450,
    shouldFail: false,
  },
  {
    url: 'https://mock-api-challenger-4.example.com/health',
    name: 'Challenger Service 4 (Failing)',
    responseTime: 100,
    shouldFail: true,
  },
];

export class MockHealthService {
  private static instance: MockHealthService;
  private endpoints: Map<string, MockHealthEndpoint> = new Map();

  private constructor() {
    mockEndpoints.forEach((endpoint) => {
      this.endpoints.set(endpoint.url, endpoint);
    });
  }

  static getInstance(): MockHealthService {
    if (!MockHealthService.instance) {
      MockHealthService.instance = new MockHealthService();
    }
    return MockHealthService.instance;
  }

  async checkHealth(url: string): Promise<{
    success: boolean;
    responseTime: number;
    error?: string;
  }> {
    const mockEndpoint = this.endpoints.get(url);

    if (!mockEndpoint) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: false,
            responseTime: 100,
            error: 'Connection timeout',
          });
        }, 100);
      });
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        if (mockEndpoint.shouldFail) {
          resolve({
            success: false,
            responseTime: mockEndpoint.responseTime,
            error: 'Service unavailable',
          });
        } else {
          resolve({
            success: true,
            responseTime: mockEndpoint.responseTime,
          });
        }
      }, mockEndpoint.responseTime);
    });
  }

  isMockUrl(url: string): boolean {
    return url.includes('mock-api') || url.includes('.example.com');
  }

  getMockEndpoints(): MockHealthEndpoint[] {
    return Array.from(this.endpoints.values());
  }
}

export const mockHealthService = MockHealthService.getInstance();
