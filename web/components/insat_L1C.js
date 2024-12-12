import React, { useEffect, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/WebGLTile";
import GeoTIFF from "ol/source/GeoTIFF";
import Graticule from "ol/layer/Graticule";
import Stroke from "ol/style/Stroke";
import "ol/ol.css";
import { fromUrl } from "geotiff";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import {
  FullScreen,
  defaults as defaultControls,
  MousePosition,
  OverviewMap,
} from "ol/control.js";
import { createStringXY } from "ol/coordinate";
import DownloadMap from "./DownloadMap";
import PartialDown from "./PartialDown";

export let map = new Map(null);
export async function rgbband(url,band) {
  console.log("L1C...............",band)
  
  const loadinsatGeoTIFF = async (url, band) => {
    try {
      const tiff = await fromUrl(url);0
      const image = await tiff.getImage();
      const gdalMetadata = image.getGDALMetadata();
      console.log("GDAL Metadata:", gdalMetadata);
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
    const source = new GeoTIFF({
      sources: [
        {
          url: url,
          bands: [1, 2, 3, 4, 5, 6],
          max: 1023,//MinMax.max,
          min: 0 //MinMax.min,
        },
      ],
      projection: "EPSG:4326",
    });
    const insatMap = new WebGLTileLayer({
      source: source,
      style: {
        color: [
          "array",
          ["band", band[0].id],
          ["band", band[1].id],
          ["band", band[2].id],
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
  console.log("ends");
}export let osmdup = new WebGLTileLayer(null) 

export async function ChangeBand(url, band) {
  const loadinsatGeoTIFF = async (url, band) => {
    try {
      const tiff = await fromUrl(url);
      const image = await tiff.getImage();
      const gdalMetadata = image.getGDALMetadata();
      console.log("GDAL Metadata:", gdalMetadata);
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
    const source = new GeoTIFF({
      sources: [
        {
          url: url,
          bands: [1, 2, 3, 4, 5, 6],
          max: MinMax.max,
          min: MinMax.min,
        },
      ],
      projection: "EPSG:4326",
    });
    const insatMap = new WebGLTileLayer({
      source: source,
      style: {
        color: ["array", ["band", band], ["band", band], ["band", band], 1],
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
  console.log("ends");
}

function L1CMapComponent() {
  const [isToolbarToggled, setIsToolbarToggled] = useState(false);
  const [isGraticuleActive, setIsGraticuleActive] = useState(false);
  const [graticuleLayer, setGraticuleLayer] = useState(null);

  const toggleToolbar = () => {
    setIsToolbarToggled((prevState) => !prevState);
  };

  const toggleGraticule = () => {
    if (isGraticuleActive) {
      if (graticuleLayer) {
        map.removeLayer(graticuleLayer);
        setGraticuleLayer(null);
      }
    } else {
      const grat = new Graticule({
        strokeStyle: new Stroke({
          color: "rgba(255,120,0,0.9)",
          width: 2,
          lineDash: [0.5, 4],
        }),
        showLabels: true,
        wrapX: false,
      });
      map.addLayer(grat);
      setGraticuleLayer(grat);
    }
    setIsGraticuleActive(!isGraticuleActive);
  };

  useEffect(() => {
    const mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: "EPSG:4326",
      className: "custom-mouse-position",
      target: document.getElementById("mouse-position"),
    });

    const overviewMapControl = new OverviewMap({
      className: "ol-overviewmap ol-custom-overviewmap",
      layers: [
        new TileLayer({
          source: new OSM({}),
        }),
      ],
      collapseLabel: "\u00BB",
      label: "\u00AB",
      collapsed: false,
    });

    map = new Map({
      controls: defaultControls().extend([
        mousePositionControl,
        new FullScreen(),
        overviewMapControl,
      ]),
      target: "map",
      layers: [],
      view: new View({
        projection: "EPSG:4326",
        center: [77.25, 17.75],
        zoom: 3,
      }),
    });

    const osmLayer = new WebGLTileLayer({
      source: new OSM(),
    });
    map.addLayer(osmLayer);
    osmdup = osmLayer
    const geojsonSource = new VectorSource({
      url: "http://192.168.189.113:8443/cog/india-composite.geojson",
      format: new GeoJSON(),
    });

    const IndiaBoundary = new VectorLayer({
      source: geojsonSource,
    });

    //map.getLayers().insertAt(1,vectorLayer)
    // Create a vector layer to display the GeoJSON
    map.addLayer(IndiaBoundary);
    //AddGraticule();
    // map.addLayer(vectorLayer)
    // Cleanup function to destroy the map when the component unmounts
    return () => map.setTarget(null);
  }, []);
//   <div>
//   <h1>Map with Bounding Box Drawer</h1>
//   <PartialDown map={map} />
// </div>
  return (
    <div>

      <div id="map" className="relative w-full h-screen"></div>
      <div>
     
        {/* Toggle Button */}
        <button
           
          onClick={toggleToolbar}
          className={`absolute w-[30px] h-[30px] top-[60px] ${isToolbarToggled ? "right-[110px]" : "right-[12px]"
            } z-[1100] bg-gray-800 text-white border-none cursor-pointer shadow-md`}
        >
          {isToolbarToggled ? (
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
          ) : (
            <svg
            xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>)}
        </button>

        {/* Toolbar */}
        <div
          className={`ToolbarContainer absolute w-[100px] top-[10px] right-0 z-[1000] transition-all duration-300 ease-in-out ${isToolbarToggled ? "block" : "hidden"
            }`}
        >
          <button
            title="Graticule"
            onClick={toggleGraticule}
            className="text-sm bg-gray-800 text-white px-0 mt-8 py-0 rounded-md shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {isGraticuleActive ? "Disable Graticule" : "Enable Graticule"}</button>
          <button title="Download Map" onClick={() => DownloadMap(map)} className="text-sm bg-gray-800 text-white px-0 py-0 rounded-md shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 mt-2">Download Map </button></div>
      </div>
      <div
        id="mouse-position"
        className="custom-mouse-position absolute bottom-5 right-2 bg-white-800 text-white-300 text-xs py-1 px-2 border border-gray-600 rounded shadow-md pointer-events-none z-10 flex items-center justify-center"
      ></div>
    </div>
  );
}

export default L1CMapComponent;
