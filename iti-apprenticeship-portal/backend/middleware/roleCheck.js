// Factory that returns middleware restricting a route to specific roles.
// Usage: router.post("/jobs", protect, allowRoles("employer"), createJob)
function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied: requires role(s) ${roles.join(", ")}`,
      });
    }
    next();
  };
}

module.exports = allowRoles;
