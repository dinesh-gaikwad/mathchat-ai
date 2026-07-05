const express = require("express");
const router = express.Router();
const { getJobs, getJobById, getTradeSkillOptions } = require("../controllers/jobController");

// Public routes - anyone (even logged-out visitors) can browse jobs
router.get("/", getJobs);
router.get("/meta/trade-skills", getTradeSkillOptions);
router.get("/:id", getJobById);

module.exports = router;
