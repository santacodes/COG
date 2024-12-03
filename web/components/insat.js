import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Function to change the pixel values to color, customize this as needed
const pixelValuesToColorFn = (values) => {
  const value = values[0];
  if (value === -99.0 || value === null) return null;

  const intensity = Math.round((value / 255) * 255);
  return `rgb(${intensity}, ${intensity}, ${intensity})`;
};

const LeafletMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      return;
    }

    const L = require("leaflet");
    const parseGeoraster = require("georaster");
    const GeoRasterLayer = require("georaster-layer-for-leaflet");

    const map = L.map("map", {
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
      maxBoundsViscosity: 1.0,
    }).setView([20, 90], 4); // Centered roughly over Asia
    mapRef.current = map;

    // Load GeoTIFF and set it as the base layer
    const urlToGeoTiffFile = "https://127.0.0.1:8443/cog/output_cog.tif";
    parseGeoraster(urlToGeoTiffFile).then((georaster) => {
      const cogLayer = new GeoRasterLayer({
        attribution: "Planet",
        georaster: georaster,
        pixelValuesToColorFn: pixelValuesToColorFn,
        resolution: 128,
      });

      cogLayer.addTo(map);
      map.fitBounds(cogLayer.getBounds());
    });

    // Add GeoJSON layer for the Asian boundary
    const asiaBoundaryUrl = "https://127.0.0.1:8443/cog/IND.geo.json"; // Replace with actual URL or path
    fetch(asiaBoundaryUrl)
      .then((response) => response.json())
      .then((geojson) => {
        const asiaBoundaryLayer = L.geoJSON(geojson, {
          style: {
            color: "red",
            weight: 2,
            opacity: 0.8,
          },
        });
        asiaBoundaryLayer.addTo(map);
      })
      .catch((error) => {
        console.error("Error loading GeoJSON:", error);
      });
  }, []);

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
