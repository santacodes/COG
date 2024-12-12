import React, { useState } from "react";
import { ChangeBand } from "../insat_L1C";

const Tab1 = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState([]);
  const [areLayersVisible, setAreLayersVisible] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [layers, setLayers] = useState([]);
  const [selectedBaseLayer, setSelectedBaseLayer] = useState("");
  
  const sensorOptions = [
    { name: "IMG_MIR", id: 1 },
    { name: "IMG_SWIR", id: 2 },
    { name: "IMG_TIR1", id: 3 },
    { name: "IMG_TIR2", id: 4 },
    { name: "IMG_VIS", id: 5 },
    { name: "IMG_WV", id: 6 },
  ];

  const layerOptions = [
    "Admin Boundaries",
    "National Highways",
    "Rivers",
    "Cyclone Risk Map",
    "Fire Risk Map",
  ];

  const baseLayerOptions = ["1", "2", "3", "4"];

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleLayersVisibility = () => setAreLayersVisible(!areLayersVisible);

  const handleCheckboxChange = (layer) => {
    setSelectedLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  };

  const handleOpacityChange = (event) => setOpacity(event.target.value);

  const handleAddLayer = () => {
    setLayers([
      ...layers,
      {
        id: layers.length + 1,
        date: "",
        time: "",
        opacity: 1,
        sensor: "",
        visible: true,
      },
    ]);
  };

  const handleDeleteLayer = (id) =>
    setLayers(layers.filter((layer) => layer.id !== id));

  const handleSensorChange = (e, id) => {
    const updatedSensor = e.target.value;
    const sensorId = parseInt(updatedSensor, 10);
    ChangeBand("http://192.168.189.113:8443/cog/stacked.tif", sensorId);
    const updatedLayers = layers.map((layer) =>
      layer.id === id ? { ...layer, sensor: updatedSensor } : layer
    );
    setLayers(updatedLayers);
  };

  const handleBaseLayerChange = (e) => setSelectedBaseLayer(e.target.value);

  // Generate time options for 15-minute intervals
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourString = String(hour).padStart(2, "0");
      options.push(`${hourString}:15`, `${hourString}:45`);
    }
    return options;
  };

  const isFutureDateTime = (date, time) => {
    const currentDateTime = new Date();
    const inputDateTime = new Date(`${date}T${time}`);
    return inputDateTime > currentDateTime;
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const formattedDate = new Date(date).toLocaleDateString("en-IN", options).toUpperCase();
    return formattedDate.replace(',', '').split(' ').join('');
  };

  // Function to format time to HHMM (e.g., 1715)
  const formatTime = (time) => {
    return time.replace(":", ""); // Removing the colon
  };


  const handleDateTimeChange = (date, time, layerId) => {
    if (isFutureDateTime(date, time)) {
      alert("You cannot select a future date and time.");
      return;
    }

    const formattedDate = formatDate(date); // Format date as DDMMMYYYY
    const formattedTime = formatTime(time); // Format time as HHMM
    const fileName = `3RIMG_${formattedDate}_${formattedTime}_L1C_ASIA_MER_V01R00.tif`;
    const layer = layers.find((layer) => layer.id === layerId);
    console.log(layer);
    const nameToFind = layer.sensor;
    const nameToFindId = parseInt(nameToFind, 10)
    const sensorId = sensorOptions.find((sensor) => sensor.name === nameToFind);
    // console.log(url)
    console.log(fileName)
    ChangeBand(fileName, nameToFindId);
    // console.log(`Requesting URL: ${url}`);

    const updatedLayers = layers.map((layer) =>
      layer.id === layerId ? { ...layer, date: date, time: time } : layer
    );
    setLayers(updatedLayers);
    const concatenatedDateTime = `${date}T${time}`;
    console.log(`DateTime Concatenated: ${concatenatedDateTime}`);
    // Pass the concatenated date-time to a function
    // Example: someFunction(concatenatedDateTime);
  };

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-md shadow-md text-gray-300">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">
        Layer Management
      </h3>

      {/* Overlay Layers Section */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-2">
          Overlay Layers
        </h4>
        <div className="flex gap-2">
          <button
            className="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded-md hover:bg-gray-600"
            onClick={toggleDropdown}
          >
            {isDropdownOpen ? "Hide Layers" : "Show Layers"}
          </button>
          <button
            className="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded-md hover:bg-gray-600"
            onClick={toggleLayersVisibility}
          >
            {areLayersVisible ? "Hide All" : "Show Selected"}
          </button>
        </div>

        {isDropdownOpen && (
          <div className="mt-3 bg-gray-700 border border-gray-600 rounded-md shadow-inner max-h-36 overflow-y-auto">
            {layerOptions.map((layer) => (
              <label
                key={layer}
                className="flex items-center px-3 py-2 text-sm hover:bg-gray-600"
              >
                <input
                  type="checkbox"
                  className="mr-2 accent-gray-500"
                  checked={selectedLayers.includes(layer)}
                  onChange={() => handleCheckboxChange(layer)}
                />
                {layer}
              </label>
            ))}
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm text-gray-300 mb-2">
            Layer Opacity
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={opacity}
            onChange={handleOpacityChange}
            className="w-full accent-gray-500"
          />
          <span className="block mt-2 text-xs text-gray-400">
            {(opacity * 100).toFixed(0)}%
          </span>
        </div>

        {/* Base Layer Selection */}
        <div className="mt-4">
          <label className="block text-sm text-gray-300 mb-2">
            Select Base Layer
          </label>
          <select
            value={selectedBaseLayer}
            onChange={handleBaseLayerChange}
            className="text-xs block w-full bg-gray-900 border-gray-700 rounded-md text-gray-300 focus:ring focus:ring-gray-600"
          >
            <option value="">Choose Base Layer</option>
            {baseLayerOptions.map((layer, index) => (
              <option key={index} value={layer}>
                {layer}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sensor Layers Section */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">
          Sensor Layers
        </h4>
        <button
          className="mb-3 text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded-md hover:bg-gray-600"
          onClick={handleAddLayer}
        >
          Add Sensor Layer
        </button>

        {layers.map((layer) => (
          <div
            key={layer.id}
            className="mb-4 p-3 bg-gray-700 border border-gray-600 rounded-md shadow-inner"
          >
            <div className="flex justify-between items-center mb-3">
              <button
                className={`text-sm px-4 py-1 rounded-md ${
                  layer.visible
                    ? "bg-green-500 hover:bg-green-600 text-gray-100"
                    : "bg-red-500 hover:bg-red-600 text-gray-100"
                }`}
                onClick={() =>
                  setLayers((prev) =>
                    prev.map((l) =>
                      l.id === layer.id ? { ...l, visible: !l.visible } : l
                    )
                  )
                }
              >
                {layer.visible ? "Hide" : "Show"}
              </button>
              <button
                className="text-sm bg-red-600 text-gray-100 px-2 py-1 rounded-md hover:bg-red-500"
                onClick={() => handleDeleteLayer(layer.id)}
              >
                Delete
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <label className="block">
                <span>Date:</span>
                <input
                  type="date"
                  value={layer.date}
                  onChange={(e) =>
                    setLayers((prev) =>
                      prev.map((l) =>
                        l.id === layer.id ? { ...l, date: e.target.value } : l
                      )
                    )
                  }
                  className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md text-gray-300 focus:ring focus:ring-gray-600"
                />
              </label>
              <label className="block">
                <span>Time:</span>
                <select
                  value={layer.time}
                  onChange={(e) =>
                    handleDateTimeChange(layer.date, e.target.value, layer.id)
                  }
                  className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md text-gray-300 focus:ring focus:ring-gray-600"
                >
                  <option value="">Select Time</option>
                  {generateTimeOptions().map((timeOption) => (
                    <option key={timeOption} value={timeOption}>
                      {timeOption}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span>Sensor:</span>
                <select
                  value={layer.sensor}
                  onChange={(e) => handleSensorChange(e, layer.id)}
                  className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md text-gray-300 focus:ring focus:ring-gray-600"
                >
                  <option value="">Select Sensor</option>
                  {sensorOptions.map((sensor) => (
                    <option key={sensor.id} value={sensor.id}>
                      {sensor.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span>Opacity:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={layer.opacity}
                  onChange={(e) =>
                    setLayers((prev) =>
                      prev.map((l) =>
                        l.id === layer.id
                          ? { ...l, opacity: parseFloat(e.target.value) }
                          : l
                      )
                    )
                  }
                  className="w-full accent-gray-500"
                />
                <span className="block mt-1 text-xs text-gray-400">
                  {(layer.opacity * 100).toFixed(0)}%
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tab1;





