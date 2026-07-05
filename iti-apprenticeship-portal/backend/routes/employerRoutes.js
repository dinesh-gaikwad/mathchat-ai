const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/roleCheck");
const {
  updateProfile,
  createJob,
  updateJob,
  closeJob,
  getMyJobs,
  getJobApplications,
  updateApplicationStatus,
} = require("../controllers/employerController");

// All routes below require a logged-in employer
router.use(protect, allowRoles("employer"));

router.put("/profile", updateProfile);

router.post("/jobs", createJob);
router.get("/jobs", getMyJobs);
router.put("/jobs/:id", updateJob);
router.delete("/jobs/:id", closeJob);

router.get("/jobs/:jobId/applications", getJobApplications);
router.put("/applications/:id/status", updateApplicationStatus);

module.exports = router;
