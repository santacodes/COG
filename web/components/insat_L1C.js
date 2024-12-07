import React, { useEffect } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/WebGLTile";
import GeoTIFF from "ol/source/GeoTIFF";
import "ol/ol.css";
import { fromUrl } from "geotiff";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
let map = new Map(null);
export async function ChangeBand(url, band) {
  // Function to load and process the GeoTIFF COG file
  const loadinsatGeoTIFF = async (url, band) => {
    try {
      // Fetch the GeoTIFF file
      const tiff = await fromUrl(url);

      // Read the first image (most COGs have one image)
      const image = await tiff.getImage();

      // Fetch metadata
      const gdalMetadata = image.getGDALMetadata();
      console.log("GDAL Metadata:", gdalMetadata);
      // Iterate through each band and get GDAL metadata
      const MinMax = image.getGDALMetadata(band - 1);
      console.log(MinMax.min, MinMax.max);
      return { min: MinMax.min, max: MinMax.max };
    } catch (error) {
      console.error("Error processing COG:", error);
    }
  };

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
          bands: [1,2,3,4,5,6], // Use band 1 (or any band you want)
          max: MinMax.max,
          min: MinMax.min,
        },
      ],
      projection: "ESPG:4326",
    });
    const insatMap = new WebGLTileLayer({
      source: source,
      style: {
        color: [
          "array",
          ["band", band], // Single-band visualization
          ["band", band],
          ["band", band],
          1,
        ],
      },
    });
    return insatMap;
  };

  const getInsatMap = async (url, band) => {
    console.log(band);
    const exampleLayer = await initializeMap(url, band);
    console.log(exampleLayer);
    map.removeLayer();
    map.addLayer(exampleLayer);
    
  };
  await getInsatMap(url, band);
  console.log('ends')
}

function L1CMapComponent() {
  useEffect(() => {
    map = new Map({
      target: "map",
      layers: [],
      view: new View({
        projection: "EPSG:4326",
        center: [77.25,17.75],
        zoom: 0,
      }),
    });
    const url = "http://127.0.0.1:8443/cog/stacked.tif"; // Replace with your COG file URL
    const baseurl = process.env.NEXT_PUBLIC_BASE_URL
    console.log("this is the base url" + baseurl)

    const osmLayer = new WebGLTileLayer({
      source: new OSM(),
    });
    map.addLayer(osmLayer)
    const geojsonSource = new VectorSource({
      // You can replace this URL with the path to your GeoJSON file
      url: "http://127.0.0.1:8443/cog/INDgeo.json",
      format: new GeoJSON(),
    });
    const vectorLayer = new VectorLayer({
      source: geojsonSource,
    });
    // map.getLayers().insertAt(1,vectorLayer)
    
    // Create a vector layer to display the GeoJSON
  
    
    ChangeBand(url, 1);
    // map.addLayer(vectorLayer)
    

    
    // map.addLayer(dummy)
    // Cleanup function to destroy the map when the component unmounts
    return () => map.setTarget(null);
  }, []); // Empty dependency array ensures this effect runs once on mount

  return <div id="map" style={{ width: "100%", height: "1000px" }}></div>;
}

export default L1CMapComponent;
