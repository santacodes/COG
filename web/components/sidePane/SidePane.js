"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamic imports for tabs
const Tab1 = dynamic(() => import("../Tabs/Tab1"));


const SidePane = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <div className="flex flex-col w-64 h-screen bg-gray-900 text-gray-300 shadow-lg overflow-hidden">
      {/* Navigation Section */}
      <nav className="flex flex-row justify-center space-x-4 p-4 bg-gray-900">
        <button
          className={`flex items-center justify-center w-12 h-12 rounded-lg transition ${
            activeTab === "tab1"
              ? "bg-gray-600 hover:bg-gray-700 shadow-md"
              : "bg-gray-800 hover:bg-gray-700 shadow-md"
          }`}
          onClick={() => setActiveTab("tab1")}
        >
          <img
            src="/images/icon1.jpeg"
            alt="Layers"
            className="w-6 h-6"
          />
        </button>
        <button
          className={`flex items-center justify-center w-12 h-12 rounded-lg transition ${
            activeTab === "tab3"
              ? "bg-gray-600 hover:bg-gray-700 shadow-md"
              : "bg-gray-800 hover:bg-gray-700 shadow-md"
          }`}
          onClick={() => setActiveTab("tab3")}
        >
          <img
            src="/images/icon2.jpeg"
            alt="Cube"
            className="w-6 h-6"
          />
        </button>
      </nav>

      {/* Tab Content Section */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
        {activeTab === "tab1" && <Tab1 />}
        {activeTab === "tab3" && <Tab3 />}
      </div>
    </div>
  );
};

export default SidePane;
