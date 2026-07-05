import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TRADE_SKILLS = ["Electrician", "Welder", "Fitter", "Machinist", "Mechanic", "Technician", "Plumber", "Carpenter"];

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    tradeSkills: [],
    itiInstituteName: "",
    certificationDetails: "",
    workshopName: "",
    industryType: "",
    companyDescription: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      tradeSkills: prev.tradeSkills.includes(skill)
        ? prev.tradeSkills.filter((s) => s !== skill)
        : [...prev.tradeSkills, skill],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      location: form.location,
      role,
    };

    if (role === "student") {
      payload.studentProfile = {
        tradeSkills: form.tradeSkills,
        itiInstituteName: form.itiInstituteName,
        certificationDetails: form.certificationDetails,
      };
    } else {
      payload.employerProfile = {
        workshopName: form.workshopName,
        industryType: form.industryType,
        companyDescription: form.companyDescription,
      };
    }

    const result = await register(payload);
    if (!result.success) {
      setError(result.message);
      return;
    }

    if (role === "employer") {
      setSuccess(result.message || "Registered! Awaiting admin approval before you can post jobs.");
      setTimeout(() => navigate("/employer/dashboard"), 1500);
    } else {
      navigate("/student/dashboard");
    }
  };

  return (
    <div className="page container" style={{ maxWidth: 560 }}>
      <h1>Create Account</h1>

      <div className="tabs">
        <div className={`tab ${role === "student" ? "active" : ""}`} onClick={() => setRole("student")}>
          I'm a Student
        </div>
        <div className={`tab ${role === "employer" ? "active" : ""}`} onClick={() => setRole("employer")}>
          I'm an Employer
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input id="name" name="name" required value={form.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" minLength={6} required value={form.password} onChange={handleChange} />
        </div>
        <div className="grid grid-2">
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location (City, State)</label>
            <input id="location" name="location" value={form.location} onChange={handleChange} />
          </div>
        </div>

        {role === "student" ? (
          <>
            <div className="form-group">
              <label>Trade Skills</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {TRADE_SKILLS.map((skill) => (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={form.tradeSkills.includes(skill) ? "btn btn-primary" : "btn btn-outline"}
                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem" }}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="itiInstituteName">ITI Institute Name</label>
              <input id="itiInstituteName" name="itiInstituteName" value={form.itiInstituteName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="certificationDetails">Certification Details</label>
              <input
                id="certificationDetails"
                name="certificationDetails"
                placeholder="e.g. NCVT Electrician Trade Certificate, 2024"
                value={form.certificationDetails}
                onChange={handleChange}
              />
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="workshopName">Workshop / Factory Name</label>
              <input id="workshopName" name="workshopName" required value={form.workshopName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="industryType">Industry Type</label>
              <input
                id="industryType"
                name="industryType"
                placeholder="e.g. Precision Machining, Auto Repair"
                value={form.industryType}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="companyDescription">Short Company Description</label>
              <textarea id="companyDescription" name="companyDescription" rows={3} value={form.companyDescription} onChange={handleChange} />
            </div>
          </>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p style={{ marginTop: "1rem" }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
