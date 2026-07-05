const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

// @desc  Update the logged-in student's profile (skills, resume, bio, etc.)
// @route PUT /api/students/profile
// @access Private (student)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location, studentProfile } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;

    if (studentProfile) {
      user.studentProfile = {
        ...user.studentProfile.toObject(),
        ...studentProfile,
      };
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

// @desc  Get the logged-in student's own profile
// @route GET /api/students/profile
// @access Private (student)
exports.getProfile = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

// @desc  Apply to a job posting
// @route POST /api/students/apply/:jobId
// @access Private (student)
exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverNote } = req.body;

    const job = await Job.findById(jobId);
    if (!job || job.status !== "active") {
      return res.status(404).json({ message: "This job is not available for applications" });
    }

    const existing = await Application.findOne({ job: jobId, student: req.user._id });
    if (existing) {
      return res.status(409).json({ message: "You have already applied to this job" });
    }

    const application = await Application.create({
      job: jobId,
      student: req.user._id,
      employer: job.employer,
      coverNote,
    });

    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit application", error: error.message });
  }
};

// @desc  Get all applications submitted by the logged-in student
// @route GET /api/students/applications
// @access Private (student)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate("job", "title tradeSkill workshopName location jobType status")
      .sort({ createdAt: -1 });

    res.json({ count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applications", error: error.message });
  }
};

// @desc  Withdraw a previously submitted application
// @route DELETE /api/students/applications/:id
// @access Private (student)
exports.withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, student: req.user._id });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    application.status = "withdrawn";
    await application.save();
    res.json({ message: "Application withdrawn", application });
  } catch (error) {
    res.status(500).json({ message: "Failed to withdraw application", error: error.message });
  }
};
