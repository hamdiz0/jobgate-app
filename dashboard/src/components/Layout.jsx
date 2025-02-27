import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./layout.css";

const Layout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    // Clear user session data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to the login page
    navigate("/login");
  };

  return (
    <div className="layout">
      <nav className="side-nav">
        <div className="sticky">
          <div className="user-info">
            {user ? (
              <>
                <img
                  src="assets/user-icon.jpg"
                  alt="User Icon"
                  className="user-icon"
                />
                <span>
                  {user.name} ({user.role})
                </span>
              </>
            ) : (
              <span>No user connected</span>
            )}
          </div>
          <ul>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/users">Users</Link>
            </li>
            <li>
              <Link to="/places">Places</Link>
            </li>
          </ul>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;