import React, { useEffect, useState } from "react";
import { toLonLat } from "ol/proj.js";

function LatLonLogger({ map }) {
    const [weatherData, setWeatherData] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [confpopup, setConfPopup] = useState(false); // New state for conditional popup

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
            setConfPopup(true); // Enable confirmation popup
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
            <div key={date} className="flex flex-col bg-white p-10 w-full rounded-xl ring-8 ring-white ring-opacity-40">
                <div className="mb-10 w-full">
                    <h3 className="text-center text-lg font-semibold underline mb-4">{date}</h3>
                    <div className="flex flex-col items-center justify-center w-full text-gray-700">
                        <div className="flex flex-col space-y-6 w-full max-w-screen-sm bg-white p-10 rounded-xl ring-8 ring-white ring-opacity-40">
                            <div className="flex justify-between items-center space-x-8 mb-6 w-full">
                                <div className="flex-1 text-center">
                                    <h2 className="font-bold text-lg">Time</h2>
                                </div>
                                <div className="flex-1 text-center">
                                    <h2 className="font-bold text-lg">T2°C</h2>
                                </div>
                                <div className="flex-1 text-center">
                                    <h2 className="font-bold text-lg">PSFC</h2>
                                    Pa
                                </div>
                                <div className="flex-1 text-center">
                                    <h2 className="font-bold text-lg">RH2%</h2>
                                </div>
                                <div className="flex-1 text-center">
                                    <h2 className="font-bold text-lg">Rainmm</h2>
                                </div>
                                <div className="flex-1 text-center">
                                    <h2 className="font-bold text-lg">WS10 m/s</h2>
                                </div>
                                <div className="flex-1 text-center">
                                    <h2 className="font-bold text-lg">WD10°</h2>
                                </div>
                            </div>

                            {groupedData[date].map((entry, idx) => (
                                <div key={idx} className="flex justify-between items-center space-x-4 mb-6">
                                    <div className="w-1/4 text-center">{entry.time}</div>
                                    <div className="w-1/4 text-center">{entry.t2} °C</div>
                                    <div className="w-1/4 text-center">{entry.psfc} Pa</div>
                                    <div className="w-1/4 text-center">{entry.rh2} %</div>
                                    <div className="w-1/4 text-center">
                                        {(+entry.rainc + +entry.rainnc).toFixed(2)} mm
                                        <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 16 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                            <g transform="matrix(1,0,0,1,-4,-2)">
                                                <path d="M17.66,8L12.71,3.06C12.32,2.67 11.69,2.67 11.3,3.06L6.34,8C4.78,9.56 4,11.64 4,13.64C4,15.64 4.78,17.75 6.34,19.31C7.9,20.87 9.95,21.66 12,21.66C14.05,21.66 16.1,20.87 17.66,19.31C19.22,17.75 20,15.64 20,13.64C20,11.64 19.22,9.56 17.66,8ZM6,14C6.01,12 6.62,10.73 7.76,9.6L12,5.27L16.24,9.65C17.38,10.77 17.99,12 18,14C18.016,17.296 14.96,19.809 12,19.74C9.069,19.672 5.982,17.655 6,14Z" style={{ fillRule: "nonzero" }} />
                                            </g>
                                        </svg>
                                    </div>
                                    <div className="w-1/4 text-center">{entry.ws10} m/s</div>
                                    <div className="w-1/4 text-center">{entry.wd10} °</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        ));
    };

    const handleOutsideClick = (e) => {
        if (e.target.id === "popup-overlay") {
            setConfPopup(false); // Disable confirmation popup on outside click
            setShowPopup(false); // Close popup
        }
    };

    const handleInsideClick = (e) => {
        e.stopPropagation(); // Prevent event propagation to the overlay
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
                        onClick={handleInsideClick} // Prevent popup from closing on inside click
                    >
                        <div className="flex flex-col items-center justify-center w-full min-h-screen text-gray-700 p-10 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200">
                            <button
                                onClick={() => {
                                    setConfPopup(false); // Close the confirmation popup
                                    setShowPopup(false); // Close the main popup
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
                            {renderWeatherData()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LatLonLogger;
