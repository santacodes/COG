import React, { useState } from "react";
import Graticule from "ol/layer/Graticule";
import Stroke from "ol/style/Stroke";
import { Map } from "ol/Map";
import { map } from "./insat_L1C";

function GraticuleToggle() {
  const [isGraticuleActive, setIsGraticuleActive] = useState(false);
  const [graticuleLayer, setGraticuleLayer] = useState(null);

  const toggleGraticule = () => {
    if (isGraticuleActive) {
      if (graticuleLayer) {
        map.removeLayer(graticuleLayer);
        setGraticuleLayer(null);
      }
    } else {
      const grat = new Graticule({
        // the style to use for the lines, optional.
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
  console.log("toggled ");
  return (
    <button title="Graticule" onClick={toggleGraticule}>
      {isGraticuleActive ? "Disable Graticule" : "Enable Graticule"}
    </button>
  );
}

export default GraticuleToggle;
