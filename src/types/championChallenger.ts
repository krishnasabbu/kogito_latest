export type ServiceType = 'champion' | 'challenger';
export type TestGroupStatus = 'active' | 'paused' | 'completed';
export type ConnectionStatus = 'healthy' | 'unhealthy' | 'untested';

export interface ServiceConfiguration {
  id: string;
  test_group_id: string;
  type: ServiceType;
  name: string;
  controller_url: string;
  request_details: Record<string, any>;
  header_details: Record<string, string>;
  health_url: string;
  connection_status: ConnectionStatus;
  last_tested?: string;
  response_time_ms?: number;
  created_at: string;
  updated_at: string;
}

export interface TestGroup {
  id: string;
  name: string;
  description: string;
  status: TestGroupStatus;
  created_at: string;
  updated_at: string;
  services?: ServiceConfiguration[];
}

export interface CreateTestGroupRequest {
  name: string;
  description: string;
  champion: Omit<ServiceConfiguration, 'id' | 'test_group_id' | 'type' | 'created_at' | 'updated_at' | 'connection_status' | 'last_tested' | 'response_time_ms'>;
  challengers: Omit<ServiceConfiguration, 'id' | 'test_group_id' | 'type' | 'created_at' | 'updated_at' | 'connection_status' | 'last_tested' | 'response_time_ms'>[];
}

export interface UpdateTestGroupRequest {
  name?: string;
  description?: string;
  status?: TestGroupStatus;
}

export interface ConnectionTestResult {
  success: boolean;
  status: ConnectionStatus;
  response_time_ms?: number;
  error?: string;
}

export interface TestGroupWithStats extends TestGroup {
  champion_url?: string;
  challenger_count: number;
  overall_health: ConnectionStatus;
}
