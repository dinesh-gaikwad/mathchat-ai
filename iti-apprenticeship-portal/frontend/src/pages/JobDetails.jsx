import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data.job);
      } catch (err) {
        setError(err.response?.data?.message || "Job not found");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApplyClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/jobs/${id}/apply`);
  };

  if (loading) return <div className="page container">Loading job details...</div>;
  if (error) return <div className="page container"><div className="alert alert-error">{error}</div></div>;
  if (!job) return null;

  return (
    <div className="page container" style={{ maxWidth: 760 }}>
      <Link to="/jobs">&larr; Back to job listings</Link>
      <div className="card" style={{ marginTop: "1rem" }}>
        <span className="badge badge-shortlisted">{job.tradeSkill}</span>
        <h1 style={{ marginTop: "0.6rem" }}>{job.title}</h1>
        <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>{job.workshopName}</p>
        <p>📍 {job.location} &nbsp;|&nbsp; {job.jobType}</p>
        {job.stipendOrSalary && (
          <p style={{ color: "var(--safety-700)", fontWeight: 600 }}>{job.stipendOrSalary}</p>
        )}
        {job.durationMonths && <p>Duration: {job.durationMonths} months</p>}
        <p>Vacancies: {job.vacancies}</p>

        <h3 style={{ marginTop: "1.5rem" }}>Job Description</h3>
        <p>{job.description}</p>

        {job.requirements && (
          <>
            <h3>Requirements</h3>
            <p>{job.requirements}</p>
          </>
        )}

        {job.additionalSkills?.length > 0 && (
          <>
            <h3>Additional Skills</h3>
            <p>{job.additionalSkills.join(", ")}</p>
          </>
        )}

        <h3 style={{ marginTop: "1.5rem" }}>About the Employer</h3>
        <p>{job.employer?.employerProfile?.companyDescription || "No additional company description provided."}</p>

        {(!user || user.role === "student") && (
          <button className="btn btn-primary" style={{ marginTop: "1.5rem" }} onClick={handleApplyClick}>
            Apply for this Job
          </button>
        )}
      </div>
    </div>
  );
}
