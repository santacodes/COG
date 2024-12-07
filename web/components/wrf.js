import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { noSSR } from "next/dynamic";

function renderChart(label, data, times, chartId) {
  const ctx = document.getElementById(chartId).getContext("2d");
  new Chart(ctx, {
    type: label === "Precipitation" ? "bar" : "line", // Precipitation uses bar chart, others use line chart
    data: {
      labels: times,
      datasets: [
        {
          label: label,
          data: data,
          borderColor: "rgba(75, 192, 192, 1)", // Dynamic color can be set based on label
          backgroundColor:
            label === "Precipitation"
              ? "rgba(255, 99, 132, 0.2)"
              : "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
      },
    },
  });

  // Render each chart separately
}

let chart = null;
function WeatherChart({ lat, lon }) {
  const chartRef = useRef(null);
  //const ctx = chartRef.current.getContext("2d");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8443/weather?lat=22.065278067765835&lon=80.46386718750001`
        );
        const apiData = await response.json();
        console.log("this is the data", apiData);
        if (chart) {
          chart.destroy();
        } else {
          const times = apiData.data.map((entry) => entry.time);
          renderChart(
            "Temperature (°C)",
            apiData.data.map((entry) => parseFloat(entry.t2)),
            times,
            "tempChart"
          );
          renderChart(
            "Relative Humidity (%)",
            apiData.data.map((entry) => parseFloat(entry.rh2)),
            times,
            "humidityChart"
          );
          renderChart(
            "Surface Pressure (hPa)",
            apiData.data.map((entry) =>
              (parseFloat(entry.psfc) / 100).toFixed(2)
            ),
            times,
            "pressureChart"
          );
          renderChart(
            "Wind Speed (m/s)",
            apiData.data.map((entry) => parseFloat(entry.ws10)),
            times,
            "windChart"
          );
          renderChart(
            "Precipitation (mm)",
            apiData.data.map((entry) => parseFloat(entry.rainnc)),
            times,
            "precipChart"
          );
        }
        await renderWeatherCharts(apiData);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };
    fetchData();
  }, [lat, lon]);
  
  return (
    <div style={{ width: "80%", margin: "auto" }}>
      <canvas ref={chartRef}></canvas>
      <canvas id="tempChart" width="800" height="400"></canvas>
      <canvas id="humidityChart" width="800" height="400"></canvas>
      <canvas id="pressureChart" width="800" height="400"></canvas>
      <canvas id="windChart" width="800" height="400"></canvas>
      <canvas id="precipChart" width="800" height="400"></canvas>
    </div>
  );
}

export default WeatherChart;
