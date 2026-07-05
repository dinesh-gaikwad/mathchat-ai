const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// A single User model backs all three roles (student, employer, admin).
// Role-specific fields are grouped in sub-objects so the schema stays
// readable while still living in one collection for simple auth lookups.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "employer", "admin"],
      required: true,
      default: "student",
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    isApproved: {
      // Employers must be approved by an admin before they can post jobs.
      // Students and admins are approved by default.
      type: Boolean,
      default: function () {
        return this.role !== "employer";
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // --- Student-specific profile fields ---
    studentProfile: {
      tradeSkills: [{ type: String, trim: true }], // e.g. Electrician, Welder, Fitter
      itiInstituteName: { type: String, trim: true },
      certificationDetails: { type: String, trim: true },
      experienceYears: { type: Number, default: 0, min: 0 },
      resumeUrl: { type: String, trim: true },
      bio: { type: String, trim: true, maxlength: 1000 },
    },

    // --- Employer-specific profile fields ---
    employerProfile: {
      workshopName: { type: String, trim: true },
      industryType: { type: String, trim: true },
      companyDescription: { type: String, trim: true, maxlength: 1000 },
      website: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

// Hash the password before saving, but only when it has actually changed.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method used by the auth controller to verify login credentials.
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Strip sensitive/internal fields whenever a user document is serialized.
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
