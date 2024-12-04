import React, { useState, useEffect } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/WebGLTile';
import GeoTIFF from 'ol/source/GeoTIFF';
import 'ol/ol.css';
import { fromUrl } from 'geotiff';
import { OSM } from 'ol/source';

// Function to debug GeoTIFF and extract min/max values from metadata
async function debugGeoTIFF(url) {
  const tiff = await fromUrl(url);
  const image = await tiff.getImage(0);
  const metadata = image.getFileDirectory();

  const minPixelValue = metadata['STATISTICS_MINIMUM'];
  const maxPixelValue = metadata['STATISTICS_MAXIMUM'];

  console.log('Metadata Min Value:', minPixelValue);
  console.log('Metadata Max Value:', maxPixelValue);

  return { min: 14, max: 551};
}

function MapComponent() {
  useEffect(() => {
    const url = 'http://127.0.0.1:8443/cog/stacked_new.tif'; // Update with your COG URL

    debugGeoTIFF(url).then(({ min, max }) => {
      console.log('Min/Max values:', min, max);

      // Set the normalization or processing using the retrieved min/max values
      const osmLayer = new TileLayer({
        preload: Infinity,
        source: new OSM(),
      });

      const source = new GeoTIFF({
        sources: [
          {
            url: url,
          },
        ],
        normalize: true,
        projection: 'EPSG:4326',
        wrapX: false,
      });
      console.log(source)
      const insatMap = new TileLayer({
        source: source,
        style: {
          color: [
            'array',
            ['band', 2], // Single-band visualization
            ['band', 2],
            ['band', 2],
            255, // Alpha (opacity)
          ],
        },
      });
      console.log(insatMap)
      const map = new Map({
        target: 'map',
        layers: [osmLayer, insatMap],
        view: new View({
          projection: 'EPSG:4326',
          center: [0, 0],
          zoom: 0,
        }),
      });

      return () => map.setTarget('map');
    });
  }, []);

  return <div id="map" className="map-container" style={{ height: '1000px', width: '100%' }} />;
}

export default MapComponent;