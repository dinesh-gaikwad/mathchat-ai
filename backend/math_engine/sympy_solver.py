"""
SympySolver: performs exact symbolic math and produces a list of
human-readable "steps" describing how the result was reached.

Every public method returns a dict:
{
    "success": bool,
    "result": str,          # plain text result
    "latex": str,            # latex of the result
    "steps": [ {"text": str, "latex": str}, ... ],
    "error": str | None
}
"""
import signal
import sympy as sp
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
    convert_xor,
)

TRANSFORMS = standard_transformations + (
    implicit_multiplication_application,
    convert_xor,
)


class TimeoutError(Exception):
    pass


def _timeout_handler(signum, frame):
    raise TimeoutError("Computation took too long")


class timeout_guard:
    """Context manager that aborts long-running sympy calls (unix only)."""

    def __init__(self, seconds):
        self.seconds = seconds

    def __enter__(self):
        try:
            signal.signal(signal.SIGALRM, _timeout_handler)
            signal.alarm(self.seconds)
        except (ValueError, AttributeError):
            pass  # not on main thread / not unix -> skip guard

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            signal.alarm(0)
        except (ValueError, AttributeError):
            pass


class SympySolver:
    def __init__(self, timeout_seconds=8):
        self.timeout_seconds = timeout_seconds

    # ---------- helpers ----------

    def _safe_parse(self, expr_str, local_symbols=None):
        local_dict = {s.name: s for s in (local_symbols or [])}
        return parse_expr(expr_str, transformations=TRANSFORMS, local_dict=local_dict)

    def _fmt(self, expr):
        return {"text": str(expr), "latex": sp.latex(expr)}

    def _error(self, message):
        return {
            "success": False,
            "result": None,
            "latex": None,
            "steps": [],
            "error": message,
        }

    def _ok(self, result_expr, steps):
        return {
            "success": True,
            "result": str(result_expr),
            "latex": sp.latex(result_expr),
            "steps": steps,
            "error": None,
        }

    # ---------- operations ----------

    def solve_equation(self, expr_str: str, variable: str = "x"):
        try:
            var = sp.Symbol(variable)
            steps = []

            if "=" in expr_str:
                lhs_str, rhs_str = expr_str.split("=", 1)
                lhs = self._safe_parse(lhs_str, [var])
                rhs = self._safe_parse(rhs_str, [var])
                steps.append({
                    "text": f"Start with the equation: {lhs} = {rhs}",
                    "latex": f"{sp.latex(lhs)} = {sp.latex(rhs)}",
                })
                equation = sp.Eq(lhs, rhs)
                moved = sp.simplify(lhs - rhs)
                steps.append({
                    "text": f"Move all terms to one side: {moved} = 0",
                    "latex": f"{sp.latex(moved)} = 0",
                })
            else:
                lhs = self._safe_parse(expr_str, [var])
                equation = sp.Eq(lhs, 0)
                steps.append({
                    "text": f"Set the expression equal to zero: {lhs} = 0",
                    "latex": f"{sp.latex(lhs)} = 0",
                })

            with timeout_guard(self.timeout_seconds):
                solutions = sp.solve(equation, var)

            if not solutions:
                steps.append({"text": "No solutions found over the reals/complexes.", "latex": ""})
                return self._ok("No solution", steps)

            steps.append({
                "text": f"Solve for {variable}: " + ", ".join(f"{variable} = {s}" for s in solutions),
                "latex": ", ".join(f"{variable} = {sp.latex(s)}" for s in solutions),
            })
            result_str = ", ".join(f"{variable} = {s}" for s in solutions)
            return self._ok(result_str, steps)
        except TimeoutError:
            return self._error("Computation timed out - the equation may be too complex.")
        except Exception as e:
            return self._error(f"Could not solve equation: {e}")

    def differentiate(self, expr_str: str, variable: str = "x", order: int = 1):
        try:
            var = sp.Symbol(variable)
            expr = self._safe_parse(expr_str, [var])
            steps = [{
                "text": f"Differentiate f({variable}) = {expr} with respect to {variable}",
                "latex": f"f({variable}) = {sp.latex(expr)}",
            }]
            with timeout_guard(self.timeout_seconds):
                derivative = sp.diff(expr, var, order)
            simplified = sp.simplify(derivative)
            steps.append({
                "text": f"f'({variable}) = {simplified}",
                "latex": f"f'({variable}) = {sp.latex(simplified)}",
            })
            return self._ok(simplified, steps)
        except TimeoutError:
            return self._error("Computation timed out.")
        except Exception as e:
            return self._error(f"Could not differentiate: {e}")

    def integrate(self, expr_str: str, variable: str = "x", lower=None, upper=None):
        try:
            var = sp.Symbol(variable)
            expr = self._safe_parse(expr_str, [var])
            steps = [{
                "text": f"Integrate f({variable}) = {expr} with respect to {variable}",
                "latex": f"\\int {sp.latex(expr)}\\, d{variable}",
            }]
            with timeout_guard(self.timeout_seconds):
                if lower is not None and upper is not None:
                    lo = self._safe_parse(str(lower))
                    hi = self._safe_parse(str(upper))
                    result = sp.integrate(expr, (var, lo, hi))
                    steps.append({
                        "text": f"Evaluate definite integral from {lower} to {upper}: result = {result}",
                        "latex": f"\\int_{{{lower}}}^{{{upper}}} {sp.latex(expr)}\\, d{variable} = {sp.latex(result)}",
                    })
                else:
                    result = sp.integrate(expr, var)
                    steps.append({
                        "text": f"Antiderivative: F({variable}) = {result} + C",
                        "latex": f"F({variable}) = {sp.latex(result)} + C",
                    })
            return self._ok(result, steps)
        except TimeoutError:
            return self._error("Computation timed out.")
        except Exception as e:
            return self._error(f"Could not integrate: {e}")

    def limit(self, expr_str: str, variable: str = "x", point="0"):
        try:
            var = sp.Symbol(variable)
            expr = self._safe_parse(expr_str, [var])
            pt = self._safe_parse(str(point))
            steps = [{
                "text": f"Evaluate the limit of {expr} as {variable} approaches {point}",
                "latex": f"\\lim_{{{variable} \\to {sp.latex(pt)}}} {sp.latex(expr)}",
            }]
            with timeout_guard(self.timeout_seconds):
                result = sp.limit(expr, var, pt)
            steps.append({"text": f"Result: {result}", "latex": sp.latex(result)})
            return self._ok(result, steps)
        except TimeoutError:
            return self._error("Computation timed out.")
        except Exception as e:
            return self._error(f"Could not evaluate limit: {e}")

    def simplify(self, expr_str: str, variable: str = "x"):
        try:
            var = sp.Symbol(variable)
            expr = self._safe_parse(expr_str, [var])
            steps = [{"text": f"Original expression: {expr}", "latex": sp.latex(expr)}]
            with timeout_guard(self.timeout_seconds):
                simplified = sp.simplify(expr)
            steps.append({"text": f"Simplified: {simplified}", "latex": sp.latex(simplified)})
            return self._ok(simplified, steps)
        except TimeoutError:
            return self._error("Computation timed out.")
        except Exception as e:
            return self._error(f"Could not simplify: {e}")

    def factor(self, expr_str: str, variable: str = "x"):
        try:
            var = sp.Symbol(variable)
            expr = self._safe_parse(expr_str, [var])
            steps = [{"text": f"Original expression: {expr}", "latex": sp.latex(expr)}]
            with timeout_guard(self.timeout_seconds):
                factored = sp.factor(expr)
            steps.append({"text": f"Factored form: {factored}", "latex": sp.latex(factored)})
            return self._ok(factored, steps)
        except TimeoutError:
            return self._error("Computation timed out.")
        except Exception as e:
            return self._error(f"Could not factor: {e}")

    def expand(self, expr_str: str, variable: str = "x"):
        try:
            var = sp.Symbol(variable)
            expr = self._safe_parse(expr_str, [var])
            steps = [{"text": f"Original expression: {expr}", "latex": sp.latex(expr)}]
            with timeout_guard(self.timeout_seconds):
                expanded = sp.expand(expr)
            steps.append({"text": f"Expanded form: {expanded}", "latex": sp.latex(expanded)})
            return self._ok(expanded, steps)
        except TimeoutError:
            return self._error("Computation timed out.")
        except Exception as e:
            return self._error(f"Could not expand: {e}")

    def dispatch(self, operation: str, expression: str, variable: str = "x", extra: dict = None):
        extra = extra or {}
        if operation == "solve":
            return self.solve_equation(expression, variable)
        if operation == "differentiate":
            return self.differentiate(expression, variable)
        if operation == "integrate":
            return self.integrate(expression, variable, extra.get("lower"), extra.get("upper"))
        if operation == "limit":
            return self.limit(expression, extra.get("variable", variable), extra.get("point", "0"))
        if operation == "simplify":
            return self.simplify(expression, variable)
        if operation == "factor":
            return self.factor(expression, variable)
        if operation == "expand":
            return self.expand(expression, variable)
        return self._error(f"Unsupported operation: {operation}")
