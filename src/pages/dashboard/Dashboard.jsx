import "./dashboard.css";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="dashboard-container">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="logo">eSign</h2>

        <nav>
          <a
            className={isActive("/dashboard/home") ? "active" : ""}
            onClick={() => navigate("/dashboard/home")}
          >
            Dashboard
          </a>

          <a
            className={isActive("/dashboard/requestsign") ? "active" : ""}
            onClick={() => navigate("/dashboard/requestsign")}
          >
            Create Sign Request
          </a>

          <a
            className={isActive("/dashboard/view-signed") ? "active" : ""}
            onClick={() => navigate("/dashboard/view-signed")}
          >
            View Signed Documents
          </a>

          <a
            className={isActive("/dashboard/customers") ? "active" : ""}
            onClick={() => navigate("/dashboard/customers")}
          >
            Manage Customers
          </a>
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="main">

        {/* TOP BAR */}
        <header className="topbar">
          <div>
            <h3>Dashboard</h3>
            <span className="subtitle">Welcome back</span>
          </div>

          <div className="user-controls">
            <button
              className="user-button"
              title={username || "User"}
              aria-label="User menu"
            >
              <span className="user-avatar">{(username || "")[0]?.toUpperCase()}</span>
            </button>

            <button className="header-logout" onClick={handleLogout} title="Sign out">
              Sign out
            </button>
          </div>
        </header>

        {/* 🔥 DYNAMIC CONTENT LOADS HERE */}
        <section className="content">
          <Outlet />
        </section>

      </div>
    </div>
  );
}
