# MathChat AI — Real-Time Mathematical Chat Platform

A live chat app where users type math questions in plain text (or LaTeX) and get
**exact, step-by-step solutions** (via SymPy) explained in natural language
(via an LLM), delivered instantly over WebSocket.

## Architecture

```
Browser (React)  <--WebSocket (Socket.IO)-->  Flask + Flask-SocketIO backend
                                                    |
                                                    +--> MathParser        (intent detection)
                                                    +--> SympySolver       (exact computation + steps)
                                                    +--> LLMExplainer      (Anthropic/OpenAI natural language)
                                                    +--> SQLite/Postgres   (session + message history)
```

- **Real-time transport**: Socket.IO events (`math_query`, `message_received`,
  `session_history`, `typing`, `peer_typing`).
- **Exact math**: SymPy handles `solve`, `differentiate`, `integrate` (definite
  & indefinite), `limit`, `simplify`, `factor`, `expand`, each returning a
  step trace.
- **AI explanation**: every SymPy result is handed to the LLM to be explained
  in plain language; free-form conceptual questions ("what is a derivative?")
  go straight to the LLM. If no LLM key is set, a deterministic templated
  explanation is used instead so the app still works.
- **Persistence**: chat sessions + messages stored via SQLAlchemy (SQLite by
  default, swap `DATABASE_URL` for Postgres in production).

## Quick start (Docker)

```bash
cp backend/.env.example backend/.env      # add your ANTHROPIC_API_KEY or OPENAI_API_KEY
docker compose up --build
```
- Frontend: http://localhost:3000
- Backend health check: http://localhost:5000/api/health

## Quick start (manual)

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in LLM API key
python app.py
```

**Frontend**
```bash
cd frontend
cp .env.example .env
npm install
npm start
```

## Example queries to try in the chat

- `solve 2x^2 - 8 = 0`
- `differentiate sin(x)*x^2`
- `integrate x^2 + 3x from 0 to 2`
- `limit (1 - cos(x))/x^2 as x -> 0`
- `factor x^2 - 5x + 6`
- `what is the fundamental theorem of calculus?` (free chat)

## Project layout

```
mathchat-ai-platform/
├── backend/
│   ├── app.py                 # Flask + SocketIO app factory
│   ├── config.py               # env-driven config
│   ├── database.py / models.py # SQLAlchemy session + message models
│   ├── routes.py                # REST endpoints (sessions, health, one-shot solve)
│   ├── sockets.py                # real-time event handlers
│   └── math_engine/
│       ├── parser.py             # NL/LaTeX -> operation + expression
│       ├── sympy_solver.py       # exact solve/diff/integrate/limit + steps
│       └── llm_explainer.py      # Anthropic/OpenAI explanation layer
└── frontend/
    └── src/
        ├── App.jsx
        ├── components/ (Sidebar, ChatWindow, MessageBubble, MathInput, TypingIndicator)
        └── services/ (socket.js, api.js)
```

## Notes / next steps

- Swap SQLite for Postgres by setting `DATABASE_URL` for multi-instance deployments.
- Horizontal scaling of SocketIO requires a message queue backend (Redis) — add
  `message_queue="redis://..."` to `SocketIO()` in `app.py`.
- Add auth (JWT/session cookies) before exposing publicly — currently sessions
  are unauthenticated and identified only by UUID.
