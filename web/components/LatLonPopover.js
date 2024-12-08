import React, { useEffect, useState } from "react";
import { toLonLat } from "ol/proj.js";

function LatLonLogger({ map }) {
    const [weatherData, setWeatherData] = useState(null);

    // Function to fetch weather data
    const fetchWeatherData = async (lat, lon) => {
        try {
            const response = await fetch(
                `http://localhost:8443/weather?lat=${lat}&lon=${lon}&tz=Asia/Kolkata`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch weather data");
            }
            const data = await response.json();
            setWeatherData(data); // Save the fetched data to state
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    };

    useEffect(() => {
        if (!map) {
            console.error("Map instance is not available.");
            return;
        }
        console.log("map instance available");

        // Map click handler to log lat/lon and fetch weather data
        map.on("click", function (evt) {
            const coordinate = evt.coordinate;
            const [lon, lat] = toLonLat(coordinate); // Convert coordinate to longitude and latitude
            console.log(`Clicked Location: Latitude ${lat}, Longitude ${lon}`);

            // Call the function to fetch weather data
            fetchWeatherData(lat, lon);
        });

        // Cleanup on component unmount
        return () => {
            map.un("click", () => {});
        };
    }, [map]);

    // Helper function to group data by date
    const groupDataByDate = (data) => {
        return data.reduce((acc, entry) => {
            const [date, time] = entry.time.split(" ");
            if (!acc[date]) acc[date] = [];
            acc[date].push({ ...entry, time });
            return acc;
        }, {});
    };

    // Render grouped weather data
    const renderWeatherData = () => {
        if (!weatherData || !weatherData.data) return null;

        const groupedData = groupDataByDate(weatherData.data);

        return Object.keys(groupedData).map((date) => (
            <div key={date} style={{ marginBottom: "20px" }}>
                <h3 style={{ textDecoration: "underline" }}>{date}</h3>
                <table border="1" cellPadding="5" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Temperature (°C)</th>
                            <th>Pressure (Pa)</th>
                            <th>Humidity (%)</th>
                            <th>Rain (mm)</th>
                            <th>Wind Speed (m/s)</th>
                            <th>Wind Direction (°)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedData[date].map((entry, idx) => (
                            <tr key={idx}>
                                <td>{entry.time}</td>
                                <td>{entry.t2}</td>
                                <td>{entry.psfc}</td>
                                <td>{entry.rh2}</td>
                                <td>{(+entry.rainc + +entry.rainnc).toFixed(2)}</td>
                                <td>{entry.ws10}</td>
                                <td>{entry.wd10}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ));
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Weather Data</h1>
            {weatherData ? (
                <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px", maxWidth: "800px" }}>
                    {renderWeatherData()}
                </div>
            ) : (
                <p>Click on the map to get weather data for that location.</p>
            )}
        </div>
    );
}

export default LatLonLogger;
