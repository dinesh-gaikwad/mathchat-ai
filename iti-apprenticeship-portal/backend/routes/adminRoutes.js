const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/roleCheck");
const {
  getUsers,
  approveEmployer,
  setUserActiveStatus,
  getAllJobs,
  flagJob,
  getAnalytics,
} = require("../controllers/adminController");

// All routes below require a logged-in admin
router.use(protect, allowRoles("admin"));

router.get("/users", getUsers);
router.put("/users/:id/status", setUserActiveStatus);
router.put("/employers/:id/approve", approveEmployer);

router.get("/jobs", getAllJobs);
router.put("/jobs/:id/flag", flagJob);

router.get("/analytics", getAnalytics);

module.exports = router;
