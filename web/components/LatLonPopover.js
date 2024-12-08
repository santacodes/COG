import React, { useEffect } from "react";
import { fromLonLat, toLonLat } from "ol/proj.js";
import { MapEvent } from "ol";
import Map from "ol";
import { toStringHDMS } from "ol/coordinate.js";

function LatLonLogger({ map }) {
  useEffect(() => {
    if (!map) {
      console.error("Map instance is not available.");
      return;
    }
    console.log("map instance available");
    // Map click handler to log lat/lon
    map.on("click", function (evt) {
      const coordinate = evt.coordinate;
      const hdms = toStringHDMS(toLonLat(coordinate));
      console.log("this is the click data" + hdms);
    });

    // Cleanup on component unmount
  }, [map]);

  return (
    <div>
      <h1></h1>
    </div>
  ); // This component doesn't render anything
}

export default LatLonLogger;
