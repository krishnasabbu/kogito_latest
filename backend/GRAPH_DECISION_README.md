# Graph Decision Workflow Executor with SQLite

FastAPI server for executing LangGraph workflows with execution tracking, form node pause/resume, and SQLite persistence.

## Features

- **Workflow Execution Tracking**: Every workflow execution is tracked in SQLite with unique execution IDs
- **Node-Level Tracking**: Each node execution is recorded with timing, request/response data, and status
- **Form Node Pause/Resume**: Workflows automatically pause at form nodes and can be resumed with user input
- **SQLite Persistence**: All execution data stored in `workflow.db`
- **Support for Multiple Node Types**: Service, Decision, and Form nodes

## Database Schema

### Tables

#### 1. `workflow_executions`
Tracks overall workflow execution state
- `id` (TEXT PRIMARY KEY): Unique execution ID
- `workflow_name` (TEXT): Name of the workflow
- `status` (TEXT): running, paused, completed, failed
- `current_node_id` (TEXT): Current/last node being executed
- `state_data` (TEXT): JSON serialized workflow state
- `graph_json` (TEXT): Complete workflow graph definition
- `created_at` (TIMESTAMP): When execution started
- `updated_at` (TIMESTAMP): Last update time

#### 2. `node_executions`
Tracks individual node execution details
- `id` (TEXT PRIMARY KEY): Unique node execution ID
- `workflow_execution_id` (TEXT): Foreign key to workflow_executions
- `node_id` (TEXT): ID of the node in the graph
- `node_type` (TEXT): service, decision, or form
- `node_label` (TEXT): Human-readable label
- `status` (TEXT): pending, running, completed, paused, failed
- `request_data` (TEXT): JSON of input/request data
- `response_data` (TEXT): JSON of output/response data
- `error_message` (TEXT): Error details if failed
- `execution_time_ms` (INTEGER): Execution time in milliseconds
- `started_at` (TIMESTAMP): When node started
- `completed_at` (TIMESTAMP): When node completed

#### 3. `form_responses`
Stores user form submissions
- `id` (TEXT PRIMARY KEY): Unique form response ID
- `workflow_execution_id` (TEXT): Foreign key to workflow_executions
- `node_id` (TEXT): Form node ID
- `form_data` (TEXT): JSON of user-submitted form data
- `submitted_at` (TIMESTAMP): Submission time

## API Endpoints

### POST /execute
Execute a new workflow

**Request Body:**
```json
{
  "graph": {
    "nodes": [...],
    "edges": [...]
  },
  "inputs": {
    "key": "value"
  },
  "workflow_name": "MyWorkflow"
}
```

**Response (Completed):**
```json
{
  "status": "success",
  "execution_id": "uuid",
  "result": { ... },
  "paused_at_form": null
}
```

**Response (Paused at Form):**
```json
{
  "status": "paused",
  "execution_id": "uuid",
  "result": { ... },
  "paused_at_form": {
    "node_id": "form_1",
    "execution_id": "uuid",
    "form_schema": { ... }
  }
}
```

### POST /resume
Resume a paused workflow with form data

**Request Body:**
```json
{
  "execution_id": "uuid",
  "form_data": {
    "field1": "value1",
    "field2": "value2"
  }
}
```

**Response:** Same as /execute endpoint

### GET /executions
List recent workflow executions

**Query Parameters:**
- `limit` (optional): Number of executions to return (default: 50)

**Response:**
```json
[
  {
    "id": "uuid",
    "workflow_name": "MyWorkflow",
    "status": "completed",
    "current_node_id": "node_3",
    "created_at": "2025-01-01T00:00:00",
    "updated_at": "2025-01-01T00:05:00"
  }
]
```

### GET /executions/{execution_id}
Get detailed execution information

**Response:**
```json
{
  "execution": {
    "id": "uuid",
    "workflow_name": "MyWorkflow",
    "status": "completed",
    "state_data": "...",
    "graph_json": "...",
    ...
  },
  "node_executions": [
    {
      "id": "uuid",
      "node_id": "service_1",
      "node_type": "service",
      "status": "completed",
      "execution_time_ms": 150,
      ...
    }
  ]
}
```

### GET /executions/{execution_id}/nodes
Get all node executions for a workflow

**Response:** Array of node execution objects

## Node Types

### 1. Service Node
Makes HTTP requests to external services

**Node Configuration:**
```json
{
  "id": "service_1",
  "type": "service",
  "data": {
    "label": "Call API",
    "url": "https://api.example.com/endpoint",
    "method": "POST",
    "request": {
      "query": "{input.user_query}"
    },
    "mappings": [
      {
        "source": "input.company.name",
        "target": "company",
        "transform": "upper"
      }
    ]
  }
}
```

**Tracking:**
- Records request payload
- Records response data
- Tracks execution time
- Captures errors

### 2. Decision Node
Evaluates conditions and executes rules

**Node Configuration:**
```json
{
  "id": "decision_1",
  "type": "decision",
  "data": {
    "label": "Route Decision",
    "rules": [
      {
        "condition": "state['score'] > 80",
        "action": {"approved": true}
      }
    ],
    "script": "# Python code here"
  }
}
```

**Tracking:**
- Records which rules fired
- Tracks actions taken
- Records script execution results

### 3. Form Node (NEW)
Pauses workflow for user input

**Node Configuration:**
```json
{
  "id": "form_1",
  "type": "form",
  "data": {
    "label": "User Input Form",
    "schema": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "email": {"type": "string"}
      }
    }
  }
}
```

**Behavior:**
1. Workflow execution pauses at form node
2. Form schema returned in API response
3. Node execution marked as "paused"
4. User submits form data via `/resume` endpoint
5. Form data merged into workflow state
6. Workflow continues from next node

**Tracking:**
- Initial pause recorded
- Form submission saved to `form_responses` table
- Node execution updated to "completed" after submission

## Setup

1. **Install Dependencies:**
```bash
pip install -r requirements_graph.txt
```

2. **Run Server:**
```bash
python graph_decision.py
```

Server runs on `http://0.0.0.0:8000`

## Database File

SQLite database is created as `workflow.db` in the same directory as the script.

## Example Workflow with Form

```json
{
  "nodes": [
    {
      "id": "service_1",
      "type": "service",
      "data": {
        "url": "https://api.example.com/data",
        "method": "GET"
      }
    },
    {
      "id": "form_1",
      "type": "form",
      "data": {
        "label": "Review Data",
        "schema": {
          "type": "object",
          "properties": {
            "approved": {"type": "boolean"}
          }
        }
      }
    },
    {
      "id": "service_2",
      "type": "service",
      "data": {
        "url": "https://api.example.com/submit",
        "method": "POST",
        "request": {
          "approved": "{input.approved}",
          "data": "{service_1.response}"
        }
      }
    }
  ],
  "edges": [
    {"source": "service_1", "target": "form_1"},
    {"source": "form_1", "target": "service_2"}
  ]
}
```

## Execution Flow with Forms

1. **Start Execution:**
```bash
POST /execute
{
  "graph": { ... },
  "inputs": {},
  "workflow_name": "Approval Flow"
}
```

2. **Response (Paused):**
```json
{
  "status": "paused",
  "execution_id": "abc-123",
  "paused_at_form": {
    "node_id": "form_1",
    "form_schema": { ... }
  }
}
```

3. **User Fills Form & Resumes:**
```bash
POST /resume
{
  "execution_id": "abc-123",
  "form_data": {
    "approved": true
  }
}
```

4. **Response (Completed):**
```json
{
  "status": "success",
  "execution_id": "abc-123",
  "result": { ... }
}
```

## Notes

- All timestamps are in ISO 8601 format
- State data is automatically serialized/deserialized as JSON
- Form data is merged into the workflow state under the node ID
- Multiple form nodes in a single workflow are supported
- Database automatically created on first run
