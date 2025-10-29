/*
  # Create LangGraph Workflows Table

  1. New Tables
    - `langgraph_workflows`
      - `id` (uuid, primary key) - Unique identifier for each workflow
      - `name` (text) - Name of the workflow
      - `description` (text) - Description of the workflow
      - `graph_data` (jsonb) - JSON data containing nodes, edges, and inputs
      - `created_at` (timestamptz) - When the workflow was created
      - `updated_at` (timestamptz) - When the workflow was last updated

  2. Security
    - Enable RLS on `langgraph_workflows` table
    - Add policy for public read access (anyone can view workflows)
    - Add policy for public write access (anyone can create/update workflows)

  3. Important Notes
    - This table stores the complete workflow definition including nodes, edges, and configuration
    - The graph_data column contains the exported JSON from the LangGraph builder
    - Public access is enabled for demonstration purposes
*/

CREATE TABLE IF NOT EXISTS langgraph_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  graph_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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
