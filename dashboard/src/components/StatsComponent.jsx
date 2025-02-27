import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import apiClient from "../api/apiClient"; // Import the centralized apiClient
import "./../charConfig";
import "./chartComponent.css";

const StatsComponent = () => {
  const [placeStats, setPlaceStats] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPlaceStats = async () => {
      try {
        const response = await apiClient.get(
          "/places/places-stats", // Use relative path for internal/external API handling
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPlaceStats(response.data.data.stats);
      } catch (error) {
        console.error("Error fetching place stats:", error);
      }
    };

    fetchPlaceStats();
  }, [token]);

  if (!placeStats.length) {
    return <div>Loading stats...</div>;
  }

  const statsData = {
    labels: placeStats.map((stat) => stat._id),
    datasets: [
      {
        label: "Number of Places",
        data: placeStats.map((stat) => stat.numberOfPlaces),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  return (
    <div className="stats-container">
      <h2>Place Stats</h2>
      <Bar data={statsData} />
      <table className="stats-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Number of Places</th>
            <th>Dates</th>
            <th>Created By</th>
          </tr>
        </thead>
        <tbody>
          {placeStats.map((stat) => (
            <tr key={stat._id}>
              <td>{stat._id}</td>
              <td>{stat.numberOfPlaces}</td>
              <td>
                <ul>
                  {(stat.dates || []).map((date, index) => (
                    <li key={index}>{new Date(date).toLocaleString()}</li>
                  ))}
                </ul>
              </td>
              <td>
                <ul>
                  {(stat.createdBy || []).map((creator, index) => (
                    <li key={index}>
                      {creator ? `${creator.name} (${creator.email})` : "Unknown"}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatsComponent;
