import json
from datetime import datetime

from flask import request
from flask_socketio import emit, join_room, leave_room

from database import db
from models import ChatSession, Message


def register_socket_handlers(socketio, solver, parser, explainer):

    @socketio.on("connect")
    def handle_connect():
        emit("connected", {"sid": request.sid, "message": "Connected to MathChat AI"})

    @socketio.on("disconnect")
    def handle_disconnect():
        pass  # room cleanup happens naturally; no server-side state to purge

    @socketio.on("join_session")
    def handle_join_session(data):
        session_id = data.get("session_id")
        if not session_id:
            emit("error", {"message": "session_id is required"})
            return

        session = ChatSession.query.get(session_id)
        if not session:
            session = ChatSession(id=session_id, title=data.get("title", "New Math Chat"))
            db.session.add(session)
            db.session.commit()

        join_room(session_id)
        history = [m.to_dict() for m in session.messages.limit(200)]
        emit("session_history", {"session_id": session_id, "messages": history})

    @socketio.on("leave_session")
    def handle_leave_session(data):
        session_id = data.get("session_id")
        if session_id:
            leave_room(session_id)

    @socketio.on("typing")
    def handle_typing(data):
        session_id = data.get("session_id")
        if session_id:
            emit("peer_typing", {"session_id": session_id}, to=session_id, include_self=False)

    @socketio.on("math_query")
    def handle_math_query(data):
        """
        Main entry point for a user chat message. Pipeline:
          1. Persist user message
          2. Parse -> detect operation + expression
          3. If operation is a solvable math op -> SymPy solve -> LLM explains result
          4. Else -> LLM free chat
          5. Persist + broadcast assistant message
        """
        session_id = data.get("session_id")
        text = (data.get("message") or "").strip()

        if not session_id or not text:
            emit("error", {"message": "session_id and message are required"})
            return

        session = ChatSession.query.get(session_id)
        if not session:
            session = ChatSession(id=session_id)
            db.session.add(session)
            db.session.commit()

        user_msg = Message(session_id=session_id, role="user", content=text)
        db.session.add(user_msg)
        db.session.commit()
        emit("message_received", user_msg.to_dict(), to=session_id)

        parsed = parser.parse(text)
        operation = parsed["operation"]

        if operation == "chat":
            history = [
                {"role": m.role, "content": m.content}
                for m in session.messages.order_by(Message.created_at.desc()).limit(10)
            ][::-1]
            reply_text = explainer.free_chat(text, history)
            reply_latex = None
            steps_json = None
        else:
            sympy_result = solver.dispatch(
                operation, parsed["expression"], parsed["variable"], parsed["extra"]
            )
            reply_text = explainer.explain_result(text, sympy_result)
            reply_latex = sympy_result.get("latex")
            steps_json = json.dumps(sympy_result.get("steps", []))

        assistant_msg = Message(
            session_id=session_id,
            role="assistant",
            content=reply_text,
            latex=reply_latex,
            steps_json=steps_json,
        )
        db.session.add(assistant_msg)
        session.updated_at = datetime.utcnow()
        db.session.commit()

        emit("message_received", assistant_msg.to_dict(), to=session_id)
