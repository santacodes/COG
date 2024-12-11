import React, { useEffect } from 'react';
import { Draw } from 'ol/interaction.js';
import { createBox } from 'ol/interaction/Draw';
import { Vector as VectorSource } from 'ol/source';
import { osmdup } from './insat_L1C';

const PartialDown = ({ map, layer }) => {
  useEffect(() => {
    if (!map) return;

    let drawInteraction;

    const addInteraction = () => {
      // Create a new Draw interaction for drawing a box
      drawInteraction = new Draw({
        source: osmdup.getSource(),
        type: 'Circle', // OpenLayers uses 'Circle' for box geometry with createBox()
        geometryFunction: createBox(),
      });

      // Handle the end of the drawing event
      drawInteraction.on('drawend', (event) => {
        const extent = event.feature.getGeometry().getExtent();
        console.log('Bounding Box Coordinates:', extent);

        // Send the bounding box to the FastAPI endpoint
        fetch('http://127.0.0.1:8443/partial/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bbox: extent,
          }),
        })
          .then((response) => {
            if (response.ok) return response.blob();
            throw new Error('Failed to fetch raster data');
          })
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'partial_raster.tif';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
          })
          .catch((error) => console.error('Error fetching raster data:', error));
      });

      // Add the draw interaction to the map
      map.addInteraction(drawInteraction);
    };

    // Add interaction for drawing a box
    addInteraction();

    // Cleanup interaction on component unmount
    return () => {
      map.removeInteraction(drawInteraction);
    };
  }, [map, layer]);

  return (
    <div>
      <p>Draw a box on the map to download the raster data. The bounding box coordinates will be sent to the server.</p>
    </div>
  );
};

export default PartialDown;
