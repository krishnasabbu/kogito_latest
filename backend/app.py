from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from datetime import datetime
import json

app = FastAPI(title="Flow Store API")

# -------------------------------------------------------------------
# CORS setup (adjust for your frontend port)
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
    cur.execute("""
        CREATE TABLE IF NOT EXISTS flows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            version INTEGER NOT NULL,
            data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

# -------------------------------------------------------------------
# Models
# -------------------------------------------------------------------
class FlowPayload(BaseModel):
    name: str
    data: dict  # React Flow JSON

# -------------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------------

@app.post("/api/flows")
def save_flow(payload: FlowPayload):
    """Save or version a new flow"""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Get latest version for same flow name
    cur.execute("SELECT MAX(version) FROM flows WHERE name = ?", (payload.name,))
    result = cur.fetchone()
    latest_version = result[0] if result and result[0] else 0
    new_version = latest_version + 1

    # Store JSON as text
    cur.execute(
        "INSERT INTO flows (name, version, data) VALUES (?, ?, ?)",
        (payload.name, new_version, json.dumps(payload.data))
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
        "SELECT version, data, created_at FROM flows WHERE name = ? ORDER BY version DESC LIMIT 1",
        (name,)
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Flow not found")

    version, data, created_at = row
    return {
        "name": name,
        "version": version,
        "created_at": created_at,
        "data": json.loads(data)
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
