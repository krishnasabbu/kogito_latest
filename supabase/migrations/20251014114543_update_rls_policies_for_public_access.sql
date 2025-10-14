/*
  # Update RLS Policies for Public Access

  1. Changes
    - Update RLS policies to allow public access (anon role) instead of requiring authentication
    - This enables the application to work without user authentication
    
  2. Security Notes
    - In production, these policies should be restricted to authenticated users
    - For demo/testing purposes, public access is enabled
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all test groups" ON test_groups;
DROP POLICY IF EXISTS "Users can insert test groups" ON test_groups;
DROP POLICY IF EXISTS "Users can update test groups" ON test_groups;
DROP POLICY IF EXISTS "Users can delete test groups" ON test_groups;

DROP POLICY IF EXISTS "Users can view all service configurations" ON service_configurations;
DROP POLICY IF EXISTS "Users can insert service configurations" ON service_configurations;
DROP POLICY IF EXISTS "Users can update service configurations" ON service_configurations;
DROP POLICY IF EXISTS "Users can delete service configurations" ON service_configurations;

-- Create new policies for public access (anon role)
CREATE POLICY "Public can view test groups"
  ON test_groups FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert test groups"
  ON test_groups FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update test groups"
  ON test_groups FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete test groups"
  ON test_groups FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Public can view service configurations"
  ON service_configurations FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert service configurations"
  ON service_configurations FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update service configurations"
  ON service_configurations FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete service configurations"
  ON service_configurations FOR DELETE
  TO anon
  USING (true);