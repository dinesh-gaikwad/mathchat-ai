"""
Central configuration for MathChat AI backend.
All values can be overridden via environment variables / .env file.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", "sqlite:///mathchat.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # CORS / SocketIO
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

    # LLM provider config: "anthropic" | "openai" | "none"
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "anthropic")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
    ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # Math engine limits
    MAX_EXPR_LENGTH = int(os.getenv("MAX_EXPR_LENGTH", "500"))
    SOLVE_TIMEOUT_SECONDS = int(os.getenv("SOLVE_TIMEOUT_SECONDS", "8"))

    # Chat history
    MAX_HISTORY_MESSAGES = int(os.getenv("MAX_HISTORY_MESSAGES", "200"))


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
