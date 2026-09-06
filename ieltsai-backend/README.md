# IELTS AI — FastAPI backend reference

Quick reference for how this backend is organized, what each piece does, and how to grow it step by step.

---

## What is FastAPI?

**REST API** is a *style*: URLs + HTTP methods (`GET`, `POST`, …) + usually JSON. Your React app calls endpoints like `POST /api/grade`.

**FastAPI** is a *Python framework* for building those HTTP APIs. It handles:

- Routing (which URL calls which function)
- Request parsing and validation
- JSON responses
- Auto-generated docs at `/docs`

FastAPI is not only REST — it also supports WebSockets, file uploads, background tasks, etc. For this project you will mostly use it as a **JSON REST-style API** that the React frontend calls.

FastAPI is **not** Django. It does not ship an admin panel, ORM, or HTML templates. You add those only if you need them.

---

## Recommended file structure

You are at **Stage 1** (single `main.py`). That is fine for learning. Split files as the app grows:

```
ieltsai-backend/
├── .venv/                 # local Python env — do not commit
├── .env                   # secrets (API keys) — do not commit
├── .gitignore             # ignore .venv, .env, __pycache__
├── requirements.txt       # pinned deps for reproducible installs
├── main.py                # create app, mount routers, CORS — thin entrypoint
├── app/
│   ├── __init__.py        # makes `app` a Python package
│   ├── config.py          # read env vars (API key, allowed origins)
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py      # GET /  or  GET /health
│   │   └── grade.py       # POST /api/grade (IELTS essay submission)
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── grade.py       # Pydantic models: request/response shapes
│   └── services/
│       ├── __init__.py
│       └── grading.py     # call LLM — no HTTP here
└── tests/                 # optional later
    └── test_grade.py
```

---

## What each piece does

| File / folder | Role | Need it now? |
|---------------|------|--------------|
| `main.py` | Boot the app, wire pieces together | Yes |
| `routers/` | URL groups (`/api/grade`, `/health`) | When you have more than 1–2 routes |
| `schemas/` | Request/response types (Pydantic) | When you accept JSON bodies |
| `services/` | Business logic (LLM calls, scoring rules) | When logic gets non-trivial |
| `config.py` | Load `.env`, settings | When you use API keys |
| `requirements.txt` | Reproducible `pip install` | Before you forget what you installed |
| `.env` | Secrets (e.g. DeepSeek API key) | When backend calls the LLM |
| `.gitignore` | Keep secrets and venv out of git | Soon |

You do **not** need every folder on day one. Add them when a file gets messy.

---

## Router

A **router** groups related routes in their own file instead of stuffing everything into `main.py`.

```python
# app/routers/grade.py
from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["grade"])

@router.post("/grade")
def grade_essay(...):
    ...
```

```python
# main.py
from app.routers.grade import router as grade_router

app.include_router(grade_router)
```

**Why:** keeps `main.py` small; each feature (health, grade, auth later) has its own file.

---

## Schema (Pydantic)

**Schemas** define the shape of JSON in and out. FastAPI uses them to validate requests and document the API.

```python
# app/schemas/grade.py
from pydantic import BaseModel

class GradeRequest(BaseModel):
    essay: str
    task_type: str  # e.g. "task2"

class GradeResponse(BaseModel):
    band_score: float
    feedback: str
```

---

## Service

A **service** is plain Python with **no HTTP** — the “what actually happens” code.

Example flow for grading:

1. **Router** (`routers/grade.py`) — receives HTTP, validates input
2. **Service** (`services/grading.py`) — builds prompt, calls DeepSeek, parses score
3. **Router** — returns JSON to React

That split lets you test grading logic without starting a server, and change the LLM without touching URL code.

---

## What you do not need yet

- **Database / models** — not until you save users, essays, or history
- **Separate `controllers/`** — FastAPI routers already act as controllers
- **Repository layer** — only when you have a database
- **Multiple app instances** — one `app` is enough for this project

---

## Growth path (one step at a time)

1. **Now:** `main.py` only
2. **Next:** `requirements.txt` + `.gitignore` + API key in backend `.env` (not frontend)
3. **Then:** `routers/health.py` + `routers/grade.py` + `schemas/grade.py`
4. **Then:** `services/grading.py` for the LLM call
5. **Later:** database, auth, tests — only if the product needs them

---

## How this connects to the React frontend

The frontend calls the backend over HTTP:

```javascript
fetch("http://127.0.0.1:8000/api/grade", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ essay: "...", task_type: "task2" }),
});
```

- **FastAPI** exposes the endpoint
- **Uvicorn** runs the server
- **Router** handles the request
- **Service** talks to DeepSeek
- **Schema** defines what JSON looks like in and out

---

## Local dev commands

From `ieltsai-backend/`:

```bash
# activate venv (every new terminal)
source .venv/bin/activate

# run server (do not use `python main.py`)
uvicorn main:app --reload

# check what is on port 8000
lsof -nP -iTCP:8000 -sTCP:LISTEN
```

- App: http://127.0.0.1:8000
- Auto docs: http://127.0.0.1:8000/docs

---

## Key concepts (cheat sheet)

| Term | Meaning |
|------|---------|
| **App instance** | `app = FastAPI()` — one object that holds all routes |
| **Decorator** | `@app.get("/")` registers a function as a route handler |
| **Uvicorn** | ASGI server that listens on a port and calls your `app` |
| **venv** | Project-local Python + packages (like `node_modules` for Python) |
| **Pydantic** | Validates and serializes JSON via Python type hints |
