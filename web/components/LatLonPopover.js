import React, { useEffect, useState } from "react";
import { toLonLat } from "ol/proj.js";
import WeatherChart from "./wrf";

function LatLonLogger({ map }) {
    const [weatherData, setWeatherData] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [confpopup, setConfPopup] = useState(false);
    const [activeTab, setActiveTab] = useState("chart"); // New state for tabs

    const fetchWeatherData = async (lat, lon) => {
        try {
            const response = await fetch(
                `http://192.168.189.113:8443/weather?lat=${lat}&lon=${lon}&tz=Asia/Kolkata`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch weather data");
            }
            const data = await response.json();
            setWeatherData(data);
            setShowPopup(true);
            setConfPopup(true);
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
            map.un("click", () => { });
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
            <div key={date} className="flex flex-col bg-white p-10 w-full rounded-xl ring-8 ring-white ring-opacity-40 my-20">
                <h3 className="text-center text-lg font-semibold underline mb-4">{date}</h3>
                <div className="flex flex-col items-center justify-center w-full text-gray-700">
                    <div className="inline-flex flex-col items-center justify-center space-y-6 bg-white p-10 rounded-xl ring-8 ring-white ring-opacity-40">                        <div className="flex justify-between items-center space-x-20">
                        <div className="flex-1 text-center font-bold">Time</div>
                        <div className="flex-1 text-center font-bold">T2°C</div>
                        <div className="flex-1 text-center font-bold">PSFC</div>
                        <div className="flex-1 text-center font-bold">RH2%</div>
                        <div className="flex-1 text-center font-bold">Rain (mm)</div>
                        <div className="flex-1 text-center font-bold">WS10 (m/s)</div>
                        <div className="flex-1 text-center font-bold">WD10°</div>
                    </div>
                        {groupedData[date].map((entry, idx) => (
                            <div key={idx} className="flex justify-between items-center space-x-20">
                                <div className="text-center">{entry.time}</div>
                                <div className="text-center">{entry.t2}°C</div>
                                <div className="text-center">{entry.psfc}Pa</div>
                                <div className="text-center">{entry.rh2}%</div>
                                <div className="text-center">{(+entry.rainc + +entry.rainnc).toFixed(2)}mm</div>
                                <div className="text-center">{entry.ws10}m/s</div>
                                <div className="text-center">{entry.wd10}°</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ));
    };

    const handleOutsideClick = (e) => {
        if (e.target.id === "popup-overlay") {
            setConfPopup(false);
            setShowPopup(false);
        }
    };

    const handleInsideClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Weather Data</h1>
            <p>Click on the map to get weather data for that location.</p>

            {showPopup && confpopup && (
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
                            position: "relative",
                            backgroundColor: "#fff",
                            borderRadius: "10px",
                            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                            maxWidth: "1200px",
                            width: "90%",
                            overflowY: "auto",
                            maxHeight: "80%",
                        }}
                        onClick={handleInsideClick}
                    >
                        <div className="flex flex-col items-center justify-center w-full min-h-screen text-gray-700 p-10 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200">
                            <button
                                onClick={() => {
                                    setConfPopup(false);
                                    setShowPopup(false);
                                }}
                                style={{
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                    padding: "5px 10px",
                                    backgroundColor: "red",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                            >
                                Close
                            </button>
                            <div className="tabs">
                                <button
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${activeTab === "chart"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 mx-5"
                                        }`}
                                    onClick={() => setActiveTab("chart")}
                                >
                                    Chart
                                </button>
                                <button
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${activeTab === "table"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 mx-5"
                                        }`}
                                    onClick={() => setActiveTab("table")}
                                >
                                    Table
                                </button>

                            </div>
                            <div className="tab-content">
                                {activeTab === "chart" && weatherData && (
                                    <WeatherChart lat={weatherData.lat} lon={weatherData.lon} />
                                )}
                                {activeTab === "table" && renderWeatherData()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LatLonLogger;
