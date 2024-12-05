import React, { useEffect } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/WebGLTile';
import GeoTIFF from 'ol/source/GeoTIFF';
import 'ol/ol.css';
import { fromUrl } from 'geotiff';
import WebGLTileLayer from 'ol/layer/WebGLTile';
import { OSM } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';

// Function to load and process the GeoTIFF COG file
async function loadGeoTIFF(url) {
  const tiff = await fromUrl(url);
  const image = await tiff.getImage(0); // Get the first image from the COG
  const data = await image.readRasters();

  // Select the first band (or any band you need)
  const bandData = data[0]; // Assuming the first band is what you want

  // Normalize the data to a grayscale range (0-255)
  const min = 777
  const max = 993
  const normalizedData = bandData.map(value => {
    return Math.round(((value - min) / (max - min)) / 255); // Normalize to 0-255 range
  });
  console.log(bandData)
  return { bandData: normalizedData, min, max };
}

function MapComponent() {
  useEffect(() => {
    const url = 'http://127.0.0.1:8443/cog/stacked.tif'; // Replace with your COG file URL

    loadGeoTIFF(url).then(({ bandData, min, max }) => {
      console.log('Min:', min, 'Max:', max); // Log min/max of the band

      // Create a custom WebGLTileLayer to display the grayscale image
      const source = new GeoTIFF({
        sources: [
          {
            url: url,
            bands: [1,2], // Use band 1 (or any band you want)
            max: 551,
            min: 14,
          }
        ]
      });

      const insatMap = new WebGLTileLayer({
        source: source,
        style: {
          color: [
            'array',
            ['band', 2], // Single-band visualization
            ['band', 2],
            ['band', 2],
            1,
          ],
        },
      });

      const osmLayer = new TileLayer({
        source: new OSM(),
      });

      const geojsonSource = new VectorSource({
        // You can replace this URL with the path to your GeoJSON file
        url: 'http://127.0.0.1:8443/cog/INDgeo.json',
        format: new GeoJSON(),
      });
  
      // Create a vector layer to display the GeoJSON
      const vectorLayer = new VectorLayer({
        source: geojsonSource,
      });

      const map = new Map({
        target: 'map',
        layers: [osmLayer, insatMap, vectorLayer],
        view: new View({
          projection: 'EPSG:4326',
          center: [0, 0],
          zoom: 0,
        }),
      });

      // Cleanup function to destroy the map when the component unmounts
      return () => map.setTarget(null);
    });

  }, []); // Empty dependency array ensures this effect runs once on mount

  return <div id="map" style={{ width: '100%', height: '1000px' }}></div>;
}

export default MapComponent;
