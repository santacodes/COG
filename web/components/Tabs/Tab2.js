"use client";
import React, { useState } from "react";

const Tab2 = () => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (value) => {
    setInputValue((prev) => prev + value);
  };

  const handleClear = () => {
    setInputValue("");
  };

  const handleCalculate = () => {
    try {
      setInputValue(eval(inputValue).toString()); // Evaluate the expression
    } catch {
      setInputValue("Error");
    }
  };

  const handleKeyPress = (e) => {
    const allowedKeys = /[0-9+\-*/.()]/;
    if (allowedKeys.test(e.key)) {
      handleInputChange(e.key);
    } else if (e.key === "Enter") {
      handleCalculate();
    } else if (e.key === "Backspace") {
      setInputValue((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div 
      className="text-gray-300" 
      tabIndex={0} 
      onKeyDown={handleKeyPress}
    >
      <h2 className="text-lg font-semibold mb-4">Band Arithmetic</h2>

      {/* Input Field */}
      <input
        type="text"
        className="w-full p-2 mb-4 rounded-lg bg-gray-800 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter calculation..."
        value={inputValue}
        readOnly
      />

      {/* Operation Buttons */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <button
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          onClick={() => handleInputChange("+")}
        >
          +
        </button>
        <button
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          onClick={() => handleInputChange("-")}
        >
          -
        </button>
        <button
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          onClick={() => handleInputChange("*")}
        >
          ×
        </button>
        <button
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          onClick={() => handleInputChange("/")}
        >
          ÷
        </button>
      </div>

      {/* Band Buttons */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <button
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          onClick={() => handleInputChange("MIR")}
        >
          MIR
        </button>
        <button
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          onClick={() => handleInputChange("SWIR")}
        >
          SWIR
        </button>
        <button
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          onClick={() => handleInputChange("TIR1")}
        >
          TIR1
        </button>
        <button
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          onClick={() => handleInputChange("TIR2")}
        >
          TIR2
        </button>
        <button
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          onClick={() => handleInputChange("VIS")}
        >
          VIS
        </button>
        <button
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          onClick={() => handleInputChange("UV")}
        >
          WV
        </button>
        {/* Bracket Buttons */}
        <button
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          onClick={() => handleInputChange("(")}
        >
          (
        </button>
        <button
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          onClick={() => handleInputChange(")")}
        >
          )
        </button>
      </div>

      {/* Enter and Clear Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500"
          onClick={handleCalculate}
        >
          Enter
        </button>
        <button
          className="p-2 rounded-lg bg-red-600 hover:bg-red-500"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default Tab2;


