import React from "react";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.inner}>
        <p style={styles.text}>
          ITI Apprenticeship &amp; Trade Job Matching Portal &mdash; connecting vocational
          graduates with workshops and factories.
        </p>
        <p style={styles.small}>
          Built for Unified Mentor &middot; Reference: National Apprenticeship Promotion Scheme
        </p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: "var(--steel-900)",
    color: "#aebfc4",
    padding: "1.5rem 0",
    marginTop: "2rem",
  },
  inner: {
    textAlign: "center",
  },
  text: {
    margin: 0,
    fontSize: "0.9rem",
  },
  small: {
    margin: "0.3rem 0 0",
    fontSize: "0.75rem",
    opacity: 0.7,
  },
};
