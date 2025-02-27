import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import apiClient from "../api/apiClient"; // Import the centralized apiClient
import "./../charConfig.js";

const ChartComponent = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const token = localStorage.getItem("token");

  const yearHandler = (e) => {
    setYear(e.target.value);
  };

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const response = await apiClient.get(
          `/places/monthly-plan/${year}`, // Use relative path for internal/external API handling
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMonthlyData(response.data.data.plan);
      } catch (error) {
        console.error("Error fetching monthly data:", error);
      }
    };

    fetchMonthlyData();
  }, [token, year]);

  const chartData = {
    labels: monthlyData.map((item) => `Month ${item.month}`),
    datasets: [
      {
        label: "r+1",
        data: monthlyData.map(
          (item) =>
            item.data.find((d) => d.type === "r+1")?.numberOfPlacesStarts || 0
        ),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "r+2",
        data: monthlyData.map(
          (item) =>
            item.data.find((d) => d.type === "r+2")?.numberOfPlacesStarts || 0
        ),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "r+3",
        data: monthlyData.map(
          (item) =>
            item.data.find((d) => d.type === "r+3")?.numberOfPlacesStarts || 0
        ),
        backgroundColor: "rgba(255, 206, 86, 0.6)",
      },
      {
        label: "Terrain Vide",
        data: monthlyData.map(
          (item) =>
            item.data.find((d) => d.type === "terrain vide")
              ?.numberOfPlacesStarts || 0
        ),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  return (
    <div>
      <h2>Monthly Plan for {year}</h2>
      <h3>Select year</h3>
      <select onChange={yearHandler} value={year}>
        <option title="2023" value="2023">
          2023
        </option>
        <option label="2024" value="2024">
          2024
        </option>
        <option label="2025" value="2025">
          2025
        </option>
      </select>
      <Bar data={chartData} />
    </div>
  );
};

export default ChartComponent;
