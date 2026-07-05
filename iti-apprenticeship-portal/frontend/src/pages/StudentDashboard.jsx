import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

const TRADE_SKILLS = ["Electrician", "Welder", "Fitter", "Machinist", "Mechanic", "Technician", "Plumber", "Carpenter"];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
    tradeSkills: user?.studentProfile?.tradeSkills || [],
    itiInstituteName: user?.studentProfile?.itiInstituteName || "",
    certificationDetails: user?.studentProfile?.certificationDetails || "",
    experienceYears: user?.studentProfile?.experienceYears || 0,
    bio: user?.studentProfile?.bio || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState("");

  const loadApplications = async () => {
    setLoadingApps(true);
    try {
      const { data } = await api.get("/students/applications");
      setApplications(data.applications);
    } catch (err) {
      // silently handled by empty state
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const toggleSkill = (skill) => {
    setProfile((prev) => ({
      ...prev,
      tradeSkills: prev.tradeSkills.includes(skill)
        ? prev.tradeSkills.filter((s) => s !== skill)
        : [...prev.tradeSkills, skill],
    }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage("");
    try {
      await api.put("/students/profile", {
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        studentProfile: {
          tradeSkills: profile.tradeSkills,
          itiInstituteName: profile.itiInstituteName,
          certificationDetails: profile.certificationDetails,
          experienceYears: Number(profile.experienceYears),
          bio: profile.bio,
        },
      });
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    try {
      await api.delete(`/students/applications/${applicationId}`);
      loadApplications();
    } catch (err) {
      // ignore, list refresh will show current state
    }
  };

  return (
    <div className="page container">
      <h1>Student Dashboard</h1>
      <p style={{ color: "var(--steel-700)" }}>Welcome back, {user?.name}</p>

      <div className="tabs">
        <div className={`tab ${tab === "applications" ? "active" : ""}`} onClick={() => setTab("applications")}>
          My Applications
        </div>
        <div className={`tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>
          Edit Profile
        </div>
      </div>

      {tab === "applications" && (
        <>
          {loadingApps ? (
            <p>Loading applications...</p>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <h3>No applications yet</h3>
              <p>Browse trade jobs and apply to start tracking your applications here.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Trade Skill</th>
                  <th>Workshop</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>{app.job?.title || "Job removed"}</td>
                    <td>{app.job?.tradeSkill}</td>
                    <td>{app.job?.workshopName}</td>
                    <td>{app.job?.location}</td>
                    <td>
                      <span className={`badge badge-${app.status}`}>{app.status}</span>
                    </td>
                    <td>
                      {app.status === "applied" && (
                        <button className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.35rem 0.7rem" }} onClick={() => handleWithdraw(app._id)}>
                          Withdraw
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {tab === "profile" && (
        <form onSubmit={handleProfileSave} className="card">
          {message && <div className={message.includes("success") ? "alert alert-success" : "alert alert-error"}>{message}</div>}

          <div className="grid grid-2">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input id="location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="experienceYears">Experience (years)</label>
              <input
                id="experienceYears"
                type="number"
                min={0}
                value={profile.experienceYears}
                onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Trade Skills</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {TRADE_SKILLS.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={profile.tradeSkills.includes(skill) ? "btn btn-primary" : "btn btn-outline"}
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem" }}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="itiInstituteName">ITI Institute Name</label>
            <input id="itiInstituteName" value={profile.itiInstituteName} onChange={(e) => setProfile({ ...profile, itiInstituteName: e.target.value })} />
          </div>

          <div className="form-group">
            <label htmlFor="certificationDetails">Certification Details</label>
            <input
              id="certificationDetails"
              value={profile.certificationDetails}
              onChange={(e) => setProfile({ ...profile, certificationDetails: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Short Bio</label>
            <textarea id="bio" rows={4} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
          </div>

          <button className="btn btn-primary" type="submit" disabled={savingProfile}>
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>
      )}
    </div>
  );
}
