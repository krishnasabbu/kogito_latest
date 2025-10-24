import { TestGroupWithStats } from '../types/championChallenger';

class TestGroupService {
  async getAllTestGroups(): Promise<TestGroupWithStats[]> {
    return [];
  }

  async getTestGroup(id: string): Promise<TestGroupWithStats | null> {
    return null;
  }

  async createTestGroup(data: any): Promise<TestGroupWithStats> {
    throw new Error('Not implemented');
  }

  async updateTestGroup(id: string, data: any): Promise<void> {
    throw new Error('Not implemented');
  }

  async deleteTestGroup(id: string): Promise<void> {
    throw new Error('Not implemented');
  }
}

export const testGroupService = new TestGroupService();
