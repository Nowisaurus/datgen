// src/components/FieldSelector.jsx
import React, { useState } from "react";

const DATA_CATEGORIES = {
  Human: ["Name", "Email", "Phone", "Date", "Company"],
  Geo: ["Address", "Postal/Zip", "City", "Country", "Latitude", "Longitude", "Region"],
  Text: ["Fixed Words", "Random Words"],
  Numeric: ["Boolean", "Alphanumeric", "Auto Increment", "Number Range", "Normal Distribution", "GUID"],
  Financial: ["Currency", "IBAN", "Credit Card", "CVV", "PIN", "Track1", "Track2"],
  Other: ["Constant", "Computed", "List", "Weighted List", "Colour", "URL"],
  "Country-Specific": ["Chilean RUT"],
};

const FIELD_TYPES = [
  "string","number","boolean","alphanumeric","date","auto increment",
  "list","weighted list","constant","uuid","color","url","number range","normal distribution",
];

export default function FieldSelector({ selectedColumns, setSelectedColumns }) {
  // State to track the currently active category. Defaults to the first one.
  const [activeCategory, setActiveCategory] = useState(Object.keys(DATA_CATEGORIES)[0]);
  
  const [modalField, setModalField] = useState(null);
  const [tempFieldData, setTempFieldData] = useState({});

  const openModal = (field) => {
    const fieldData = selectedColumns.find((col) => col.name === field);
    if (fieldData) {
      setTempFieldData({ ...fieldData });
    } else {
      setTempFieldData({
        name: field, alias: field, type: "string", value: "", options: [],
        min: 0, max: 100, mean: 0, stddev: 1,
      });
    }
    setModalField(field);
  };

  const saveModal = () => {
    const exists = selectedColumns.some((col) => col.name === tempFieldData.name);
    if (exists) {
      setSelectedColumns((prev) =>
        prev.map((col) =>
          col.name === tempFieldData.name ? { ...tempFieldData } : col
        )
      );
    } else {
      setSelectedColumns([...selectedColumns, { ...tempFieldData }]);
    }
    setModalField(null);
  };

  // ✅ [FIX] Define the exact same reusable button styles as in Dashboard.jsx
  const buttonBaseStyle = "px-3 py-2 rounded-lg border transition-all duration-200 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600";
  const buttonActiveStyle = "bg-blue-600 text-white border-blue-700 scale-105 shadow-lg";
  
  return (
    // ✅ [FIX] New layout with two separate button grids
    <div className="flex flex-col gap-6">
      
      {/* 1. Category Buttons */}
      <div>
        <h3 className="text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {Object.keys(DATA_CATEGORIES).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              // Apply the consistent styles
              className={`${buttonBaseStyle} ${
                activeCategory === category ? buttonActiveStyle : ""
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Field Buttons */}
      <div>
        <h3 className="text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Fields for "{activeCategory}"
        </h3>
        <div className="flex flex-wrap gap-2">
          {DATA_CATEGORIES[activeCategory].map((field) => {
            const isSelected = selectedColumns.some(col => col.name === field);
            return (
              <div key={field}>
                <button
                  onClick={() => openModal(field)}
                  // Apply the consistent styles
                  className={`${buttonBaseStyle} ${
                    isSelected ? buttonActiveStyle : ""
                  }`}
                >
                  {field}
                </button>
              </div>
            );
          })}
        </div>
      </div>


      {/* Field Settings Modal */}
      {modalField && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-500 rounded-2xl shadow-lg p-6 w-[90%] sm:w-[550px] max-h-[80vh] overflow-y-auto border border-gray-300 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-600 dark:text-gray-100">
              {selectedColumns.some((col) => col.name === modalField) ? "Edit Field" : "Add Field"}: {modalField}
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-700 dark:text-gray-300 font-medium">Alias</label>
                <input type="text" value={tempFieldData.alias} onChange={(e) => setTempFieldData({...tempFieldData, alias: e.target.value})} className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-gray-700 dark:text-gray-300 font-medium">Type</label>
                <select value={tempFieldData.type} onChange={(e) => setTempFieldData({...tempFieldData, type: e.target.value})} className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {FIELD_TYPES.map((type) => (<option key={type} value={type}>{type}</option>))}
                </select>
              </div>
              {["list", "weighted list"].includes(tempFieldData.type) && (
                <div>
                  <label className="text-gray-700 dark:text-gray-300 font-medium">Options (comma-separated)</label>
                  <input type="text" value={tempFieldData.options.join(",")} onChange={(e) => setTempFieldData({...tempFieldData, options: e.target.value.split(",").map(s => s.trim())})} className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
              {tempFieldData.type === "constant" && (
                <div>
                  <label className="text-gray-700 dark:text-gray-300 font-medium">Constant Value</label>
                  <input type="text" value={tempFieldData.value} onChange={(e) => setTempFieldData({...tempFieldData, value: e.target.value})} className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
               {tempFieldData.type === "color" && (
                <div>
                  <label className="text-gray-700 dark:text-gray-300 font-medium">Color</label>
                  <input
                    type="color"
                    value={tempFieldData.value || "#000000"}
                    onChange={(e) => setTempFieldData({...tempFieldData, value: e.target.value})}
                    className="w-full h-10 p-1 border rounded-lg bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {tempFieldData.type === "url" && (
                <div>
                  <label className="text-gray-700 dark:text-gray-300 font-medium">URL</label>
                  <input
                    type="text"
                    value={tempFieldData.value || ""}
                    onChange={(e) => setTempFieldData({...tempFieldData, value: e.target.value})}
                    className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalField(null)} className="px-4 py-2 rounded-lg border bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={saveModal} className="px-4 py-2 rounded-lg border bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}