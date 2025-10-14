/*
  # Champion-Challenger Testing System Schema

  1. New Tables
    - `test_groups`
      - `id` (uuid, primary key) - Unique identifier for test group
      - `name` (text) - Name of the test group
      - `description` (text) - Description of the test
      - `status` (text) - Status: active, paused, completed
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `service_configurations`
      - `id` (uuid, primary key) - Unique identifier for service config
      - `test_group_id` (uuid, foreign key) - Reference to test_groups
      - `type` (text) - Type: champion or challenger
      - `name` (text) - Name/label for the service
      - `controller_url` (text) - Main service endpoint URL
      - `request_details` (jsonb) - Request configuration as JSON
      - `header_details` (jsonb) - Header configuration as JSON
      - `health_url` (text) - Health check endpoint URL
      - `connection_status` (text) - Status: healthy, unhealthy, untested
      - `last_tested` (timestamptz) - Last health check timestamp
      - `response_time_ms` (integer) - Last response time in milliseconds
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own test groups
*/

-- Create test_groups table
CREATE TABLE IF NOT EXISTS test_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service_configurations table
CREATE TABLE IF NOT EXISTS service_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_group_id uuid NOT NULL REFERENCES test_groups(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('champion', 'challenger')),
  name text NOT NULL,
  controller_url text NOT NULL,
  request_details jsonb DEFAULT '{}',
  header_details jsonb DEFAULT '{}',
  health_url text NOT NULL,
  connection_status text DEFAULT 'untested' CHECK (connection_status IN ('healthy', 'unhealthy', 'untested')),
  last_tested timestamptz,
  response_time_ms integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_service_configurations_test_group_id ON service_configurations(test_group_id);
CREATE INDEX IF NOT EXISTS idx_service_configurations_type ON service_configurations(type);
CREATE INDEX IF NOT EXISTS idx_test_groups_status ON test_groups(status);
CREATE INDEX IF NOT EXISTS idx_test_groups_created_at ON test_groups(created_at DESC);

-- Enable Row Level Security
ALTER TABLE test_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for test_groups
CREATE POLICY "Users can view all test groups"
  ON test_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert test groups"
  ON test_groups FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update test groups"
  ON test_groups FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete test groups"
  ON test_groups FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for service_configurations
CREATE POLICY "Users can view all service configurations"
  ON service_configurations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert service configurations"
  ON service_configurations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update service configurations"
  ON service_configurations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete service configurations"
  ON service_configurations FOR DELETE
  TO authenticated
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_test_groups_updated_at ON test_groups;
CREATE TRIGGER update_test_groups_updated_at
  BEFORE UPDATE ON test_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_configurations_updated_at ON service_configurations;
CREATE TRIGGER update_service_configurations_updated_at
  BEFORE UPDATE ON service_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();