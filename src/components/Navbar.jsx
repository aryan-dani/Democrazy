import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getStoredTheme, setStoredTheme } from "../utils/themeStorage";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const [theme, setTheme] = useState(() => getStoredTheme());
  const { user, authEnabled, busy, signInGoogle, signOutUser } = useAuth();

  useEffect(() => {
    setStoredTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  return (
    <nav className="navbar" id="main-navbar" aria-label="Primary">
      <div className="navbar-brand">
        <NavLink to="/" className="navbar-logo">
          <span className="material-symbols-outlined logo-icon" aria-hidden>
            how_to_vote
          </span>
          <span className="logo-text">Democrazy</span>
        </NavLink>
      </div>
      <div className="navbar-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          id="nav-dashboard"
        >
          <span className="material-symbols-outlined" aria-hidden>
            dashboard
          </span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/simulation"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          id="nav-simulation"
        >
          <span className="material-symbols-outlined" aria-hidden>
            play_circle
          </span>
          <span>Simulations</span>
        </NavLink>
        <NavLink
          to="/timeline"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          id="nav-timeline"
        >
          <span className="material-symbols-outlined" aria-hidden>
            timeline
          </span>
          <span>Timeline</span>
        </NavLink>
        <NavLink
          to="/quiz"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          id="nav-quiz"
        >
          <span className="material-symbols-outlined" aria-hidden>
            quiz
          </span>
          <span>Quizzes</span>
        </NavLink>
      </div>
      <div className="navbar-actions">
        {authEnabled ? (
          <div className="navbar-google">
            {busy ? (
              <span className="navbar-auth-hint" aria-live="polite" role="status">
                Signing in…
              </span>
            ) : user ? (
              <button
                type="button"
                className="google-sync-btn"
                onClick={() => signOutUser()}
                title={user.email ?? ""}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  logout
                </span>
                <span>Sign out</span>
              </button>
            ) : (
              <button
                type="button"
                className="google-sync-btn primary"
                onClick={() => signInGoogle()}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  account_circle
                </span>
                <span>Google sync</span>
              </button>
            )}
          </div>
        ) : null}
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          <span className="material-symbols-outlined" aria-hidden>
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>
        <div className="navbar-phase">
          <span className="phase-label">Stack</span>
          <span className="phase-value">Script + Gemini</span>
        </div>
      </div>
    </nav>
  );
}
