const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

// @desc  Update the logged-in employer's workshop/company profile
// @route PUT /api/employers/profile
// @access Private (employer)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location, employerProfile } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;

    if (employerProfile) {
      user.employerProfile = {
        ...user.employerProfile.toObject(),
        ...employerProfile,
      };
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

// @desc  Create a new apprenticeship / trade job posting
// @route POST /api/employers/jobs
// @access Private (employer, must be approved)
exports.createJob = async (req, res) => {
  try {
    if (!req.user.isApproved) {
      return res.status(403).json({ message: "Your account must be approved by an admin before posting jobs" });
    }

    const {
      title,
      tradeSkill,
      additionalSkills,
      jobType,
      workshopName,
      location,
      description,
      requirements,
      stipendOrSalary,
      durationMonths,
      vacancies,
    } = req.body;

    if (!title || !tradeSkill || !workshopName || !location || !description) {
      return res.status(400).json({
        message: "title, tradeSkill, workshopName, location and description are required",
      });
    }

    const job = await Job.create({
      employer: req.user._id,
      title,
      tradeSkill,
      additionalSkills,
      jobType,
      workshopName,
      location,
      description,
      requirements,
      stipendOrSalary,
      durationMonths,
      vacancies,
    });

    res.status(201).json({ message: "Job posted successfully", job });
  } catch (error) {
    res.status(500).json({ message: "Failed to create job", error: error.message });
  }
};

// @desc  Update a job posting owned by the logged-in employer
// @route PUT /api/employers/jobs/:id
// @access Private (employer)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    Object.assign(job, req.body);
    await job.save();

    res.json({ message: "Job updated successfully", job });
  } catch (error) {
    res.status(500).json({ message: "Failed to update job", error: error.message });
  }
};

// @desc  Close/delete a job posting owned by the logged-in employer
// @route DELETE /api/employers/jobs/:id
// @access Private (employer)
exports.closeJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.status = "closed";
    await job.save();

    res.json({ message: "Job closed successfully", job });
  } catch (error) {
    res.status(500).json({ message: "Failed to close job", error: error.message });
  }
};

// @desc  List all jobs posted by the logged-in employer
// @route GET /api/employers/jobs
// @access Private (employer)
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
    res.json({ count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
};

// @desc  List applications received for a specific job posting
// @route GET /api/employers/jobs/:jobId/applications
// @access Private (employer)
exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, employer: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const applications = await Application.find({ job: job._id })
      .populate("student", "name email phone location studentProfile")
      .sort({ createdAt: -1 });

    res.json({ job: { id: job._id, title: job.title }, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applications", error: error.message });
  }
};

// @desc  Shortlist, reject, or hire a candidate for a given application
// @route PUT /api/employers/applications/:id/status
// @access Private (employer)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, employerNotes } = req.body;
    const validStatuses = ["applied", "shortlisted", "rejected", "hired"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const application = await Application.findOne({ _id: req.params.id, employer: req.user._id });
    if (!application) return res.status(404).json({ message: "Application not found" });

    application.status = status;
    if (employerNotes !== undefined) application.employerNotes = employerNotes;
    await application.save();

    res.json({ message: `Application marked as ${status}`, application });
  } catch (error) {
    res.status(500).json({ message: "Failed to update application", error: error.message });
  }
};
