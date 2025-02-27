import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./loginPage.css";
import apiClient from "../api/apiClient";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/users/login", {
        email,
        password,
      });

      console.log(process.env)
      if (response.data && response.data.token) {
        const user = response.data.data.user;
        if (user.role !== "admin" || user.role !== "sous-admin") {
          // Save the token and user in local storage
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(user)); // Store user object

          // Redirect to the dashboard
          navigate("/dashboard");
        } else {
          alert("You are not an admin or sous-admin");
        }
      } else {
        alert("Login failed. Please check your credentials.");
      }
    } catch (error) {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
