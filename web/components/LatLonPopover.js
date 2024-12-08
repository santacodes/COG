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
            map.un("click", () => { });
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
                    {/* <tbody>
                        {groupedData[date].map((entry, idx) => (
                            <tr key={idx}>
                                <td colSpan="7">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-lg w-1/4">{entry.date}</span>
                                        <div className="flex items-center justify-center w-1/4">
                                            <span className="font-semibold">{entry.rh2}%</span>
                                            <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 16 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                                <g transform="matrix(1,0,0,1,-4,-2)">
                                                    <path d="M17.66,8L12.71,3.06C12.32,2.67 11.69,2.67 11.3,3.06L6.34,8C4.78,9.56 4,11.64 4,13.64C4,15.64 4.78,17.75 6.34,19.31C7.9,20.87 9.95,21.66 12,21.66C14.05,21.66 16.1,20.87 17.66,19.31C19.22,17.75 20,15.64 20,13.64C20,11.64 19.22,9.56 17.66,8ZM6,14C6.01,12 6.62,10.73 7.76,9.6L12,5.27L16.24,9.65C17.38,10.77 17.99,12 18,14C18.016,17.296 14.96,19.809 12,19.74C9.069,19.672 5.982,17.655 6,14Z" style="fill-rule:nonzero;" />
                                                </g>
                                            </svg>
                                        </div>
                                        <svg className="h-8 w-8 fill-current w-1/4" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                            <path d="M0 0h24v24H0V0z" fill="none" />
                                            <path d="M12.01 6c2.61 0 4.89 1.86 5.4 4.43l.3 1.5 1.52.11c1.56.11 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3h-13c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.95 6 12.01 6m0-2C9.12 4 6.6 5.64 5.35 8.04 2.35 8.36.01 10.91.01 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96C18.68 6.59 15.65 4 12.01 4z" />
                                        </svg>
                                        <span className="font-semibold text-lg w-1/4 text-right">{entry.minTemp}° / {entry.maxTemp}°</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody> */}
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

