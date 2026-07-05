const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc  Register a new student, employer, or admin account
// @route POST /api/auth/register
// @access Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, location, studentProfile, employerProfile } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password and role are required" });
    }

    if (role === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot self-register" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      location,
      studentProfile: role === "student" ? studentProfile : undefined,
      employerProfile: role === "employer" ? employerProfile : undefined,
    });

    const token = generateToken(user);

    res.status(201).json({
      message:
        role === "employer"
          ? "Registration successful. Your workshop account is pending admin approval."
          : "Registration successful",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// @desc  Log a user in with email + password
// @route POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated" });
    }

    if (user.role === "employer" && !user.isApproved) {
      return res.status(403).json({
        message: "Your workshop account is still awaiting admin approval",
      });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// @desc  Get the currently authenticated user's own profile
// @route GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};
