from flask import Blueprint, jsonify, request

from database import db
from models import ChatSession, Message

api = Blueprint("api", __name__, url_prefix="/api")


@api.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "mathchat-ai-backend"})


@api.route("/sessions", methods=["GET"])
def list_sessions():
    sessions = ChatSession.query.order_by(ChatSession.updated_at.desc()).all()
    return jsonify([s.to_dict() for s in sessions])


@api.route("/sessions", methods=["POST"])
def create_session():
    data = request.get_json(silent=True) or {}
    session = ChatSession(title=data.get("title", "New Math Chat"))
    db.session.add(session)
    db.session.commit()
    return jsonify(session.to_dict()), 201


@api.route("/sessions/<session_id>", methods=["GET"])
def get_session(session_id):
    session = ChatSession.query.get_or_404(session_id)
    messages = [m.to_dict() for m in session.messages]
    return jsonify({**session.to_dict(), "messages": messages})


@api.route("/sessions/<session_id>", methods=["DELETE"])
def delete_session(session_id):
    session = ChatSession.query.get_or_404(session_id)
    db.session.delete(session)
    db.session.commit()
    return jsonify({"deleted": session_id})


@api.route("/sessions/<session_id>/rename", methods=["PATCH"])
def rename_session(session_id):
    session = ChatSession.query.get_or_404(session_id)
    data = request.get_json(silent=True) or {}
    session.title = data.get("title", session.title)
    db.session.commit()
    return jsonify(session.to_dict())


@api.route("/solve", methods=["POST"])
def solve_once():
    """Stateless one-shot solve endpoint (no chat persistence) - useful for quick API tests."""
    from math_engine import MathParser, SympySolver

    data = request.get_json(silent=True) or {}
    text = data.get("message", "")
    if not text:
        return jsonify({"error": "message is required"}), 400

    parser = MathParser()
    solver = SympySolver()
    parsed = parser.parse(text)
    result = solver.dispatch(parsed["operation"], parsed["expression"], parsed["variable"], parsed["extra"])
    return jsonify({"parsed": parsed, "result": result})
