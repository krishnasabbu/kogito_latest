import { supabase } from './supabaseClient';
import {
  TestGroup,
  ServiceConfiguration,
  CreateTestGroupRequest,
  UpdateTestGroupRequest,
  TestGroupWithStats,
  ConnectionTestResult,
} from '../types/championChallenger';

export class TestGroupService {
  async createTestGroup(data: CreateTestGroupRequest): Promise<TestGroup> {
    const { data: testGroup, error: testGroupError } = await supabase
      .from('test_groups')
      .insert({
        name: data.name,
        description: data.description,
        status: 'active',
      })
      .select()
      .single();

    if (testGroupError || !testGroup) {
      throw new Error(testGroupError?.message || 'Failed to create test group');
    }

    const servicesData = [
      {
        ...data.champion,
        test_group_id: testGroup.id,
        type: 'champion',
      },
      ...data.challengers.map((challenger) => ({
        ...challenger,
        test_group_id: testGroup.id,
        type: 'challenger',
      })),
    ];

    const { data: services, error: servicesError } = await supabase
      .from('service_configurations')
      .insert(servicesData)
      .select();

    if (servicesError) {
      await supabase.from('test_groups').delete().eq('id', testGroup.id);
      throw new Error(servicesError.message || 'Failed to create service configurations');
    }

    return {
      ...testGroup,
      services,
    };
  }

  async getTestGroups(): Promise<TestGroupWithStats[]> {
    const { data: testGroups, error: testGroupsError } = await supabase
      .from('test_groups')
      .select('*, service_configurations(*)')
      .order('created_at', { ascending: false });

    if (testGroupsError) {
      throw new Error(testGroupsError.message || 'Failed to fetch test groups');
    }

    return (testGroups || []).map((group: any) => {
      const services = group.service_configurations || [];
      const champion = services.find((s: ServiceConfiguration) => s.type === 'champion');
      const challengers = services.filter((s: ServiceConfiguration) => s.type === 'challenger');

      const allHealthy = services.every((s: ServiceConfiguration) => s.connection_status === 'healthy');
      const anyUnhealthy = services.some((s: ServiceConfiguration) => s.connection_status === 'unhealthy');
      const allUntested = services.every((s: ServiceConfiguration) => s.connection_status === 'untested');

      let overall_health: 'healthy' | 'unhealthy' | 'untested' = 'untested';
      if (allHealthy) {
        overall_health = 'healthy';
      } else if (anyUnhealthy) {
        overall_health = 'unhealthy';
      } else if (!allUntested) {
        overall_health = 'unhealthy';
      }

      return {
        ...group,
        services,
        champion_url: champion?.controller_url,
        challenger_count: challengers.length,
        overall_health,
      };
    });
  }

  async getTestGroup(testId: string): Promise<TestGroup | null> {
    const { data, error } = await supabase
      .from('test_groups')
      .select('*, service_configurations(*)')
      .eq('id', testId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message || 'Failed to fetch test group');
    }

    if (!data) {
      return null;
    }

    return {
      ...data,
      services: data.service_configurations || [],
    };
  }

  async updateTestGroup(testId: string, updates: UpdateTestGroupRequest): Promise<TestGroup> {
    const { data, error } = await supabase
      .from('test_groups')
      .update(updates)
      .eq('id', testId)
      .select('*, service_configurations(*)')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to update test group');
    }

    return {
      ...data,
      services: data.service_configurations || [],
    };
  }

  async deleteTestGroup(testId: string): Promise<void> {
    const { error } = await supabase
      .from('test_groups')
      .delete()
      .eq('id', testId);

    if (error) {
      throw new Error(error.message || 'Failed to delete test group');
    }
  }

  async testConnection(serviceId: string): Promise<ConnectionTestResult> {
    const { data: service, error } = await supabase
      .from('service_configurations')
      .select()
      .eq('id', serviceId)
      .maybeSingle();

    if (error || !service) {
      return {
        success: false,
        status: 'unhealthy',
        error: 'Service configuration not found',
      };
    }

    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(service.health_url, {
        signal: controller.signal,
        headers: service.header_details || {},
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      const status = response.ok ? 'healthy' : 'unhealthy';

      await supabase
        .from('service_configurations')
        .update({
          connection_status: status,
          last_tested: new Date().toISOString(),
          response_time_ms: responseTime,
        })
        .eq('id', serviceId);

      return {
        success: response.ok,
        status,
        response_time_ms: responseTime,
      };
    } catch (err: any) {
      const errorMessage = err.name === 'AbortError' ? 'Connection timeout' : err.message;

      await supabase
        .from('service_configurations')
        .update({
          connection_status: 'unhealthy',
          last_tested: new Date().toISOString(),
        })
        .eq('id', serviceId);

      return {
        success: false,
        status: 'unhealthy',
        error: errorMessage,
      };
    }
  }

  async testAllConnections(testId: string): Promise<Record<string, ConnectionTestResult>> {
    const { data: services, error } = await supabase
      .from('service_configurations')
      .select()
      .eq('test_group_id', testId);

    if (error || !services) {
      throw new Error('Failed to fetch service configurations');
    }

    const results: Record<string, ConnectionTestResult> = {};

    await Promise.all(
      services.map(async (service) => {
        results[service.id] = await this.testConnection(service.id);
      })
    );

    return results;
  }

  async updateServiceConfiguration(
    serviceId: string,
    updates: Partial<ServiceConfiguration>
  ): Promise<ServiceConfiguration> {
    const { data, error } = await supabase
      .from('service_configurations')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to update service configuration');
    }

    return data;
  }
}

export const testGroupService = new TestGroupService();
