import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
Cesium.buildModuleUrl.setBaseUrl('/cesium/');
const CesiumComponent = () => {
  const cesiumContainerRef = useRef(null);
  const toolbarRef = useRef(null);
  const [viewModel, setViewModel] = useState({
    layers: [],
    baseLayers: [],
    upLayer: null,
    downLayer: null,
    selectedLayer: null,
    isSelectableLayer: (layer) => viewModel.baseLayers.indexOf(layer) >= 0,
    raise: (layer, index) => {
      imageryLayers.raise(layer);
      updateLayerList();
    },
    lower: (layer, index) => {
      imageryLayers.lower(layer);
      updateLayerList();
    },
    canRaise: (layerIndex) => layerIndex > 0,
    canLower: (layerIndex) => layerIndex >= 0 && layerIndex < imageryLayers.length - 1,
  });

  let viewer = null;
  let imageryLayers = null;

  useEffect(() => {
    // Initialize Cesium Viewer
    viewer = new Cesium.Viewer(cesiumContainerRef.current, {
      baseLayerPicker: false,
      geocoder: false,
    });
    imageryLayers = viewer.imageryLayers;

    setupLayers();

    return () => {
      // Cleanup viewer on component unmount
      if (viewer) {
        viewer.destroy();
        viewer = null;
      }
    };
  }, []);

  const updateLayerList = () => {
    const numLayers = imageryLayers.length;
    const newLayers = [];
    for (let i = numLayers - 1; i >= 0; --i) {
      newLayers.push(imageryLayers.get(i));
    }
    setViewModel((prev) => ({
      ...prev,
      layers: newLayers,
    }));
  };

  const setupLayers = async () => {
    // Add base layers and additional layers
    await addBaseLayerOption("Bing Maps Aerial", Cesium.createWorldImageryAsync());
    await addBaseLayerOption(
      "Bing Maps Road",
      Cesium.createWorldImageryAsync({
        style: Cesium.IonWorldImageryStyle.ROAD,
      }),
    );
    // Add additional layers similarly
    updateLayerList();
  };

  const addBaseLayerOption = async (name, imageryProviderPromise) => {
    try {
      const imageryProvider = await Promise.resolve(imageryProviderPromise);
      const layer = new Cesium.ImageryLayer(imageryProvider);
      layer.name = name;

      setViewModel((prev) => ({
        ...prev,
        baseLayers: [...prev.baseLayers, layer],
      }));
      updateLayerList();
    } catch (error) {
      console.error(`Error creating base layer ${name}:`, error);
    }
  };

  return (
    <div>
      <div ref={cesiumContainerRef} style={{ width: "100%", height: "90vh" }}></div>
      <div ref={toolbarRef} id="toolbar" style={toolbarStyle}>
        <table>
          <tbody>
            {viewModel.layers.map((layer, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    checked={layer.show}
                    onChange={() => {
                      layer.show = !layer.show;
                      updateLayerList();
                    }}
                  />
                </td>
                <td>
                  {viewModel.isSelectableLayer(layer) ? (
                    <select
                      value={viewModel.selectedLayer}
                      onChange={(e) =>
                        setViewModel((prev) => ({
                          ...prev,
                          selectedLayer: e.target.value,
                        }))
                      }
                    >
                      {viewModel.baseLayers.map((baseLayer, i) => (
                        <option key={i} value={baseLayer}>
                          {baseLayer.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>{layer.name}</span>
                  )}
                </td>
                <td>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={layer.alpha}
                    onChange={(e) => {
                      layer.alpha = parseFloat(e.target.value);
                      updateLayerList();
                    }}
                  />
                </td>
                <td>
                  <button
                    onClick={() => viewModel.raise(layer, index)}
                    disabled={!viewModel.canRaise(index)}
                  >
                    ▲
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => viewModel.lower(layer, index)}
                    disabled={!viewModel.canLower(index)}
                  >
                    ▼
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const toolbarStyle = {
  background: "rgba(42, 42, 42, 0.8)",
  padding: "4px",
  borderRadius: "4px",
};

export default CesiumComponent;
