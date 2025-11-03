# Workflow Execution with Form Pause/Resume Integration

Complete integration guide for executing workflows with automatic form pause/resume functionality.

## Overview

The system now supports intelligent workflow execution that automatically pauses when a form node is encountered, displays the form to users, collects their input, and resumes workflow execution seamlessly.

## Architecture

### Backend (Python FastAPI)
- **File**: `backend/graph_decision.py`
- **Database**: SQLite (`workflow.db`)
- **Port**: 8000 (configurable via `VITE_BACKEND_API_URL`)

### Frontend (React + TypeScript)
- **Main Component**: `WorkflowExecutionWithForms.tsx`
- **Integration**: `LangGraphBuilder.tsx`
- **Form Component**: Uses existing `FormPreviewModal.tsx` patterns

## Features

### 1. Automatic Workflow Pause
- When workflow encounters a form node, execution automatically pauses
- Workflow state is saved to SQLite database
- Frontend receives pause notification with form schema

### 2. Interactive Form Display
- Click on paused form node in workflow graph
- Form modal opens with schema-based form rendering
- Real-time form data preview
- Validation using JSON Schema

### 3. Seamless Resume
- Submit form to resume workflow
- Form data merged into workflow state
- Execution continues from next node
- Supports multiple form nodes in sequence

### 4. Complete Execution Tracking
- Every node execution tracked in database
- Request/response data captured
- Execution timing recorded
- Status tracking (pending, running, paused, completed, failed)

## Usage Guide

### Step 1: Start Backend Server

```bash
cd backend
pip install -r requirements_graph.txt
python graph_decision.py
```

Server starts at `http://localhost:8000`

### Step 2: Build Workflow with Form Node

1. Open LangGraph Builder
2. Add nodes to your workflow
3. Add a Form Node where user input is needed
4. Configure form schema:

```json
{
  "type": "object",
  "title": "User Information",
  "properties": {
    "name": {
      "type": "string",
      "title": "Full Name"
    },
    "email": {
      "type": "string",
      "format": "email",
      "title": "Email Address"
    },
    "approved": {
      "type": "boolean",
      "title": "Approve Request"
    }
  },
  "required": ["name", "email"]
}
```

### Step 3: Execute Workflow

1. Click **"Execute with Forms"** button (red button)
2. Provide input JSON
3. Click Execute

### Step 4: Handle Form Pause

When workflow pauses:
1. Form node turns **orange** with pause icon
2. Click the orange form node
3. Form modal opens automatically
4. Fill out the form
5. Click **"Submit & Resume"**
6. Workflow continues execution

### Step 5: View Execution Details

- Click any node to see execution details
- View request/response data
- Check execution timing
- See status and errors

## API Endpoints

### POST /execute
Start workflow execution

**Request:**
```json
{
  "graph": {
    "nodes": [...],
    "edges": [...]
  },
  "inputs": {
    "user_query": "example"
  },
  "workflow_name": "MyWorkflow"
}
```

**Response (Paused):**
```json
{
  "status": "paused",
  "execution_id": "uuid-here",
  "result": { ... },
  "paused_at_form": {
    "node_id": "form_1",
    "execution_id": "uuid-here",
    "form_schema": { ... }
  }
}
```

### POST /resume
Resume paused workflow

**Request:**
```json
{
  "execution_id": "uuid-here",
  "form_data": {
    "name": "John Doe",
    "email": "john@example.com",
    "approved": true
  }
}
```

**Response:**
```json
{
  "status": "success",
  "execution_id": "uuid-here",
  "result": { ... }
}
```

### GET /executions/{execution_id}
Get complete execution details

### GET /executions
List all workflow executions

### GET /executions/{execution_id}/nodes
Get all node executions for a workflow

## Database Schema

### workflow_executions
```sql
CREATE TABLE workflow_executions (
  id TEXT PRIMARY KEY,
  workflow_name TEXT NOT NULL,
  status TEXT NOT NULL,  -- running, paused, completed, failed
  current_node_id TEXT,
  state_data TEXT NOT NULL,  -- JSON serialized state
  graph_json TEXT NOT NULL,  -- Complete workflow definition
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### node_executions
```sql
CREATE TABLE node_executions (
  id TEXT PRIMARY KEY,
  workflow_execution_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL,  -- service, decision, form
  node_label TEXT,
  status TEXT NOT NULL,  -- pending, running, completed, paused, failed
  request_data TEXT,  -- JSON
  response_data TEXT,  -- JSON
  error_message TEXT,
  execution_time_ms INTEGER,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (workflow_execution_id) REFERENCES workflow_executions(id)
);
```

### form_responses
```sql
CREATE TABLE form_responses (
  id TEXT PRIMARY KEY,
  workflow_execution_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  form_data TEXT NOT NULL,  -- JSON
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_execution_id) REFERENCES workflow_executions(id)
);
```

## Example Workflows

### Workflow 1: Approval Flow with Form

```json
{
  "name": "Approval Workflow",
  "graph": {
    "nodes": [
      {
        "id": "fetch_data",
        "type": "service",
        "data": {
          "label": "Fetch Request Data",
          "url": "https://api.example.com/requests/123",
          "method": "GET"
        }
      },
      {
        "id": "review_form",
        "type": "form",
        "data": {
          "label": "Review Request",
          "schema": {
            "type": "object",
            "title": "Approval Form",
            "properties": {
              "approved": {
                "type": "boolean",
                "title": "Approve this request?"
              },
              "comments": {
                "type": "string",
                "title": "Comments"
              }
            },
            "required": ["approved"]
          }
        }
      },
      {
        "id": "submit_decision",
        "type": "service",
        "data": {
          "label": "Submit Decision",
          "url": "https://api.example.com/decisions",
          "method": "POST",
          "request": {
            "approved": "{input.approved}",
            "comments": "{input.comments}",
            "request_data": "{fetch_data.response}"
          }
        }
      }
    ],
    "edges": [
      {"source": "fetch_data", "target": "review_form"},
      {"source": "review_form", "target": "submit_decision"}
    ]
  }
}
```

### Workflow 2: Multi-Step Form Process

```json
{
  "name": "Multi-Step Registration",
  "graph": {
    "nodes": [
      {
        "id": "personal_info",
        "type": "form",
        "data": {
          "label": "Personal Information",
          "schema": {
            "type": "object",
            "properties": {
              "name": {"type": "string"},
              "email": {"type": "string", "format": "email"}
            }
          }
        }
      },
      {
        "id": "address_info",
        "type": "form",
        "data": {
          "label": "Address Information",
          "schema": {
            "type": "object",
            "properties": {
              "street": {"type": "string"},
              "city": {"type": "string"},
              "zipcode": {"type": "string"}
            }
          }
        }
      },
      {
        "id": "submit_registration",
        "type": "service",
        "data": {
          "label": "Submit Registration",
          "url": "https://api.example.com/register",
          "method": "POST",
          "request": {
            "personal": "{input}",
            "address": "{input}"
          }
        }
      }
    ],
    "edges": [
      {"source": "personal_info", "target": "address_info"},
      {"source": "address_info", "target": "submit_registration"}
    ]
  }
}
```

## Visual Indicators

### Node Status Colors
- **Gray**: Pending (not yet executed)
- **Green**: Success (completed successfully)
- **Orange**: Paused (waiting for form input)
- **Red**: Error (execution failed)

### Node Icons
- ✓ **CheckCircle**: Completed successfully
- ⏸ **Pause**: Paused at form
- ✗ **XCircle**: Failed with error
- ⏱ **Clock**: Pending execution

## Troubleshooting

### Issue: Backend not responding
**Solution**: Ensure backend is running on port 8000 or configure `VITE_BACKEND_API_URL`

### Issue: Form not appearing when node clicked
**Solution**:
1. Check if node status is "paused"
2. Verify form schema is properly configured
3. Check browser console for errors

### Issue: Workflow doesn't resume after form submission
**Solution**:
1. Check backend logs for errors
2. Verify execution_id is valid
3. Ensure form data matches schema requirements

### Issue: Node execution not tracked
**Solution**:
1. Verify SQLite database exists (`workflow.db`)
2. Check backend logs for database errors
3. Ensure proper permissions on database file

## Environment Configuration

### Backend Configuration
```bash
# Default backend URL
VITE_BACKEND_API_URL=http://localhost:8000

# Can be overridden in .env file
```

### Database Location
```bash
# SQLite database file
backend/workflow.db

# Automatically created on first run
# Contains all execution history
```

## Benefits

1. **User-Friendly**: No manual state management required
2. **Reliable**: All state persisted in database
3. **Trackable**: Complete execution history
4. **Flexible**: Supports multiple forms per workflow
5. **Transparent**: Visual feedback at every step
6. **Resumable**: Can resume from any paused state

## Limitations

1. Form nodes must have valid JSON schemas
2. Workflow state must be serializable to JSON
3. Backend must be running for execution
4. Browser session required for form interaction

## Next Steps

1. Add form validation error handling
2. Implement workflow versioning
3. Add execution replay functionality
4. Support conditional form logic
5. Add form field dependencies
6. Implement workflow branching after forms

## Support

For issues or questions:
- Check backend logs: `backend/graph_decision.py` console output
- Check browser console for frontend errors
- Verify database: `sqlite3 backend/workflow.db`
- Review API responses in Network tab

## Files Modified/Created

### Backend
- `backend/graph_decision.py` - Enhanced with DB tracking and form pause
- `backend/requirements_graph.txt` - Python dependencies
- `backend/GRAPH_DECISION_README.md` - Backend documentation
- `backend/workflow.db` - SQLite database (auto-created)

### Frontend
- `src/components/LangGraph/WorkflowExecutionWithForms.tsx` - NEW: Main execution component
- `src/components/LangGraph/LangGraphBuilder.tsx` - Updated: Added new button
- Uses existing `FormPreviewModal.tsx` patterns for form rendering

## Summary

This integration provides a complete solution for workflows that require human input at specific steps. The system automatically handles pause/resume logic, provides clear visual feedback, and maintains complete execution history in a persistent database.
