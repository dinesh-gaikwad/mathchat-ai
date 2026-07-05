import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function AdminPanel() {
  const [tab, setTab] = useState("analytics");
  const [analytics, setAnalytics] = useState(null);
  const [employers, setEmployers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    const { data } = await api.get("/admin/analytics");
    setAnalytics(data);
  };

  const loadEmployers = async () => {
    const { data } = await api.get("/admin/users", { params: { role: "employer" } });
    setEmployers(data.users);
  };

  const loadJobs = async () => {
    const { data } = await api.get("/admin/jobs");
    setJobs(data.jobs);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([loadAnalytics(), loadEmployers(), loadJobs()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approveEmployer = async (id) => {
    await api.put(`/admin/employers/${id}/approve`);
    loadEmployers();
    loadAnalytics();
  };

  const toggleUserStatus = async (id, isActive) => {
    await api.put(`/admin/users/${id}/status`, { isActive: !isActive });
    loadEmployers();
  };

  const flagJob = async (id) => {
    await api.put(`/admin/jobs/${id}/flag`);
    loadJobs();
  };

  if (loading) return <div className="page container">Loading admin dashboard...</div>;

  return (
    <div className="page container">
      <h1>Admin Panel</h1>

      <div className="tabs">
        <div className={`tab ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>
          Analytics
        </div>
        <div className={`tab ${tab === "employers" ? "active" : ""}`} onClick={() => setTab("employers")}>
          Employers
        </div>
        <div className={`tab ${tab === "jobs" ? "active" : ""}`} onClick={() => setTab("jobs")}>
          Job Moderation
        </div>
      </div>

      {tab === "analytics" && analytics && (
        <div className="grid grid-2">
          <div className="stat-card">
            <div className="stat-value">{analytics.totalStudents}</div>
            <div className="stat-label">Registered Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{analytics.totalEmployers}</div>
            <div className="stat-label">Registered Employers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{analytics.pendingEmployers}</div>
            <div className="stat-label">Pending Employer Approvals</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{analytics.activeJobs} / {analytics.totalJobs}</div>
            <div className="stat-label">Active / Total Job Postings</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{analytics.totalApplications}</div>
            <div className="stat-label">Total Applications</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{analytics.successfulPlacements}</div>
            <div className="stat-label">Successful Placements</div>
          </div>
        </div>
      )}

      {tab === "employers" && (
        <table>
          <thead>
            <tr>
              <th>Workshop Name</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Approval</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employers.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.employerProfile?.workshopName || emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.location}</td>
                <td>
                  <span className={`badge ${emp.isApproved ? "badge-approved" : "badge-pending"}`}>
                    {emp.isApproved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td>
                  <span className={`badge ${emp.isActive ? "badge-approved" : "badge-withdrawn"}`}>
                    {emp.isActive ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td style={{ display: "flex", gap: "0.4rem" }}>
                  {!emp.isApproved && (
                    <button className="btn btn-primary" style={{ fontSize: "0.8rem" }} onClick={() => approveEmployer(emp._id)}>
                      Approve
                    </button>
                  )}
                  <button className="btn btn-outline" style={{ fontSize: "0.8rem" }} onClick={() => toggleUserStatus(emp._id, emp.isActive)}>
                    {emp.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "jobs" && (
        <table>
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Employer</th>
              <th>Trade Skill</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job._id}>
                <td>{job.title}</td>
                <td>{job.employer?.employerProfile?.workshopName || job.employer?.name}</td>
                <td>{job.tradeSkill}</td>
                <td>
                  <span className={`badge ${job.status === "flagged" ? "badge-rejected" : "badge-approved"}`}>{job.status}</span>
                </td>
                <td>
                  {job.status !== "flagged" && (
                    <button className="btn btn-danger" style={{ fontSize: "0.8rem" }} onClick={() => flagJob(job._id)}>
                      Flag as Fraudulent
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
