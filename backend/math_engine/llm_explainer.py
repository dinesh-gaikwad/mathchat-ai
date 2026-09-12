"""
LLMExplainer calls an external LLM (Anthropic or OpenAI) to:
  1. Hold natural free-form math conversation (no exact solve needed), and
  2. Turn a SymPy result + step trace into a friendly, tutor-style explanation.

If no API key is configured, it falls back to a deterministic templated
explanation built purely from the SymPy step data, so the platform is always
usable even without LLM credentials.
"""
import requests


class LLMExplainer:
    def __init__(self, provider="anthropic", anthropic_key="", anthropic_model="claude-sonnet-4-6",
                 openai_key="", openai_model="gpt-4o-mini"):
        self.provider = provider
        self.anthropic_key = anthropic_key
        self.anthropic_model = anthropic_model
        self.openai_key = openai_key
        self.openai_model = openai_model

    @property
    def enabled(self):
        if self.provider == "anthropic":
            return bool(self.anthropic_key)
        if self.provider == "openai":
            return bool(self.openai_key)
        return False

    # ---------- provider calls ----------

    def _call_anthropic(self, system_prompt, user_prompt):
        resp = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": self.anthropic_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": self.anthropic_model,
                "max_tokens": 600,
                "system": system_prompt,
                "messages": [{"role": "user", "content": user_prompt}],
            },
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()
        parts = [b["text"] for b in data.get("content", []) if b.get("type") == "text"]
        return "\n".join(parts).strip()

    def _call_openai(self, system_prompt, user_prompt):
        resp = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {self.openai_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": self.openai_model,
                "max_tokens": 600,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            },
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()

    def _call_llm(self, system_prompt, user_prompt):
        if self.provider == "anthropic" and self.anthropic_key:
            return self._call_anthropic(system_prompt, user_prompt)
        if self.provider == "openai" and self.openai_key:
            return self._call_openai(system_prompt, user_prompt)
        raise RuntimeError("No LLM provider configured")

    # ---------- public API ----------

    def explain_result(self, question: str, sympy_result: dict, history=None):
        """Turn a sympy_solver result dict into a tutor-style explanation."""
        if not sympy_result.get("success"):
            return self._fallback_error_message(sympy_result)

        if not self.enabled:
            return self._template_explanation(sympy_result)

        steps_text = "\n".join(f"- {s['text']}" for s in sympy_result["steps"])
        system_prompt = (
            "You are a friendly, precise math tutor inside a live chat app. "
            "You are given the exact SymPy-computed result and the mechanical "
            "steps that produced it. Explain it clearly and briefly to the "
            "student in plain language, add one short intuition note, and "
            "never contradict the given result. Keep it under 120 words."
        )
        user_prompt = (
            f"Student asked: {question}\n\n"
            f"Computed steps:\n{steps_text}\n\n"
            f"Final result: {sympy_result['result']}\n\n"
            "Write the explanation now."
        )
        try:
            return self._call_llm(system_prompt, user_prompt)
        except Exception:
            return self._template_explanation(sympy_result)

    def free_chat(self, message: str, history=None):
        """Handle general math conversation that doesn't map to a solvable expression."""
        if not self.enabled:
            return (
                "I can chat about math concepts, but general conversation needs an "
                "LLM API key configured on the server. Try asking me to solve, "
                "differentiate, integrate, or simplify a specific expression instead!"
            )
        history = history or []
        system_prompt = (
            "You are a friendly, encouraging math tutor in a real-time chat app. "
            "Answer conceptual math questions clearly and concisely (under 150 words). "
            "If the student gives a solvable expression, suggest they phrase it as "
            "'solve...', 'differentiate...', 'integrate...' etc. for exact computation."
        )
        convo = "\n".join(f"{m['role']}: {m['content']}" for m in history[-6:])
        user_prompt = f"{convo}\nuser: {message}" if convo else message
        try:
            return self._call_llm(system_prompt, user_prompt)
        except Exception:
            return "Sorry, I couldn't reach the AI explainer right now, but feel free to ask me to solve a specific expression."

    # ---------- fallbacks ----------

    def _template_explanation(self, sympy_result):
        lines = [s["text"] for s in sympy_result["steps"]]
        body = "\n".join(f"{i+1}. {line}" for i, line in enumerate(lines))
        return f"Here's the step-by-step breakdown:\n{body}\n\nFinal answer: {sympy_result['result']}"

    def _fallback_error_message(self, sympy_result):
        return f"I couldn't compute that: {sympy_result.get('error', 'unknown error')}. Could you rephrase the expression?"
