r"""
MathParser turns a raw chat message into a structured "intent":
  - operation: solve | differentiate | integrate | limit | simplify | factor | expand | plot_data | chat
  - expression: the plain-text math expression, cleaned up
  - variable: primary variable involved (default 'x')
  - extra: operation-specific params (e.g. limit point, bounds)

It tries LaTeX first (if the client sends `$...$` or `\(...\)` wrapped input coming
from a math keyboard), then falls back to plain-text heuristics.
"""
import re

try:
    from latex2sympy2 import latex2sympy
    HAS_LATEX = True
except Exception:
    HAS_LATEX = False

OPERATION_KEYWORDS = {
    "differentiate": ["derivative", "differentiate", "d/dx", "diff("],
    "integrate": ["integral", "integrate", "antiderivative", "∫"],
    "limit": ["limit", "lim "],
    "factor": ["factor"],
    "expand": ["expand"],
    "simplify": ["simplify", "reduce"],
    "solve": ["solve", "=", "roots of", "find x"],
}

LATEX_WRAPPERS = [
    (re.compile(r"\$\$(.+?)\$\$", re.S), 1),
    (re.compile(r"\$(.+?)\$", re.S), 1),
    (re.compile(r"\\\((.+?)\\\)", re.S), 1),
    (re.compile(r"\\\[(.+?)\\\]", re.S), 1),
]


class MathParser:
    def __init__(self, default_variable="x"):
        self.default_variable = default_variable

    def extract_latex(self, text: str):
        for pattern, group in LATEX_WRAPPERS:
            m = pattern.search(text)
            if m:
                return m.group(group).strip()
        return None

    def detect_operation(self, text: str) -> str:
        lowered = text.lower()
        for op, keywords in OPERATION_KEYWORDS.items():
            for kw in keywords:
                if kw in lowered:
                    return op
        # Pure expression with no keyword and no '=' -> treat as simplify/chat
        if re.search(r"[a-zA-Z0-9\)\]]\s*[\+\-\*/\^]\s*[a-zA-Z0-9\(\[]", text):
            return "simplify"
        return "chat"

    def clean_expression(self, text: str) -> str:
        expr = text
        expr = re.sub(r"(differentiate|derivative of|find the derivative of)", "", expr, flags=re.I)
        expr = re.sub(r"(integrate|find the integral of|integral of)", "", expr, flags=re.I)
        expr = re.sub(r"(simplify|factor|expand|solve for|solve|find the limit of|limit of|limit)", "", expr, flags=re.I)
        expr = re.sub(r"from\s+[\-\d\.]+\s+to\s+[\-\d\.]+", "", expr, flags=re.I)
        expr = re.sub(r"(?:as\s+)?[a-zA-Z]\s*(?:->|→|approaches)\s*[\-\w\.]+", "", expr, flags=re.I)
        expr = expr.replace("^", "**")
        expr = expr.replace("÷", "/")
        expr = expr.replace("×", "*")
        expr = expr.strip(" ?.\n\t")
        return expr

    def detect_variable(self, expr: str) -> str:
        candidates = re.findall(r"\b([a-zA-Z])\b", expr)
        # filter out common function names accidentally matched
        candidates = [c for c in candidates if c.lower() not in ("e",)]
        if candidates:
            # prefer x, then y, then t, else first found
            for preferred in ("x", "y", "t", "n"):
                if preferred in [c.lower() for c in candidates]:
                    return preferred
            return candidates[0]
        return self.default_variable

    def extract_limit_point(self, text: str):
        m = re.search(r"(?:as\s+)?([a-zA-Z])\s*(?:->|→|approaches)\s*([\-\w\.]+)", text)
        if m:
            return m.group(1), m.group(2)
        return self.default_variable, "0"

    def extract_bounds(self, text: str):
        m = re.search(r"from\s+([\-\d\.]+)\s+to\s+([\-\d\.]+)", text, re.I)
        if m:
            return m.group(1), m.group(2)
        return None, None

    def parse(self, text: str) -> dict:
        latex = self.extract_latex(text)
        raw = latex if latex else text
        operation = self.detect_operation(text)
        expression = self.clean_expression(raw)
        variable = self.detect_variable(expression)

        extra = {}
        if operation == "limit":
            var, point = self.extract_limit_point(text)
            extra["variable"] = var
            extra["point"] = point
        if operation == "integrate":
            lo, hi = self.extract_bounds(text)
            if lo is not None:
                extra["lower"] = lo
                extra["upper"] = hi

        return {
            "operation": operation,
            "expression": expression,
            "variable": variable,
            "extra": extra,
            "latex_input": latex,
            "used_latex": bool(latex) and HAS_LATEX,
        }
