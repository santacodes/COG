import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamically importing components without SSR
const LeafletMap = dynamic(() => import("../components/insat"), { ssr: false });
const SidePane = dynamic(() => import("../components/sidePane/SidePane"), { ssr: false });

const MapPage = () => {
  // return <LeafletMap />;


  const [isSidePaneOpen, setIsSidePaneOpen] = useState(true);

  const toggleSidePane = () => {
    setIsSidePaneOpen(!isSidePaneOpen);
  };

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
    </div>
  );

};

export default MapPage;
