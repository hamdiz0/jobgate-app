import React from "react";
import ChartComponent from "./ChartComponent";
import StatsComponent from "./StatsComponent";
import "./dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-charts">
        <ChartComponent />
        <StatsComponent />
      </div>
    </div>
  );
};

export default Dashboard;
