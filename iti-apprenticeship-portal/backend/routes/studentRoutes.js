const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/roleCheck");
const {
  getProfile,
  updateProfile,
  applyToJob,
  getMyApplications,
  withdrawApplication,
} = require("../controllers/studentController");

// All routes below require a logged-in student
router.use(protect, allowRoles("student"));

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/apply/:jobId", applyToJob);
router.get("/applications", getMyApplications);
router.delete("/applications/:id", withdrawApplication);

module.exports = router;
