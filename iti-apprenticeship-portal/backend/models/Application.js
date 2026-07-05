const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employer: {
      // Denormalized for quick employer-side queries without an extra join
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverNote: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "hired", "withdrawn"],
      default: "applied",
    },
    employerNotes: {
      // Private notes the employer can keep while reviewing a candidate
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// A student may only apply once per job.
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
