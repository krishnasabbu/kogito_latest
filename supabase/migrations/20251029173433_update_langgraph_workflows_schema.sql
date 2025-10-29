/*
  # Update LangGraph Workflows Schema

  1. Changes
    - Drop the old langgraph_workflows table
    - Recreate with name as primary key
    - Remove id, description, updated_at columns
    - Rename graph_data to data
    - Add latest_version column

  2. New Schema
    - `langgraph_workflows`
      - `name` (text, primary key) - Unique workflow name
      - `latest_version` (integer) - Version number of the workflow
      - `created_at` (timestamptz) - When the workflow was created
      - `data` (jsonb) - Complete workflow data

  3. Security
    - Enable RLS on `langgraph_workflows` table
    - Add policies for public access

  4. Important Notes
    - Name is now the primary key for workflows
    - Version tracking with latest_version field
    - Simplified schema to match API requirements
*/

DROP TABLE IF EXISTS langgraph_workflows CASCADE;

CREATE TABLE langgraph_workflows (
  name text PRIMARY KEY,
  latest_version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  data jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE langgraph_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view workflows"
  ON langgraph_workflows
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert workflows"
  ON langgraph_workflows
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update workflows"
  ON langgraph_workflows
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete workflows"
  ON langgraph_workflows
  FOR DELETE
  USING (true);
