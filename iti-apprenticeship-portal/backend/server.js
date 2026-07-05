require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const employerRoutes = require("./routes/employerRoutes");
const jobRoutes = require("./routes/jobRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// --- Core middleware ---
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000").split(",");
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "iti-apprenticeship-portal-api", time: new Date().toISOString() });
});

// --- Feature routes ---
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/employers", employerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/admin", adminRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// --- Centralized error handler ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start listening. Keeping these sequential avoids
// accepting requests before the database connection is ready.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`ITI Apprenticeship Portal API running on port ${PORT}`);
  });
});

module.exports = app;
