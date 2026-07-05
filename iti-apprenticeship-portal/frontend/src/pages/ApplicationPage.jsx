import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";

export default function ApplicationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [coverNote, setCoverNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/students/apply/${id}`, { coverNote });
      setSuccess("Application submitted successfully!");
      setTimeout(() => navigate("/student/dashboard"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page container">Loading...</div>;
  if (!job) return <div className="page container"><div className="alert alert-error">{error}</div></div>;

  return (
    <div className="page container" style={{ maxWidth: 560 }}>
      <Link to={`/jobs/${id}`}>&larr; Back to job details</Link>
      <h1 style={{ marginTop: "0.75rem" }}>Apply: {job.title}</h1>
      <p style={{ color: "var(--steel-700)" }}>{job.workshopName} &middot; {job.location}</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label htmlFor="coverNote">Cover Note (optional)</label>
          <textarea
            id="coverNote"
            rows={6}
            placeholder="Tell the employer why you're a good fit for this role..."
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: "100%" }}>
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
