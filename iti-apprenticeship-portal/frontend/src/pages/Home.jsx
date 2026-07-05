import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page">
      <section style={styles.hero}>
        <div className="container">
          <h1 style={styles.heroTitle}>From ITI Certificate to Workshop Floor</h1>
          <p style={styles.heroSub}>
            The centralized portal connecting ITI &amp; diploma graduates with apprenticeships
            and trade jobs at workshops, factories and manufacturing units.
          </p>
          <div style={styles.heroButtons}>
            <Link to="/jobs" className="btn btn-primary">
              Browse Trade Jobs
            </Link>
            <Link to="/register" className="btn btn-outline" style={styles.outlineOnDark}>
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      <section className="container" style={{ marginTop: "3rem" }}>
        <h2>Popular Trades</h2>
        <div className="grid grid-2" style={{ marginTop: "1rem" }}>
          {["Electrician", "Welder", "Fitter", "Machinist", "Mechanic", "Technician"].map((trade) => (
            <div key={trade} className="card">
              <h3 style={{ fontSize: "1.1rem" }}>{trade}</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--steel-700)" }}>
                Find apprenticeships and trade jobs matched to the {trade.toLowerCase()} skill set.
              </p>
              <Link to={`/jobs?tradeSkill=${trade}`}>See openings &rarr;</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container" style={{ marginTop: "3rem" }}>
        <h2>How It Works</h2>
        <div className="grid grid-2" style={{ marginTop: "1rem" }}>
          <div className="card">
            <h3 style={{ fontSize: "1.05rem" }}>For Students</h3>
            <p>Create a trade-skill profile, search jobs by skill and location, apply in a click, and track your application status.</p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: "1.05rem" }}>For Employers</h3>
            <p>Register your workshop or factory, post apprenticeship openings, review applications and shortlist skilled candidates.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    background: "linear-gradient(135deg, var(--steel-900), var(--steel-700))",
    color: "#fff",
    padding: "4rem 0",
  },
  heroTitle: {
    color: "#fff",
    fontSize: "2.6rem",
    maxWidth: 700,
  },
  heroSub: {
    fontSize: "1.05rem",
    maxWidth: 600,
    color: "#d7e0e3",
    marginTop: "1rem",
  },
  heroButtons: {
    marginTop: "1.75rem",
    display: "flex",
    gap: "1rem",
  },
  outlineOnDark: {
    color: "#fff",
    borderColor: "#fff",
  },
};
