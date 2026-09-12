import os

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

from config import config_map
from database import db
from routes import api
from sockets import register_socket_handlers
from math_engine import MathParser, SympySolver, LLMExplainer

socketio = SocketIO(cors_allowed_origins="*", async_mode="eventlet")


def create_app(env=None):
    env = env or os.getenv("FLASK_ENV", "development")
    app = Flask(__name__)
    app.config.from_object(config_map.get(env, config_map["default"]))

    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    db.init_app(app)
    socketio.init_app(app, cors_allowed_origins=app.config["CORS_ORIGINS"])

    app.register_blueprint(api)

    solver = SympySolver(timeout_seconds=app.config["SOLVE_TIMEOUT_SECONDS"])
    parser = MathParser()
    explainer = LLMExplainer(
        provider=app.config["LLM_PROVIDER"],
        anthropic_key=app.config["ANTHROPIC_API_KEY"],
        anthropic_model=app.config["ANTHROPIC_MODEL"],
        openai_key=app.config["OPENAI_API_KEY"],
        openai_model=app.config["OPENAI_MODEL"],
    )

    register_socket_handlers(socketio, solver, parser, explainer)

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=app.config["DEBUG"])
