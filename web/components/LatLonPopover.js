import React, { useEffect, useState } from "react";
import { toLonLat } from "ol/proj.js";

function LatLonLogger({ map }) {
    const [weatherData, setWeatherData] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    const fetchWeatherData = async (lat, lon) => {
        try {
            const response = await fetch(
                `http://localhost:8443/weather?lat=${lat}&lon=${lon}&tz=Asia/Kolkata`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch weather data");
            }
            const data = await response.json();
            setWeatherData(data);
            setShowPopup(true); // Show popup when data is fetched
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

        map.on("click", function (evt) {
            const coordinate = evt.coordinate;
            const [lon, lat] = toLonLat(coordinate);
            console.log(`Clicked Location: Latitude ${lat}, Longitude ${lon}`);
            fetchWeatherData(lat, lon);
        });

        return () => {
            map.un("click", () => {});
        };
    }, [map]);

    const groupDataByDate = (data) => {
        return data.reduce((acc, entry) => {
            const [date, time] = entry.time.split(" ");
            if (!acc[date]) acc[date] = [];
            acc[date].push({ ...entry, time });
            return acc;
        }, {});
    };

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

    const handleOutsideClick = (e) => {
        if (e.target.id === "popup-overlay") {
            setShowPopup(false);
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Weather Data</h1>
            <p>Click on the map to get weather data for that location.</p>

            {showPopup && (
                <div
                    id="popup-overlay"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                    onClick={handleOutsideClick}
                >
                    <div
                        style={{
                            backgroundColor: "#fff",
                            padding: "20px",
                            borderRadius: "10px",
                            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                            maxWidth: "800px",
                            width: "90%",
                            overflowY: "auto",
                            maxHeight: "80%",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ textAlign: "center" }}>Weather Data</h2>
                        {renderWeatherData()}
                        <button
                            onClick={() => setShowPopup(false)}
                            style={{
                                display: "block",
                                margin: "20px auto",
                                padding: "10px 20px",
                                backgroundColor: "#007bff",
                                color: "#fff",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LatLonLogger;
