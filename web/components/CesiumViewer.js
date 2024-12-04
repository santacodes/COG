import { useEffect, useRef } from 'react';
// import { Viewer } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { Cartesian3, createOsmBuildingsAsync, Ion, Math as CesiumMath, Terrain, Viewer } from 'cesium';
export default function CesiumViewer() {
  // const cesiumContainerRef = useRef(null);

  useEffect(() => {
    // window.CESIUM_BASE_URL = "/home/jayavishnu/Documents/1738SIH/COG/web/public/cesium";

    const viewer = new Viewer('cesiumContainer', {
      terrainProvider: undefined,
    });
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
      // orientation: {
      //   heading: CesiumMath.toRadians(0.0),
      //   pitch: CesiumMath.toRadians(-15.0),
      // }
    });
    return () => {
      if (viewer) {
        viewer.destroy();
      }
    };
  }, []);

  return <div id="cesiumContainer" style={{height: '100vh', width: '100vw'}}></div>;
}

