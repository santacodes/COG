import React from 'react';

const DownloadMap = ({ map }) => {
  const handleDownload = () => {
    if (!map) {
      console.error('Map instance not provided!');
      return;
    }

    map.once('rendercomplete', () => {
      const mapCanvas = document.createElement('canvas');
      const size = map.getSize();
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      const mapContext = mapCanvas.getContext('2d');

      Array.prototype.forEach.call(
        map.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer'),
        (canvas) => {
          if (canvas.width > 0) {
            const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
            mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);

            let matrix;
            const transform = canvas.style.transform;

            if (transform) {
              // Extract transform matrix values
              matrix = transform
                .match(/^matrix\(([^\(]*)\)$/)[1]
                .split(',')
                .map(Number);
            } else {
              matrix = [
                parseFloat(canvas.style.width) / canvas.width,
                0,
                0,
                parseFloat(canvas.style.height) / canvas.height,
                0,
                0,
              ];
            }

            // Apply the transform
            CanvasRenderingContext2D.prototype.setTransform.apply(
              mapContext,
              matrix
            );

            const backgroundColor = canvas.parentNode.style.backgroundColor;
            if (backgroundColor) {
              mapContext.fillStyle = backgroundColor;
              mapContext.fillRect(0, 0, canvas.width, canvas.height);
            }

            mapContext.drawImage(canvas, 0, 0);
          }
        }
      );

      mapContext.globalAlpha = 1;
      mapContext.setTransform(1, 0, 0, 1, 0, 0);

      // Trigger download
      const link = document.createElement('a');
      link.href = mapCanvas.toDataURL();
      link.download = 'map.png';
      link.click();
    });

    // Trigger render
    map.renderSync();
  };

  return (
    <button onClick={handleDownload} style={{ margin: '10px' }}>
      Download Map
    </button>
  );
};

export default DownloadMap;
