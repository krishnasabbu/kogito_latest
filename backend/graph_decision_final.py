from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from langgraph.graph import StateGraph, END
from simpleeval import simple_eval
import requests
import uvicorn
import re
import copy
import sqlite3
import json
import uuid
from datetime import datetime

# -------------------------------------------------------------------
# FastAPI setup
# -------------------------------------------------------------------

app = FastAPI(title="Dynamic JSON Workflow + Drools Executor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# SQLite Database Setup
# -------------------------------------------------------------------

DB_PATH = "workflow.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS workflow_executions (
            id TEXT PRIMARY KEY,
            workflow_name TEXT NOT NULL,
            status TEXT NOT NULL,
            current_node_id TEXT,
            state_data TEXT NOT NULL,
            graph_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS node_executions (
            id TEXT PRIMARY KEY,
            workflow_execution_id TEXT NOT NULL,
            node_id TEXT NOT NULL,
            node_type TEXT NOT NULL,
            node_label TEXT,
            status TEXT NOT NULL,
            request_data TEXT,
            response_data TEXT,
            error_message TEXT,
            execution_time_ms INTEGER,
            started_at TIMESTAMP,
            completed_at TIMESTAMP,
            FOREIGN KEY (workflow_execution_id) REFERENCES workflow_executions(id)
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS form_responses (
            id TEXT PRIMARY KEY,
            workflow_execution_id TEXT NOT NULL,
            node_id TEXT NOT NULL,
            form_data TEXT NOT NULL,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (workflow_execution_id) REFERENCES workflow_executions(id)
        )
    """)

    conn.commit()
    conn.close()

init_db()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# -------------------------------------------------------------------
# Utility: Recursive lookup and template substitution
# -------------------------------------------------------------------

def deep_get(data: Dict[str, Any], path: str) -> Any:
    """Get deeply nested dict/list value using dot + bracket notation."""
    if not path:
        return data
    parts = re.split(r'\.(?![^\[]*\])', path)
    for part in parts:
        match = re.findall(r'([^\[\]]+)|\[(\d+)\]', part)
        for key, index in match:
            if key:
                if isinstance(data, dict):
                    data = data.get(key)
                else:
                    return None
            elif index is not None:
                if isinstance(data, list):
                    try:
                        data = data[int(index)]
                    except (IndexError, ValueError):
                        return None
                else:
                    return None
            if data is None:
                return None
    return data


def render_template(obj: Any, context: Dict[str, Any]):
    """Replace placeholders like {input.company.name} recursively."""
    if isinstance(obj, str):
        matches = re.findall(r"\{([^{}]+)\}", obj)
        for m in matches:
            val = deep_get(context, m.strip())
            if val is not None:
                obj = obj.replace("{" + m + "}", str(val))
        return obj
    elif isinstance(obj, dict):
        return {k: render_template(v, context) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [render_template(v, context) for v in obj]
    return obj


# -------------------------------------------------------------------
# Database Helper Functions
# -------------------------------------------------------------------

def save_workflow_execution(execution_id: str, workflow_name: str, status: str, current_node: str, state: Dict, graph: Dict):
    conn = get_db()
    cur = conn.cursor()
    # Use INSERT OR REPLACE so we update existing execution row if present
    cur.execute("""
        INSERT OR REPLACE INTO workflow_executions 
        (id, workflow_name, status, current_node_id, state_data, graph_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (execution_id, workflow_name, status, current_node, json.dumps(state), json.dumps(graph), datetime.now().isoformat()))
    conn.commit()
    conn.close()

def save_node_execution(workflow_exec_id: str, node_id: str, node_type: str, node_label: str, 
                        status: str, request_data: Any = None, response_data: Any = None, 
                        error_msg: str = None, exec_time: int = None):
    conn = get_db()
    cur = conn.cursor()
    node_exec_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    
    cur.execute("""
        INSERT INTO node_executions 
        (id, workflow_execution_id, node_id, node_type, node_label, status, 
         request_data, response_data, error_message, execution_time_ms, started_at, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (node_exec_id, workflow_exec_id, node_id, node_type, node_label, status,
          json.dumps(request_data) if request_data else None,
          json.dumps(response_data) if response_data else None,
          error_msg, exec_time, timestamp, timestamp if status == 'completed' else None))
    conn.commit()
    conn.close()
    return node_exec_id

def save_form_response(workflow_exec_id: str, node_id: str, form_data: Dict):
    conn = get_db()
    cur = conn.cursor()
    form_id = str(uuid.uuid4())
    cur.execute("""
        INSERT INTO form_responses (id, workflow_execution_id, node_id, form_data)
        VALUES (?, ?, ?, ?)
    """, (form_id, workflow_exec_id, node_id, json.dumps(form_data)))
    conn.commit()
    conn.close()

def get_workflow_execution(execution_id: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM workflow_executions WHERE id = ?", (execution_id,))
    row = cur.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

# -------------------------------------------------------------------
# Node: Service Node
# -------------------------------------------------------------------

def make_service_node(node_data: Dict[str, Any], execution_id: str):
    url = node_data["data"]["url"]
    method = node_data["data"].get("method", "POST").upper()
    request_template = node_data["data"].get("request", {})
    mappings = node_data["data"].get("mappings", [])

    def run_fn(state: Dict[str, Any]):
        start_time = datetime.now()
        node_id = node_data["id"]
        node_label = node_data.get("data", {}).get("label", node_id)

        payload = render_template(copy.deepcopy(request_template), state)

        # Apply explicit mappings (multiple supported)
        for m in mappings:
            source = m.get("source")
            target = m.get("target")
            transform = m.get("transform")
            val = deep_get(state, source)
            if val is not None:
                if transform == "upper":
                    val = str(val).upper()
                elif transform == "lower":
                    val = str(val).lower()
                elif transform == "strip":
                    val = str(val).strip()
                payload[target] = val

        try:
            resp = requests.request(method, url, json=payload, timeout=10)
            data = resp.json() if resp.ok else {"error": resp.text}
            error_msg = None
        except Exception as e:
            data = {"error": str(e)}
            error_msg = str(e)

        exec_time = int((datetime.now() - start_time).total_seconds() * 1000)

        # Save node execution to DB
        save_node_execution(
            execution_id, node_id, "service", node_label,
            "completed", payload, data, error_msg, exec_time
        )

        # Store response in state
        state[node_data["id"]] = {
            "request": payload,
            "response": data
        }
        return state

    return run_fn


# -------------------------------------------------------------------
# Node: Drools / Decision Node
# -------------------------------------------------------------------

def make_decision_node(node_data: Dict[str, Any], execution_id: str):
    data = node_data.get("data", {})
    rules = data.get("rules", [])
    script = data.get("script")

    def run_fn(state: Dict[str, Any]):
        start_time = datetime.now()
        node_id = node_data["id"]
        node_label = node_data.get("data", {}).get("label", node_id)

        new_state = state.copy()
        actions_taken = []

        # Rule-based evaluation (multiple conditions)
        if rules:
            for rule in rules:
                cond = rule.get("condition")
                try:
                    if simple_eval(cond, names={"state": new_state, "input": new_state.get("input", {})}):
                        action = rule.get("action", {})
                        if isinstance(action, dict):
                            new_state.update(action)
                            actions_taken.append({"condition": cond, "action": action})
                except Exception as e:
                    print(f"[DecisionNode-Rules] Condition error: {e}")

        # Script mode (Python block)
        if script:
            try:
                local_env = {"state": new_state}
                exec(script, {}, local_env)
                new_state = local_env.get("state", new_state)
            except Exception as e:
                print(f"[DecisionNode-Script] Script error: {e}")

        exec_time = int((datetime.now() - start_time).total_seconds() * 1000)

        # Save node execution to DB
        save_node_execution(
            execution_id, node_id, "decision", node_label,
            "completed", {"rules": rules, "script": script}, {"actions_taken": actions_taken}, None, exec_time
        )

        return new_state

    return run_fn


# -------------------------------------------------------------------
# Node: Form Node (Pauses workflow)
# -------------------------------------------------------------------

def make_form_node(node_data: Dict[str, Any], execution_id: str):
    node_id = node_data["id"]
    node_label = node_data.get("data", {}).get("label", node_id)
    form_schema = node_data.get("data", {}).get("schema", {})

    def run_fn(state: Dict[str, Any]):
        # Mark as paused and save to DB (node execution record)
        save_node_execution(
            execution_id, node_id, "form", node_label,
            "paused", {"form_schema": form_schema}, None, None, 0
        )

        # Store form requirement in state
        state["_paused_at_form"] = {
            "node_id": node_id,
            "execution_id": execution_id,
            "form_schema": form_schema
        }

        return state

    return run_fn


# -------------------------------------------------------------------
# Node Factory
# -------------------------------------------------------------------

NODE_FACTORY = {
    "service": make_service_node,
    "decision": make_decision_node,
    "form": make_form_node,
}


# -------------------------------------------------------------------
# Graph Builder
# -------------------------------------------------------------------

def build_graph_from_json(graph_json: Dict[str, Any], execution_id: str):
    g = StateGraph(dict)

    # Register nodes
    for node in graph_json.get("nodes", []):
        ntype = node["type"]
        func = NODE_FACTORY[ntype](node, execution_id)
        g.add_node(node["id"], func)

    # Handle edges (with multiple conditional edges per node)
    edges_by_source = {}
    for e in graph_json.get("edges", []):
        edges_by_source.setdefault(e["source"], []).append(e)

    for source, edges in edges_by_source.items():
        if any("condition" in e for e in edges):
            def conditional_fn(state, edges=edges):
                for edge in edges:
                    cond = edge.get("condition")
                    if not cond:
                        continue
                    try:
                        if simple_eval(cond, names={"state": state, "input": state.get("input", {})}):
                            return edge["target"]
                    except Exception as ex:
                        print("Condition eval error:", ex)
                # fallback (no match)
                for e in edges:
                    if "condition" not in e:
                        return e["target"]
                return None
            g.add_conditional_edges(source, conditional_fn)
        else:
            for e in edges:
                g.add_edge(e["source"], e["target"])

    # Entry and end
    entry = graph_json.get("nodes", [None])[0]["id"] if graph_json.get("nodes") else None
    if entry:
        g.set_entry_point(entry)
    if graph_json.get("nodes"):
        g.add_edge(graph_json["nodes"][-1]["id"], END)
    return g.compile()


# -------------------------------------------------------------------
# Helpers for resume: find next node after a given node (evaluate conditions)
# -------------------------------------------------------------------

def resolve_next_node(graph_json: Dict[str, Any], source_node_id: str, state: Dict[str, Any]) -> Optional[str]:
    """
    Given the graph JSON and current node id, find the target node to continue to.
    Evaluate conditional edges using simple_eval with names={"state": state, "input": state.get("input", {})}.
    If multiple edges, the first matching condition is returned. If none match, prefer an unconditional edge.
    """
    candidates = [e for e in graph_json.get("edges", []) if e.get("source") == source_node_id]
    if not candidates:
        return None

    # Try evaluate conditional edges first
    for e in candidates:
        cond = e.get("condition")
        if cond:
            try:
                if simple_eval(cond, names={"state": state, "input": state.get("input", {})}):
                    return e.get("target")
            except Exception as ex:
                print(f"[resolve_next_node] cond eval error for '{cond}': {ex}")

    # fallback to first unconditional edge
    for e in candidates:
        if "condition" not in e:
            return e.get("target")

    # nothing matched
    return None

# -------------------------------------------------------------------
# FastAPI Models
# -------------------------------------------------------------------

class ExecuteRequest(BaseModel):
    graph: Dict[str, Any]
    inputs: Dict[str, Any] = {}
    workflow_name: Optional[str] = "unnamed_workflow"

class ExecuteResponse(BaseModel):
    status: str
    execution_id: Optional[str] = None
    result: Dict[str, Any]
    paused_at_form: Optional[Dict[str, Any]] = None
    logs: Optional[List[str]] = None

class ResumeRequest(BaseModel):
    execution_id: str
    form_data: Dict[str, Any]


# -------------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------------

@app.post("/execute", response_model=ExecuteResponse)
def execute_workflow(req: ExecuteRequest):
    execution_id = str(uuid.uuid4())

    try:
        state = {"input": req.inputs}

        # Save workflow execution as started (entry node as current)
        entry_node = req.graph["nodes"][0]["id"] if req.graph.get("nodes") else "unknown"
        save_workflow_execution(
            execution_id, req.workflow_name, "running",
            entry_node,
            state, req.graph
        )

        # Build and execute graph
        graph = build_graph_from_json(req.graph, execution_id)
        # start from entry by default
        result = graph.invoke(state)

        # Check if workflow is paused at form
        if "_paused_at_form" in result:
            form_info = result["_paused_at_form"]
            # Save workflow as paused with current_node set to the form node
            save_workflow_execution(
                execution_id, req.workflow_name, "paused",
                form_info["node_id"], result, req.graph
            )
            return ExecuteResponse(
                status="paused",
                execution_id=execution_id,
                result=result,
                paused_at_form=form_info
            )

        # Workflow completed successfully
        save_workflow_execution(
            execution_id, req.workflow_name, "completed",
            req.graph["nodes"][-1]["id"] if req.graph.get("nodes") else "unknown",
            result, req.graph
        )

        return ExecuteResponse(
            status="success",
            execution_id=execution_id,
            result=result
        )
    except Exception as e:
        # Save workflow as failed
        save_workflow_execution(
            execution_id, req.workflow_name, "failed",
            "unknown", {"error": str(e)}, req.graph
        )
        return ExecuteResponse(
            status="error",
            execution_id=execution_id,
            result={"error": str(e)}
        )


@app.post("/resume", response_model=ExecuteResponse)
def resume_workflow(req: ResumeRequest):
    try:
        # Get workflow execution from DB
        workflow_exec = get_workflow_execution(req.execution_id)

        if not workflow_exec:
            raise HTTPException(status_code=404, detail="Workflow execution not found")

        if workflow_exec["status"] != "paused":
            raise HTTPException(status_code=400, detail="Workflow is not paused")

        # Parse stored state and graph
        state = json.loads(workflow_exec["state_data"])
        graph_json = json.loads(workflow_exec["graph_json"])

        # Remove pause marker and add form data to state
        start_at_node = None
        paused_node_id = None
        if "_paused_at_form" in state:
            paused_info = state.pop("_paused_at_form")
            paused_node_id = paused_info["node_id"]

            # Save form response
            save_form_response(req.execution_id, paused_node_id, req.form_data)

            # Update node execution as completed (form node)
            save_node_execution(
                req.execution_id, paused_node_id, "form", paused_node_id,
                "completed", None, req.form_data, None, 0
            )

            # Add form data to state
            state[paused_node_id] = {"form_data": req.form_data}
            # merge form into input for easier condition checks
            if "input" not in state:
                state["input"] = {}
            if isinstance(state["input"], dict):
                state["input"].update(req.form_data)

            # Resolve next node after this form (evaluate conditions if any)
            start_at_node = resolve_next_node(graph_json, paused_node_id, state)

        # If we couldn't find a next node, fall back to the stored current node or paused node itself
        if not start_at_node:
            start_at_node = workflow_exec.get("current_node_id") or paused_node_id

        # Update workflow status to running and set current_node_id to the node we will start from
        save_workflow_execution(
            req.execution_id, workflow_exec["workflow_name"], "running",
            start_at_node, state, graph_json
        )

        # Continue execution from paused state (start at resolved node)
        graph = build_graph_from_json(graph_json, req.execution_id)

        # Use start_at parameter so the compiled graph starts at desired node (old langgraph API)
        # If your langgraph version uses a different invocation signature, adjust accordingly.
        result = graph.invoke(state, start_at=start_at_node) if start_at_node else graph.invoke(state)

        # Check if paused again at another form
        if "_paused_at_form" in result:
            form_info = result["_paused_at_form"]
            save_workflow_execution(
                req.execution_id, workflow_exec["workflow_name"], "paused",
                form_info["node_id"], result, graph_json
            )
            return ExecuteResponse(
                status="paused",
                execution_id=req.execution_id,
                result=result,
                paused_at_form=form_info
            )

        # Workflow completed
        save_workflow_execution(
            req.execution_id, workflow_exec["workflow_name"], "completed",
            graph_json["nodes"][-1]["id"] if graph_json.get("nodes") else "unknown",
            result, graph_json
        )

        return ExecuteResponse(
            status="success",
            execution_id=req.execution_id,
            result=result
        )
    except HTTPException:
        raise
    except Exception as e:
        # Attempt to get workflow name safely for logging
        wf_name = workflow_exec["workflow_name"] if 'workflow_exec' in locals() and workflow_exec else "unknown"
        save_workflow_execution(
            req.execution_id, wf_name,
            "failed", "unknown", {"error": str(e)}, {}
        )
        return ExecuteResponse(
            status="error",
            execution_id=req.execution_id,
            result={"error": str(e)}
        )


@app.get("/")
def root():
    return {"message": "Dynamic JSON + Drools Executor running"}


@app.get("/executions/{execution_id}")
def get_execution_details(execution_id: str):
    """Get workflow execution details"""
    workflow_exec = get_workflow_execution(execution_id)

    if not workflow_exec:
        raise HTTPException(status_code=404, detail="Execution not found")

    # Get node executions
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM node_executions
        WHERE workflow_execution_id = ?
        ORDER BY started_at ASC
    """, (execution_id,))
    node_rows = cur.fetchall()
    conn.close()

    node_executions = [dict(row) for row in node_rows]

    return {
        "execution": workflow_exec,
        "node_executions": node_executions
    }


@app.get("/executions/{execution_id}/nodes")
def get_node_executions(execution_id: str):
    """Get all node executions for a workflow"""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM node_executions
        WHERE workflow_execution_id = ?
        ORDER BY started_at ASC
    """, (execution_id,))
    rows = cur.fetchall()
    conn.close()

    return [dict(row) for row in rows]


@app.get("/executions")
def list_executions(limit: int = 50):
    """List recent workflow executions"""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, workflow_name, status, current_node_id, created_at, updated_at
        FROM workflow_executions
        ORDER BY created_at DESC
        LIMIT ?
    """, (limit,))
    rows = cur.fetchall()
    conn.close()

    return [dict(row) for row in rows]


# -------------------------------------------------------------------
# Run server
# -------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
