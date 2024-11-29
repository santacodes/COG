import { useEffect, useState } from 'react';
import GeoTIFF from 'ol/source/GeoTIFF';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/WebGLTile';
import View from 'ol/View';
import { getCenter } from 'ol/extent';
import { TileGrid } from 'ol/tilegrid';

const OpenLayersMap = () => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    // Set up the GeoTIFF source with a tile grid for optimized performance
    const source = new GeoTIFF({
      sources: [
        {
          url: 'https://localhost:8443/cog/TCI.tif', // Replace with your COG server URL
        },
      ],
    });

    // Set up tile grid to optimize rendering
    const tileGrid = new TileGrid({
      tileSize: 512, // Use smaller tile size for better performance
      origin: [44.5000000, 45.5000000], // Adjust to your COG's coordinates
      resolutions: [0.1, 0.05, 0.025], // Adjust the zoom levels for the COG
    });

    // Map initialization with default settings
    const mapInstance = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: source,
          tileGrid: tileGrid, // Apply the tile grid
        }),
      ],
      view: new View({
        center: [0, 0], // Placeholder center, will adjust below
        zoom: 2, // Default zoom level
      }),
    });

    setMap(mapInstance);

    // Wait for the GeoTIFF source to be ready and adjust the map view
    source.on('change', () => {
      if (source.getState() === 'ready') {
        const extent = source.getExtent(); // Get extent of GeoTIFF
        if (extent) {
          const center = getCenter(extent); // Calculate center of the extent
          mapInstance.getView().setCenter(center); // Set the center of the map
          mapInstance.getView().fit(extent, { maxZoom: 10 }); // Adjust the view to fit the extent
        }
      }
    });

    // Cleanup map instance when component unmounts
    return () => mapInstance.setTarget(null);
  }, []);

  return (
    <div id="map" style={{ width: '100%', height: '600px' }} />
  );
};

export default OpenLayersMap;
