const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    tradeSkill: {
      // Primary trade skill required, e.g. "Electrician", "Welder"
      type: String,
      required: [true, "Trade skill is required"],
      trim: true,
    },
    additionalSkills: [{ type: String, trim: true }],
    jobType: {
      type: String,
      enum: ["Apprenticeship", "Full-Time", "Part-Time", "Contract"],
      default: "Apprenticeship",
    },
    workshopName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    requirements: {
      type: String,
      trim: true,
    },
    stipendOrSalary: {
      type: String, // stored as free text since apprenticeships often quote a range/stipend
      trim: true,
    },
    durationMonths: {
      type: Number,
      min: 0,
    },
    vacancies: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      // Admin can flag/remove fraudulent postings without deleting history
      type: String,
      enum: ["active", "closed", "flagged"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Text index enables fast keyword search across title/skill/description.
jobSchema.index({ title: "text", tradeSkill: "text", description: "text" });
jobSchema.index({ location: 1 });
jobSchema.index({ tradeSkill: 1 });

module.exports = mongoose.model("Job", jobSchema);
