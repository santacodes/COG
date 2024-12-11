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
          {/* New Map Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 21l-5-2.5V5l5 2.5M8 21l8-4M8 7.5l8-4M16 3l5 2.5v13l-5 2.5M8 7.5v13"
            />
          </svg>
        </button>
        <button
          className={`flex items-center justify-center w-12 h-12 rounded-lg transition ${
            activeTab === "tab3"
              ? "bg-gray-600 hover:bg-gray-700 shadow-md"
              : "bg-gray-800 hover:bg-gray-700 shadow-md"
          }`}
          onClick={() => setActiveTab("tab3")}
        >
          {/* Tech Stack Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
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




