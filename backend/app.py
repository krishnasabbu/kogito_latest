from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import json

app = FastAPI(title="Flow Store API")

# -------------------------------------------------------------------
# CORS setup
# -------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# Database setup
# -------------------------------------------------------------------
DB_PATH = "flow.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    # Add context column if not exists (for backward compatibility)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS flows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            version INTEGER NOT NULL,
            data TEXT NOT NULL,
            context TEXT DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    # Ensure context column exists (for existing tables)
    try:
        cur.execute("ALTER TABLE flows ADD COLUMN context TEXT DEFAULT '{}'")
    except sqlite3.OperationalError:
        # Column already exists
        pass
    conn.commit()
    conn.close()

init_db()

# -------------------------------------------------------------------
# Models
# -------------------------------------------------------------------
class FlowPayload(BaseModel):
    name: str
    data: dict  # React Flow JSON
    context: dict = {}  # Global context

# -------------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------------

@app.post("/api/flows")
def save_flow(payload: FlowPayload):
    """Save or version a new flow"""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT MAX(version) FROM flows WHERE name = ?", (payload.name,))
    result = cur.fetchone()
    latest_version = result[0] if result and result[0] else 0
    new_version = latest_version + 1

    cur.execute(
        "INSERT INTO flows (name, version, data, context) VALUES (?, ?, ?, ?)",
        (payload.name, new_version, json.dumps(payload.data), json.dumps(payload.context))
    )
    conn.commit()
    conn.close()

    return {
        "message": "Flow saved successfully",
        "name": payload.name,
        "version": new_version,
    }

@app.get("/api/flows/{name}")
def get_latest_flow(name: str):
    """Get latest version of a given flow"""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "SELECT version, data, context, created_at FROM flows WHERE name = ? ORDER BY version DESC LIMIT 1",
        (name,)
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Flow not found")

    version, data, context, created_at = row
    return {
        "name": name,
        "version": version,
        "created_at": created_at,
        "data": json.loads(data),
        "context": json.loads(context) if context else {}
    }

@app.get("/api/flows/{name}/versions")
def list_flow_versions(name: str):
    """List all versions of a flow"""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "SELECT version, created_at FROM flows WHERE name = ? ORDER BY version DESC",
        (name,)
    )
    rows = cur.fetchall()
    conn.close()

    return [
        {"version": v, "created_at": ts}
        for v, ts in rows
    ]

@app.get("/api/flows")
def list_all_latest_flows():
    """List all workflows with their latest version, data, and context"""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
        SELECT f.name, f.version, f.data, f.context, f.created_at
        FROM flows f
        INNER JOIN (
            SELECT name, MAX(version) AS max_version
            FROM flows
            GROUP BY name
        ) latest
        ON f.name = latest.name AND f.version = latest.max_version
        ORDER BY f.created_at DESC
    """)
    rows = cur.fetchall()
    conn.close()

    return [
        {
            "name": name,
            "latest_version": version,
            "created_at": created_at,
            "data": json.loads(data),
            "context": json.loads(context) if context else {}
        }
        for name, version, data, context, created_at in rows
    ]
