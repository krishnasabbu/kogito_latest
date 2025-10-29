/*
  # Add Context Field to LangGraph Workflows

  1. Changes
    - Add context field to langgraph_workflows table

  2. New Column
    - `context` (text) - Context information for the workflow

  3. Important Notes
    - Context field is optional and can be null
    - Existing workflows will have null context
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'langgraph_workflows' AND column_name = 'context'
  ) THEN
    ALTER TABLE langgraph_workflows ADD COLUMN context text;
  END IF;
END $$;
