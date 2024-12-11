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

const MapPage = () => {
  // return <LeafletMap />;

  const [isSidePaneOpen, setIsSidePaneOpen] = useState(false);

  const toggleSidePane = () => {
    setIsSidePaneOpen(!isSidePaneOpen);
  };

  const lat = 21.166483858206583; 
  const lon = 79.40917968750001; 
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <LeafletMap />
      {/* Toggle Button */}
      {/* <button
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
      > */}
      <div className="absolute top-0 left-0 z-50 flex items-start h-full">
  {isSidePaneOpen && (
    <div className="h-full">
      <SidePane />
    </div>
  )}
  <button
    className={`flex items-center justify-center text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 rounded-full p-1 m-2 transition-all ${
      isSidePaneOpen ? "ml-2" : "ml-1"
    }`}
    onClick={toggleSidePane}
  >
    {isSidePaneOpen ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5L15.75 12l-7.5 7.5" />
      </svg>
    )}
  </button>
</div>
<div>
  <h1>Weather Chart</h1>
  <h1 className="text-3xl font-bold underline"></h1>
  <WeatherChart lat={lat} lon={lon} />
</div>
</div>
  );
};

export default MapPage;
