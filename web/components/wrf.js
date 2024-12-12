import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function renderChart(label, data, times, chartId) {
  const canvas = document.getElementById(chartId);
  const ctx = canvas.getContext("2d");

  // Check if the canvas size exceeds max size, and adjust it if necessary
  const maxWidth = 800;
  const maxHeight = 400;
  canvas.width = Math.min(canvas.width, maxWidth);
  canvas.height = Math.min(canvas.height, maxHeight);

  new Chart(ctx, {
    type: label === "Precipitation" ? "bar" : "line",
    data: {
      labels: times,
      datasets: [
        {
          label: label,
          data: data,
          borderColor: "rgba(75, 192, 192, 1)",
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
}

let chart = null;
function WeatherChart({ lat, lon }) {
  const chartRef = useRef(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://192.168.189.113:8443/weather?lat=22.065278067765835&lon=80.46386718750001`
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
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };
    fetchData();
  }, [lat, lon]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-7xl mx-auto justify-items-center">
      <canvas
        id="humidityChart"
        className="w-full h-auto max-w-[600px] max-h-[600px]"
      ></canvas>
      <canvas
        id="pressureChart"
        className="w-full h-auto max-w-[600px] max-h-[600px]"
      ></canvas>
      <canvas
        id="tempChart"
        className="w-full h-auto max-w-[600px] max-h-[600px]"
      ></canvas>
      <canvas
        id="windChart"
        className="w-full h-auto max-w-[600px] max-h-[600px]"
      ></canvas>
      <canvas
        id="precipChart"
        className="w-full h-auto max-w-[600px] max-h-[600px]"
      ></canvas>
    </div>

  );
}

export default WeatherChart;
