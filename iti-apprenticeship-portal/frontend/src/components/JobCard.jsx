import React from "react";
import { Link } from "react-router-dom";

export default function JobCard({ job }) {
  return (
    <div className="card">
      <span className="badge badge-shortlisted">{job.tradeSkill}</span>
      <h3 style={{ marginTop: "0.6rem" }}>{job.title}</h3>
      <p style={{ margin: "0.2rem 0", fontWeight: 600 }}>{job.workshopName}</p>
      <p style={{ margin: "0.2rem 0", color: "var(--steel-700)" }}>📍 {job.location}</p>
      <p style={{ margin: "0.4rem 0", fontSize: "0.9rem" }}>{job.jobType}</p>
      {job.stipendOrSalary && (
        <p style={{ margin: "0.2rem 0", fontSize: "0.9rem", color: "var(--safety-700)", fontWeight: 600 }}>
          {job.stipendOrSalary}
        </p>
      )}
      <Link to={`/jobs/${job._id}`} className="btn btn-secondary" style={{ marginTop: "0.75rem", display: "inline-block" }}>
        View Details
      </Link>
    </div>
  );
}
