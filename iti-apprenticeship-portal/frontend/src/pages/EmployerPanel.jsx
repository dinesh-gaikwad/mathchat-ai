import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

const emptyJobForm = {
  title: "",
  tradeSkill: "",
  jobType: "Apprenticeship",
  workshopName: "",
  location: "",
  description: "",
  requirements: "",
  stipendOrSalary: "",
  durationMonths: "",
  vacancies: 1,
};

export default function EmployerPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobForm, setJobForm] = useState({ ...emptyJobForm, workshopName: user?.employerProfile?.workshopName || "" });
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const { data } = await api.get("/employers/jobs");
      setJobs(data.jobs);
    } catch (err) {
      // handled by empty state
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setPosting(true);
    setMessage("");
    try {
      await api.post("/employers/jobs", {
        ...jobForm,
        durationMonths: jobForm.durationMonths ? Number(jobForm.durationMonths) : undefined,
        vacancies: Number(jobForm.vacancies),
      });
      setMessage("Job posted successfully!");
      setJobForm({ ...emptyJobForm, workshopName: user?.employerProfile?.workshopName || "" });
      loadJobs();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to post job");
    } finally {
      setPosting(false);
    }
  };

  const handleCloseJob = async (jobId) => {
    try {
      await api.delete(`/employers/jobs/${jobId}`);
      loadJobs();
    } catch (err) {
      // ignore
    }
  };

  const viewApplications = async (jobId) => {
    setSelectedJobId(jobId);
    setLoadingApps(true);
    try {
      const { data } = await api.get(`/employers/jobs/${jobId}/applications`);
      setApplications(data.applications);
    } catch (err) {
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await api.put(`/employers/applications/${applicationId}/status`, { status });
      viewApplications(selectedJobId);
    } catch (err) {
      // ignore
    }
  };

  if (user && !user.isApproved) {
    return (
      <div className="page container">
        <h1>Employer Panel</h1>
        <div className="alert alert-error">
          Your workshop account is pending admin approval. You'll be able to post jobs once an admin
          approves your registration.
        </div>
      </div>
    );
  }

  return (
    <div className="page container">
      <h1>Employer Panel</h1>
      <p style={{ color: "var(--steel-700)" }}>{user?.employerProfile?.workshopName}</p>

      <div className="tabs">
        <div className={`tab ${tab === "jobs" ? "active" : ""}`} onClick={() => setTab("jobs")}>
          My Job Postings
        </div>
        <div className={`tab ${tab === "post" ? "active" : ""}`} onClick={() => setTab("post")}>
          Post New Job
        </div>
      </div>

      {tab === "jobs" && (
        <>
          {loadingJobs ? (
            <p>Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <h3>No jobs posted yet</h3>
              <p>Use the "Post New Job" tab to create your first apprenticeship listing.</p>
            </div>
          ) : (
            <div className="grid grid-2">
              {jobs.map((job) => (
                <div className="card" key={job._id}>
                  <span className={`badge ${job.status === "active" ? "badge-approved" : "badge-withdrawn"}`}>{job.status}</span>
                  <h3 style={{ marginTop: "0.5rem" }}>{job.title}</h3>
                  <p>{job.tradeSkill} &middot; {job.location}</p>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                    <button className="btn btn-secondary" style={{ fontSize: "0.85rem" }} onClick={() => viewApplications(job._id)}>
                      View Applications
                    </button>
                    {job.status === "active" && (
                      <button className="btn btn-danger" style={{ fontSize: "0.85rem" }} onClick={() => handleCloseJob(job._id)}>
                        Close Job
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedJobId && (
            <div style={{ marginTop: "2rem" }}>
              <h2>Applications</h2>
              {loadingApps ? (
                <p>Loading applications...</p>
              ) : applications.length === 0 ? (
                <p>No applications received for this job yet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Trade Skills</th>
                      <th>Institute</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app._id}>
                        <td>{app.student?.name}</td>
                        <td>{app.student?.studentProfile?.tradeSkills?.join(", ")}</td>
                        <td>{app.student?.studentProfile?.itiInstituteName}</td>
                        <td>{app.student?.phone || app.student?.email}</td>
                        <td>
                          <span className={`badge badge-${app.status}`}>{app.status}</span>
                        </td>
                        <td>
                          <select value={app.status} onChange={(e) => updateStatus(app._id, e.target.value)}>
                            <option value="applied">Applied</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {tab === "post" && (
        <form onSubmit={handlePostJob} className="card">
          {message && <div className={message.includes("success") ? "alert alert-success" : "alert alert-error"}>{message}</div>}

          <div className="form-group">
            <label htmlFor="title">Job Title</label>
            <input id="title" required value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label htmlFor="tradeSkill">Trade Skill Required</label>
              <input id="tradeSkill" required value={jobForm.tradeSkill} onChange={(e) => setJobForm({ ...jobForm, tradeSkill: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="jobType">Job Type</label>
              <select id="jobType" value={jobForm.jobType} onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}>
                <option>Apprenticeship</option>
                <option>Full-Time</option>
                <option>Part-Time</option>
                <option>Contract</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="workshopName">Workshop / Factory Name</label>
              <input id="workshopName" required value={jobForm.workshopName} onChange={(e) => setJobForm({ ...jobForm, workshopName: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input id="location" required value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="stipendOrSalary">Stipend / Salary</label>
              <input
                id="stipendOrSalary"
                placeholder="Rs. 9,000 - 11,000 per month"
                value={jobForm.stipendOrSalary}
                onChange={(e) => setJobForm({ ...jobForm, stipendOrSalary: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="durationMonths">Duration (months)</label>
              <input
                id="durationMonths"
                type="number"
                min={0}
                value={jobForm.durationMonths}
                onChange={(e) => setJobForm({ ...jobForm, durationMonths: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="vacancies">Vacancies</label>
              <input
                id="vacancies"
                type="number"
                min={1}
                value={jobForm.vacancies}
                onChange={(e) => setJobForm({ ...jobForm, vacancies: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description</label>
            <textarea id="description" rows={4} required value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} />
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requirements</label>
            <textarea id="requirements" rows={3} value={jobForm.requirements} onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })} />
          </div>

          <button className="btn btn-primary" type="submit" disabled={posting}>
            {posting ? "Posting..." : "Post Job"}
          </button>
        </form>
      )}
    </div>
  );
}
