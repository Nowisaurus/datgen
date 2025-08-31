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
  const [openCategory, setOpenCategory] = useState(null);
  const [modalField, setModalField] = useState(null);
  const [tempFieldData, setTempFieldData] = useState({});

  const openModal = (field) => {
    const fieldData = selectedColumns.find((col) => col.name === field);
    if (fieldData) {
      setTempFieldData({ ...fieldData });
    } else {
      setTempFieldData({
        name: field,
        alias: field,
        type: "string",
        value: "",
        options: [],
        min: 0,
        max: 100,
        mean: 0,
        stddev: 1,
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
 
  return (
    <div className="h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(DATA_CATEGORIES).map(([category, fields]) => (
          <div
            key={category}
            className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow p-4 border border-gray-300 dark:border-gray-700"
          >
            <button
              className={`
                w-full flex justify-between items-center font-semibold text-lg mb-2 px-4 py-2 rounded-xl 
                transition-all duration-300 border 
                bg-gray-200 dark:bg-gray-700 
                text-gray-900 dark:text-gray-100 
                border-gray-300 dark:border-gray-600 
                hover:bg-gray-300 dark:hover:bg-gray-600 
                hover:text-gray-900 dark:hover:text-gray-100
              `}
              onClick={() =>
                setOpenCategory(openCategory === category ? null : category)
              }
            >
              {category} <span>{openCategory === category ? "−" : "+"}</span>
            </button>

            {openCategory === category && (
              <div className="flex flex-col gap-3">
                {fields.map((field) => {
                  const isSelected = selectedColumns.some(col => col.name === field);
                  return (
                    <div key={field} className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(field)}
                        className={`
                          px-3 py-2 rounded-xl text-sm border transition-all transform duration-200 shadow-sm hover:shadow-md
                          ${
                            isSelected
                              ? "bg-gray-400 dark:bg-gray-600 text-gray-100 dark:text-gray-200 border-gray-500 dark:border-gray-500 scale-105"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600"
                          }
                        `}
                      >
                        {field}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {modalField && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-gray-100 dark:bg-gray-500 rounded-2xl shadow-lg p-6 w-[90%] sm:w-[550px] max-h-[80vh] overflow-y-auto border border-gray-300 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-600 dark:text-gray-100">
              {selectedColumns.some((col) => col.name === modalField) ? "Edit Field" : "Add Field"}: {modalField}
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-700 dark:text-gray-300 font-medium">Alias</label>
                <input
                  type="text"
                  value={tempFieldData.alias}
                  onChange={(e) => setTempFieldData({...tempFieldData, alias: e.target.value})}
                  className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="text-gray-700 dark:text-gray-300 font-medium">Type</label>
                <select
                  value={tempFieldData.type}
                  onChange={(e) => setTempFieldData({...tempFieldData, type: e.target.value})}
                  className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {["list", "weighted list"].includes(tempFieldData.type) && (
                <div>
                  <label className="text-gray-700 dark:text-gray-300 font-medium">Options (comma-separated)</label>
                  <input
                    type="text"
                    value={tempFieldData.options.join(",")}
                    onChange={(e) =>
                      setTempFieldData({
                        ...tempFieldData,
                        options: e.target.value.split(",").map(s => s.trim())
                      })
                    }
                    className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              )}

              {tempFieldData.type === "constant" && (
                <div>
                  <label className="text-gray-700 dark:text-gray-300 font-medium">Constant Value</label>
                  <input
                    type="text"
                    value={tempFieldData.value}
                    onChange={(e) => setTempFieldData({...tempFieldData, value: e.target.value})}
                    className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              )}

              {tempFieldData.type === "color" && (
                <div>
                  <label className="text-gray-700 dark:text-gray-300 font-medium">Color</label>
                  <input
                    type="color"
                    value={tempFieldData.value || "#000000"}
                    onChange={(e) => setTempFieldData({...tempFieldData, value: e.target.value})}
                    className="w-full h-10 p-1 border rounded-lg bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                    className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalField(null)}
                className="px-4 py-2 rounded-lg border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveModal}
                className="px-4 py-2 rounded-lg border border-gray-500 dark:border-gray-400 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm hover:shadow-md transition-all font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
