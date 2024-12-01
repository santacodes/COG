import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Function to change the pixel values to color, change this function in accordance with all the bands of INSAT data 
const pixelValuesToColorFn = (values) => {
    const value = values[0]; // Access the single-band value
    if (value === -99.0 || value === null) return null; // Handle nodata values
  
    // Map the value to a grayscale color (0 to 255)
    const intensity = Math.round((value / 255) * 255); // Normalize value to 0-255 range
    return `rgb(${intensity}, ${intensity}, ${intensity})`;
  };
  
const LeafletMap = () => {
  const mapRef = useRef(null); // Reference to hold the map instance

  useEffect(() => {
    if (mapRef.current) {
      return; // Prevent re-initializing the map
    }

    const L = require("leaflet");
    const parseGeoraster = require("georaster");
    const GeoRasterLayer = require("georaster-layer-for-leaflet");

    // Create the map instance and attach it to the ref
    // Create the map instance and attach it to the ref
    const map = L.map("map", {
        maxBounds: [
          [-90, -180], // South-West corner
          [90, 180],   // North-East corner
        ],
        maxBoundsViscosity: 1.0, // Makes panning bounce back at boundaries
      }).setView([0, 0], 5);
      mapRef.current = map;


    // Add OpenStreetMap base layer
    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Load GeoTIFF and add it as a layer
    const urlToGeoTiffFile = "http://localhost:9090/output_cog.tif";
    parseGeoraster(urlToGeoTiffFile).then((georaster) => {
      const layer = new GeoRasterLayer({
        attribution: "Planet",
        georaster: georaster,
        pixelValuesToColorFn: pixelValuesToColorFn,
        resolution: 128,
      });

      layer.addTo(map);
      map.fitBounds(layer.getBounds());
    });
  }, []); // Empty dependency array ensures the effect runs only once

  return (
    <div
      id="map"
      style={{
        height: "100vh",
        width: "100vw",
        position: "absolute",
      }}
    />
  );
};

export default LeafletMap;
