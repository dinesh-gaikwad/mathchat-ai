const jwt = require("jsonwebtoken");

// Signs a JWT that carries the user id and role. The role is embedded so
// authorization middleware doesn't need an extra database round trip.
function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

module.exports = generateToken;
