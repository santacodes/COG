import dynamic from "next/dynamic";
import { useState } from "react";
import WeatherChart from "../components/wrf";

// Dynamically importing components without SSR
const LeafletMap = dynamic(() => import("../components/insat_L1C"), {
  ssr: false,
});
const SidePane = dynamic(() => import("../components/sidePane/SidePane"), {
  ssr: false,
});

const weatherData = [
  {
    date: "Fri, 22 Jan",
    humidity: "12%",
    temperature: "18° / 32°",
    rainIcon: true,
  },
  {
    date: "Sat, 23 Jan",
    humidity: "0%",
    temperature: "22° / 34°",
    rainIcon: false,
  },
  {
    date: "Sun, 24 Jan",
    humidity: "20%",
    temperature: "21° / 32°",
    rainIcon: true,
  },
  {
    date: "Mon, 25 Jan",
    humidity: "50%",
    temperature: "20° / 30°",
    rainIcon: true,
  },
];

const MapPage = () => {
  // return <LeafletMap />;

  const [isSidePaneOpen, setIsSidePaneOpen] = useState(true);

  const toggleSidePane = () => {
    setIsSidePaneOpen(!isSidePaneOpen);
  };

  const lat = 21.166483858206583;
  const lon = 79.40917968750001;

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <LeafletMap />
      {/* Toggle Button */}
      <button
        onClick={toggleSidePane}
        style={{
          position: "absolute",
          top: "10px",
          left: isSidePaneOpen ? "310px" : "10px", // Adjust position based on pane visibility
          zIndex: 1100,
          padding: "10px 15px",
          background: "#333",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
        }}
      >
        {isSidePaneOpen ? "Close" : "Open"}
      </button>
      {/* SidePane */}
      {isSidePaneOpen && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1000,
            transition: "all 0.3s ease",
          }}
        >
          <SidePane />
        </div>
      )}
      <div>
        <h1>Weather Chart</h1>
        <h1 className="text-3xl font-bold underline">
        </h1>
        <WeatherChart lat={lat} lon={lon} />
      </div>
    </div>
  );
};

export default MapPage;

{/* <div className="flex flex-col items-center justify-center w-full min-h-screen text-gray-700 p-10 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200"> */}
