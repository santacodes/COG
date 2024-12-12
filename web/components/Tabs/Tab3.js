import React, { useState } from "react";
import { rgbband } from "../insat_L1C";

const Tab3 = ({ onSelectionSubmit }) => {
  const sensorOptions = [
    { name: "IMG_MIR", id: 1 },
    { name: "IMG_SWIR", id: 2 },
    { name: "IMG_TIR1", id: 3 },
    { name: "IMG_TIR2", id: 4 },
    { name: "IMG_VIS", id: 5 },
    { name: "IMG_WV", id: 6 },
  ];

  const [selectedSensors, setSelectedSensors] = useState({
    red: "",
    green: "",
    blue: "",
  });

  const handleChange = (band, sensorId) => {
    setSelectedSensors((prev) => ({
      ...prev,
      [band]: sensorId,
    }));
  };

  const handleSubmit = () => {
    const sensorArray = Object.entries(selectedSensors).map(([band, id]) => ({
      band,
      id: Number(id),
    }));
    console.log("Selected Sensors Array:", sensorArray);
    const url2="http://192.168.189.113:8443/cog/stacked.tif"
    rgbband(url2,sensorArray);
    if (onSelectionSubmit) {
        (sensorArray);
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 p-3 rounded-md w-56 space-y-3">
      <div>
        <h1 className="text-xs font-medium mb-1">Red</h1>
        <select
          className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-xs focus:ring-2 focus:ring-red-500"
          value={selectedSensors.red}
          onChange={(e) => handleChange("red", e.target.value)}
        >
          <option value="" className="text-gray-500">
            Select Sensor
          </option>
          {sensorOptions.map((sensor) => (
            <option key={sensor.id} value={sensor.id} className="text-white-900">
              {sensor.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h1 className="text-xs font-medium mb-1">Green</h1>
        <select
          className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-xs focus:ring-2 focus:ring-green-500"
          value={selectedSensors.green}
          onChange={(e) => handleChange("green", e.target.value)}
        >
          <option value="" className="text-gray-500">
            Select Sensor
          </option>
          {sensorOptions.map((sensor) => (
            <option key={sensor.id} value={sensor.id} className="text-white-900">
              {sensor.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h1 className="text-xs font-medium mb-1">Blue</h1>
        <select
          className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-xs focus:ring-2 focus:ring-blue-500"
          value={selectedSensors.blue}
          onChange={(e) => handleChange("blue", e.target.value)}
        >
          <option value="" className="text-gray-500">
            Select Sensor
          </option>
          {sensorOptions.map((sensor) => (
            <option key={sensor.id} value={sensor.id} className="text-white-900">
              {sensor.name}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleSubmit}
        className="w-full p-1 bg-blue-600 hover:bg-blue-700 text-xs font-semibold rounded shadow focus:ring-2 focus:ring-blue-400"
      >
        Okay
      </button>
    </div>
  );
};

export default Tab3;




