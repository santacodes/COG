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
import { load } from 'ol/Image';
import { MinusCircleIcon } from '@heroicons/react/16/solid';

// Function to load and process the GeoTIFF COG file
const loadinsatGeoTIFF = async(url, band) => {
    try {
        // Fetch the GeoTIFF file
        const tiff = await fromUrl(url);

        // Read the first image (most COGs have one image)
        const image = await tiff.getImage();

        // Fetch metadata
        const gdalMetadata = image.getGDALMetadata();
        console.log("GDAL Metadata:", gdalMetadata);
        // Iterate through each band and get GDAL metadata
        const MinMax = image.getGDALMetadata(band)
        console.log(MinMax.min)
        return {min: MinMax.min, max: MinMax.max}
    } catch (error) {
        console.error("Error processing COG:", error);
    }
}


const initializeMap = async (url, band) => {
  const MinMax = await loadinsatGeoTIFF(url, band);
  if (!MinMax) {
    console.error("Failed to retrieve min/max values.");
    return;
  }
  // Create a custom WebGLTileLayer to display the grayscale image
  const source = new GeoTIFF({
    sources: [
      {
        url: url,
        bands: band, // Use band 1 (or any band you want)
        max: MinMax.max,
        min: MinMax.min,
      }
    ]
  });
  const insatMap = new WebGLTileLayer({
    source: source,
    style: {
      color: [
        'array',
        ['band', band], // Single-band visualization
        ['band', band],
        ['band', band],
        1,
      ],
    },
  });
  return insatMap;
}

function MapComponent() {
  useEffect(() => {
      const url = 'http://192.168.1.135:8443/cog/stacked.tif'; // Replace with your COG file URL
     
      
      const osmLayer = new WebGLTileLayer({
        source: new OSM(),
      });

      const geojsonSource = new VectorSource({
        // You can replace this URL with the path to your GeoJSON file
        url: 'http://192.168.1.135:8443/cog/INDgeo.json',
        format: new GeoJSON(),
      });
  
      // Create a vector layer to display the GeoJSON
      const vectorLayer = new VectorLayer({
        source: geojsonSource,
      });

      const map = new Map({
        target: 'map',
        layers: [osmLayer, vectorLayer],
        view: new View({
          projection: 'EPSG:4326',
          center: [0, 0],
          zoom: 0,
        }),
      });

      const getInsatMap = async(url, band) => {
        const exampleLayer = await initializeMap(url, band);
        console.log(exampleLayer)
        map.setLayers([osmLayer, exampleLayer,vectorLayer])
      }
      getInsatMap(url, 1)
      // Cleanup function to destroy the map when the component unmounts
      return () => map.setTarget(null);

  }, []); // Empty dependency array ensures this effect runs once on mount

  return <div id="map" style={{ width: '100%', height: '1000px' }}></div>;
}

export default MapComponent;
