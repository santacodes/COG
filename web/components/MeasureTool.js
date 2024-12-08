import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map.js';
import Overlay from 'ol/Overlay.js';
import View from 'ol/View.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { LineString, Polygon } from 'ol/geom.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { getArea, getLength } from 'ol/sphere.js';
import { unByKey } from 'ol/Observable.js';
import Draw from 'ol/interaction/Draw.js';
import 'ol/ol.css';  // Import OpenLayers CSS for styles

const MapWithMeasuringTool = () => {
  const mapRef = useRef(null);  // Ref for the map container
  const [isActive, setIsActive] = useState(false);  // State to control tool activation
  const [draw, setDraw] = useState(null);  // State to hold the current draw interaction

  useEffect(() => {
    // Initial map setup
    const raster = new TileLayer({
      source: new OSM(),
    });

    const source = new VectorSource();

    const vector = new VectorLayer({
      source: source,
      style: {
        'fill-color': 'rgba(255, 255, 255, 0.2)',
        'stroke-color': '#ffcc33',
        'stroke-width': 2,
        'circle-radius': 7,
        'circle-fill-color': '#ffcc33',
      },
    });

    const map = new Map({
      layers: [raster, vector],
      target: mapRef.current,
      view: new View({
        center: [-11000000, 4600000],
        zoom: 15,
      }),
    });

    const helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'ol-tooltip hidden';
    const helpTooltip = new Overlay({
      element: helpTooltipElement,
      offset: [15, 0],
      positioning: 'center-left',
    });
    map.addOverlay(helpTooltip);

    const measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    const measureTooltip = new Overlay({
      element: measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center',
    });
    map.addOverlay(measureTooltip);

    let sketch;
    let listener;

    const pointerMoveHandler = function (evt) {
      if (evt.dragging) {
        return;
      }
      let helpMsg = 'Click to start drawing';
      if (sketch) {
        const geom = sketch.getGeometry();
        if (geom instanceof Polygon) {
          helpMsg = 'Click to continue drawing the polygon';
        } else if (geom instanceof LineString) {
          helpMsg = 'Click to continue drawing the line';
        }
      }
      helpTooltipElement.innerHTML = helpMsg;
      helpTooltip.setPosition(evt.coordinate);
      helpTooltipElement.classList.remove('hidden');
    };

    const formatLength = function (line) {
      const length = getLength(line);
      let output;
      if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' km';
      } else {
        output = Math.round(length * 100) / 100 + ' m';
      }
      return output;
    };

    const formatArea = function (polygon) {
      const area = getArea(polygon);
      let output;
      if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + ' km²';
      } else {
        output = Math.round(area * 100) / 100 + ' m²';
      }
      return output;
    };

    const addInteraction = (type) => {
      const drawInteraction = new Draw({
        source: source,
        type: type,
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.5)',
            lineDash: [10, 10],
            width: 2,
          }),
          image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
              color: 'rgba(0, 0, 0, 0.7)',
            }),
            fill: new Fill({
              color: 'rgba(255, 255, 255, 0.2)',
            }),
          }),
        }),
      });
      map.addInteraction(drawInteraction);

      drawInteraction.on('drawstart', function (evt) {
        sketch = evt.feature;
        listener = sketch.getGeometry().on('change', function (evt) {
          const geom = evt.target;
          let output;
          if (geom instanceof Polygon) {
            output = formatArea(geom);
          } else if (geom instanceof LineString) {
            output = formatLength(geom);
          }
          measureTooltipElement.innerHTML = output;
          measureTooltip.setPosition(geom.getLastCoordinate());
        });
      });

      drawInteraction.on('drawend', function () {
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        measureTooltip.setOffset([0, -7]);
        sketch = null;
        measureTooltipElement = null;
        unByKey(listener);
      });
    };

    if (isActive) {
      addInteraction('Polygon');
    } else {
      map.removeInteraction(draw);
    }

    map.on('pointermove', pointerMoveHandler);
    map.getViewport().addEventListener('mouseout', () => {
      helpTooltipElement.classList.add('hidden');
    });

    // Cleanup map when component unmounts
    return () => {
      map.setTarget(null);
    };
  }, [isActive]);

  return (
    <div>
      <div id="map" className="map" style={{ width: '100%', height: '400px' }}></div>
      <button
        onClick={() => setIsActive(!isActive)}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px',
          backgroundColor: '#007bff',
          color: '#fff',
        }}
      >
        {isActive ? 'Deactivate Measuring Tool' : 'Activate Measuring Tool'}
      </button>
    </div>
  );
};

export default MapWithMeasuringTool;
