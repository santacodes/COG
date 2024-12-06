import React, { useState } from "react";
import styles from "./Tab1.module.css"; // Custom CSS for styling
import { ChangeBand } from "../insat";

const Tab1 = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState([]);
  const [areLayersVisible, setAreLayersVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [layers, setLayers] = useState([]);
  

  const sensorOptions = [
    "1",
    "Sensor 2",
    "Sensor 3",
    "Sensor 4", // Add more sensor options as needed
  ];

  const layerOptions = [
    "Admin Boundaries",
    "National Highways",
    "Rivers",
    "Cyclone Risk Map",
    "Fire Risk Map",
  ];

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleLayersVisibility = () => {
    setAreLayersVisible(!areLayersVisible);
  };

  const handleCheckboxChange = (layer) => {
    setSelectedLayers((prev) =>
      prev.includes(layer)
        ? prev.filter((l) => l !== layer)
        : [...prev, layer]
    );
  };

  const handleOpacityChange = (event) => {
    setOpacity(event.target.value);
  };

  const handleAddLayer = () => {
    setLayers([
      ...layers,
      {
        id: layers.length + 1,
        date: "",
        time: "",
        opacity: 1,
        sensor: "", // Added sensor field
      },
    ]);
  };

  const handleDeleteLayer = (id) => {
    setLayers(layers.filter((layer) => layer.id !== id));
  };

  const handleSensorChange = (e, id) => {
    const updatedSensor = parseInt(e.target.value, 10); // Get the selected sensor value
    ChangeBand("http://192.168.1.46:8443/cog/stacked.tif", updatedSensor, 
      
    )
    console.log("Sensor selected:", updatedSensor); // Log the selected sensor name
    
    const updatedLayers = [...layers];
    const layerIndex = updatedLayers.findIndex((layer) => layer.id === id);
  
    if (layerIndex !== -1) {
      updatedLayers[layerIndex] = { ...updatedLayers[layerIndex], sensor: updatedSensor }; // Update the sensor for the layer
    }
  
    setLayers(updatedLayers); // Update the state with the new layers
  };
  
  return (
    <div className={styles.Tab1}>
      <h3>Layer Management</h3>

      {/* Overlay Layers Container */}
      <div className={styles.overlayContainer}>
        <h4 className={styles.heading4}>Overlay Layers</h4>
        <button className={styles.toggleButton} onClick={toggleDropdown}>
          {isDropdownOpen ? "Hide Layers" : "Show Layers"}
        </button>
        <button
          className={styles.toggleButton}
          onClick={toggleLayersVisibility}
        >
          {areLayersVisible ? "Hide Selected Layers" : "Show Selected Layers"}
        </button>

        {isDropdownOpen && (
          <div className={styles.dropdown}>
            {layerOptions.map((layer) => (
              <label key={layer} className={styles.layerOption}>
                <input
                  type="checkbox"
                  checked={selectedLayers.includes(layer)}
                  onChange={() => handleCheckboxChange(layer)}
                />
                {layer}
              </label>
            ))}
          </div>
        )}

        {/* Opacity control slider for Overlay Layers */}
        <div className={styles.opacityControl}>
          <label htmlFor="opacitySlider">Layer Opacity</label>
          <input
            id="opacitySlider"
            type="range"
            min="0"
            max="1"
            value={opacity}
            onChange={handleOpacityChange}
            className={styles.opacitySlider}
          />
          <span>{(opacity * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Sensor Layers Container */}
      <div className={styles.sensorContainer}>
        <h4 className={styles.heading4}>Sensor Layers</h4>
        <button className={styles.addLayerButton} onClick={handleAddLayer}>
          Add Sensor Layer
        </button>

        {layers.map((layer) => (
          <div key={layer.id} className={styles.layerContainer}>
            <div className={styles.layer}>
              <button
                className={styles.deleteLayerButton}
                onClick={() => handleDeleteLayer(layer.id)}
              >
                Delete
              </button>
              <label>Date:
                <input
                  type="date"
                  className={styles.dateInput}
                  value={layer.date}
                  onChange={(e) => {
                    const newLayers = [...layers];
                    newLayers[layer.id - 1].date = e.target.value;
                    setLayers(newLayers);
                  }}
                />
              </label>
              <label>Time:
                <input
                  type="datetime-local"
                  className={styles.timeInput}
                  value={layer.time}
                  onChange={(e) => {
                    const newLayers = [...layers];
                    newLayers[layer.id - 1].time = e.target.value;
                    setLayers(newLayers);
                  }}
                />
              </label>
              <label>Sensor:</label>
              <select
                className={styles.sensorSelect}
                value={layer.sensor}
                onChange={(e) => handleSensorChange(e, layer.id)}
              >
                <option value="">Select Sensor</option>
                {sensorOptions.map((sensor) => (
                  <option key={sensor} value={sensor}>
                    {sensor}
                  </option>
                ))}
              </select>
              <label>Opacity:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={layer.opacity}
                onChange={(e) => {
                  const newLayers = [...layers];
                  newLayers[layer.id - 1].opacity = e.target.value;
                  setLayers(newLayers);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tab1;
