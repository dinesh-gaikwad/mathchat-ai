const Job = require("../models/Job");

// @desc  Search / list active jobs with optional filters
// @route GET /api/jobs?keyword=&tradeSkill=&location=&jobType=&page=&limit=
// @access Public
exports.getJobs = async (req, res) => {
  try {
    const { keyword, tradeSkill, location, jobType, page = 1, limit = 10 } = req.query;

    const filter = { status: "active" };

    if (tradeSkill) filter.tradeSkill = new RegExp(tradeSkill, "i");
    if (location) filter.location = new RegExp(location, "i");
    if (jobType) filter.jobType = jobType;
    if (keyword) {
      filter.$or = [
        { title: new RegExp(keyword, "i") },
        { tradeSkill: new RegExp(keyword, "i") },
        { description: new RegExp(keyword, "i") },
        { workshopName: new RegExp(keyword, "i") },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("employer", "name employerProfile.workshopName employerProfile.industryType")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Job.countDocuments(filter),
    ]);

    res.json({
      count: jobs.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      jobs,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
};

// @desc  Get full details for a single job posting
// @route GET /api/jobs/:id
// @access Public
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "employer",
      "name email phone employerProfile"
    );

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json({ job });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job", error: error.message });
  }
};

// @desc  List distinct trade skills currently posted (for search dropdowns)
// @route GET /api/jobs/meta/trade-skills
// @access Public
exports.getTradeSkillOptions = async (req, res) => {
  try {
    const skills = await Job.distinct("tradeSkill", { status: "active" });
    res.json({ skills });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trade skills", error: error.message });
  }
};
