const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

// @desc  List all users, optionally filtered by role
// @route GET /api/admin/users?role=
// @access Private (admin)
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ count: users.length, users: users.map((u) => u.toSafeObject()) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// @desc  Approve a pending employer registration
// @route PUT /api/admin/employers/:id/approve
// @access Private (admin)
exports.approveEmployer = async (req, res) => {
  try {
    const employer = await User.findOne({ _id: req.params.id, role: "employer" });
    if (!employer) return res.status(404).json({ message: "Employer not found" });

    employer.isApproved = true;
    await employer.save();

    res.json({ message: "Employer approved successfully", user: employer.toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve employer", error: error.message });
  }
};

// @desc  Activate or deactivate any user account
// @route PUT /api/admin/users/:id/status
// @access Private (admin)
exports.setUserActiveStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !!isActive;
    await user.save();

    res.json({ message: `User ${isActive ? "activated" : "deactivated"}`, user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user status", error: error.message });
  }
};

// @desc  List all job postings for moderation purposes
// @route GET /api/admin/jobs?status=
// @access Private (admin)
exports.getAllJobs = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const jobs = await Job.find(filter)
      .populate("employer", "name email employerProfile.workshopName")
      .sort({ createdAt: -1 });
    res.json({ count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
};

// @desc  Flag or remove a job posting suspected to be fraudulent
// @route PUT /api/admin/jobs/:id/flag
// @access Private (admin)
exports.flagJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.status = "flagged";
    await job.save();

    res.json({ message: "Job flagged and hidden from public listings", job });
  } catch (error) {
    res.status(500).json({ message: "Failed to flag job", error: error.message });
  }
};

// @desc  Platform-wide analytics for the admin dashboard
// @route GET /api/admin/analytics
// @access Private (admin)
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalStudents,
      totalEmployers,
      pendingEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      hiredCount,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "employer" }),
      User.countDocuments({ role: "employer", isApproved: false }),
      Job.countDocuments(),
      Job.countDocuments({ status: "active" }),
      Application.countDocuments(),
      Application.countDocuments({ status: "hired" }),
    ]);

    res.json({
      totalStudents,
      totalEmployers,
      pendingEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      successfulPlacements: hiredCount,
      applicationRate:
        totalJobs > 0 ? Number((totalApplications / totalJobs).toFixed(2)) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to compute analytics", error: error.message });
  }
};
