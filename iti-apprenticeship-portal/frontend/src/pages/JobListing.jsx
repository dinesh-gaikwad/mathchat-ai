import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axiosConfig";
import JobCard from "../components/JobCard";

export default function JobListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [tradeSkill, setTradeSkill] = useState(searchParams.get("tradeSkill") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  const fetchJobs = useCallback(async (params, pageNum = 1) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/jobs", {
        params: { ...params, page: pageNum, limit: 9 },
      });
      setJobs(data.jobs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs({ keyword, tradeSkill, location }, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ keyword, tradeSkill, location });
    fetchJobs({ keyword, tradeSkill, location }, 1);
  };

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    fetchJobs({ keyword, tradeSkill, location }, p);
  };

  return (
    <div className="page container">
      <h1>Browse Trade Jobs &amp; Apprenticeships</h1>

      <form onSubmit={handleSearch} className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="grid grid-2">
          <div className="form-group">
            <label htmlFor="keyword">Keyword</label>
            <input id="keyword" placeholder="Job title, workshop..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="tradeSkill">Trade Skill</label>
            <input id="tradeSkill" placeholder="Electrician, Welder..." value={tradeSkill} onChange={(e) => setTradeSkill(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input id="location" placeholder="City or state" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary" type="submit">
          Search Jobs
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <h3>No jobs match your search</h3>
          <p>Try clearing filters or searching a different trade skill.</p>
        </div>
      ) : (
        <>
          <p style={{ color: "var(--steel-700)", marginBottom: "1rem" }}>{total} job(s) found</p>
          <div className="grid grid-2">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem", justifyContent: "center" }}>
              <button className="btn btn-outline" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
                Previous
              </button>
              <span style={{ alignSelf: "center" }}>
                Page {page} of {totalPages}
              </span>
              <button className="btn btn-outline" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
