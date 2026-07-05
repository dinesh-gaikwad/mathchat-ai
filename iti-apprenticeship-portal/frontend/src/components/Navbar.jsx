import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dashboardLink =
    user?.role === "student"
      ? "/student/dashboard"
      : user?.role === "employer"
      ? "/employer/dashboard"
      : user?.role === "admin"
      ? "/admin/dashboard"
      : "/";

  return (
    <header style={styles.header}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>
          ITI TRADE PORTAL
        </Link>
        <nav style={styles.nav}>
          <Link to="/jobs" style={styles.link}>
            Browse Jobs
          </Link>
          {!user && (
            <>
              <Link to="/login" style={styles.link}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary" style={styles.cta}>
                Register
              </Link>
            </>
          )}
          {user && (
            <>
              <Link to={dashboardLink} style={styles.link}>
                Dashboard
              </Link>
              <span style={styles.username}>Hi, {user.name.split(" ")[0]}</span>
              <button className="btn btn-outline" style={styles.logoutBtn} onClick={handleLogout}>
                Log Out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: "var(--steel-900)",
    height: 64,
    display: "flex",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "var(--shadow-md)",
  },
  inner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  logo: {
    fontFamily: "var(--font-display)",
    color: "#fff",
    fontSize: "1.4rem",
    letterSpacing: "0.03em",
    fontWeight: 700,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
  },
  link: {
    color: "#d7e0e3",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  cta: {
    padding: "0.5rem 1rem",
  },
  username: {
    color: "#d7e0e3",
    fontSize: "0.85rem",
  },
  logoutBtn: {
    color: "#fff",
    borderColor: "#fff",
    padding: "0.4rem 0.9rem",
  },
};
