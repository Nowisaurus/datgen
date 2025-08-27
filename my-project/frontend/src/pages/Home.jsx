// src/pages/Home.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import DataButton from "../components/FloatingButton";

export default function Home() {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const dataTypes = [
    "Name", "Phone", "Email", "Street Address",
    "Postal/Zip", "Region", "Country", "List",
    "Word", "Number", "Currency", "Alphanumeric"
  ];

  const dataFormats = [
    "JSON", "CSV", "SQL", "XML",
    "HTML", "JavaScript", "TypeScript", "PHP",
    "Perl", "C#", "Ruby", "Python"
  ];

  const handleTypeClick = (type) => {
    setSelectedTypes(selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type]);
  };

  const handleGenerate = () => {
    if (selectedTypes.length === 0 || !selectedFormat) {
      alert("Please select at least one data type and one format.");
      return;
    }
    navigate("/generator", { state: { selectedTypes, selectedFormat } });
  };

  // Exact same size for all buttons (responsive scaling)
  const buttonSizeClasses = `
    w-32 sm:w-36 md:w-40 lg:w-44 
    h-12 sm:h-14 md:h-16 lg:h-18
    rounded-lg
    px-3 sm:px-4 md:px-5
    py-2
    text-sm sm:text-base md:text-base lg:text-lg
    transition-all duration-200
    border border-gray-300 dark:border-gray-600
    bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100
    hover:bg-gray-200 dark:hover:bg-gray-600
    active:bg-gray-300 dark:active:bg-gray-500
    flex items-center justify-center
  `;

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}>
      {/* Navbar */}
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="max-w-[95vw] lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 text-gray-800 dark:text-gray-100">

        {/* Header */}
<div className="text-center mb-10 md:mb-12">
  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-snug">
    Generate Test Data. Easily.
  </h1>
  <p className="mt-4 sm:mt-5 text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl 
                max-w-2xl md:max-w-3xl mx-auto leading-relaxed">
    Select the data types you want and pick your output format.<br />
    Generate structured test data instantly, ready to use in your projects.
  </p>
</div>


        {/* Side-by-side Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">

          {/* Data Types */}
          <div className="text-center">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 md:mb-6">Choose Data Types</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {dataTypes.map((type) => (
                <DataButton
                  key={type}
                  label={type}
                  active={selectedTypes.includes(type)}
                  onClick={() => handleTypeClick(type)}
                  className={buttonSizeClasses}
                />
              ))}
            </div>
          </div>

          {/* Data Formats */}
          <div className="text-center mt-6 md:mt-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 md:mb-6">Choose Data Format</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {dataFormats.map((format) => (
                <DataButton
                  key={format}
                  label={format}
                  active={selectedFormat === format}
                  onClick={() => setSelectedFormat(format)}
                  className={buttonSizeClasses}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-8 md:mt-12 text-center">
          <button
            onClick={handleGenerate}
            className="px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 rounded-lg text-base sm:text-lg md:text-xl lg:text-2xl font-semibold shadow-lg
                       bg-gray-700 text-white hover:bg-gray-600 
                       dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors duration-200
                       w-full md:w-auto"
          >
            Generate!
          </button>
        </div>
      </div>
    </div>
  );
}
