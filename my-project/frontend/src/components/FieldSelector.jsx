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

export default function FieldSelector({ selectedColumns, setSelectedColumns = false }) {
  const [openCategory, setOpenCategory] = useState(null);
  const [modalField, setModalField] = useState(null);
  const [tempFieldData, setTempFieldData] = useState({});

  const toggleColumn = (field) => {
    const exists = selectedColumns.some((col) => col.name === field);
    if (exists) {
      setSelectedColumns(selectedColumns.filter((col) => col.name !== field));
    } else {
      setSelectedColumns([
        ...selectedColumns,
        {
          name: field,
          alias: field,
          type: "string",
          value: "",
          options: [],
          min: 0,
          max: 100,
          mean: 0,
          stddev: 1,
        },
      ]);
    }
  };

  const openModal = (field) => {
    const fieldData = selectedColumns.find((col) => col.name === field);
    if (!fieldData) return;
    setTempFieldData({ ...fieldData });
    setModalField(fieldData);
  };

  const saveModal = () => {
    setSelectedColumns((prev) =>
      prev.map((col) => (col.name === modalField.name ? { ...tempFieldData } : col))
    );
    setModalField(null);
  };

  return (
    <div className="h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(DATA_CATEGORIES).map(([category, fields]) => (
          <div
            key={category}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border border-gray-200 dark:border-gray-700"
          >
            <button
              className="w-full flex justify-between items-center font-semibold text-lg mb-2 transition-colors duration-300 hover:text-gray-700 dark:hover:text-gray-300 text-gray-900 dark:text-gray-100"
              onClick={() => setOpenCategory(openCategory === category ? null : category)}
            >
              {category} <span>{openCategory === category ? "−" : "+"}</span>
            </button>

            {openCategory === category && (
              <div className="flex flex-col gap-3">
                {fields.map((field) => {
                  const isSelected = selectedColumns.some((col) => col.name === field);
                  return (
                    <div key={field} className="flex items-center gap-2">
                      <button
                        onClick={() => toggleColumn(field)}
                        className={`px-3 py-2 rounded-xl text-sm border transition-all transform duration-200 shadow-sm hover:shadow-lg ${
                          isSelected
                            ? "bg-gray-800 dark:bg-gray-600 text-white scale-105"
                            : `bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600`
                        }`}
                      >
                        {field}
                      </button>
                      {isSelected && (
                        <button
                          onClick={() => openModal(field)}
                          className="px-2 py-1 text-sm bg-blue-500 text-white rounded shadow hover:shadow-lg hover:bg-blue-600 transition-all"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Floating Modal */}
      {modalField && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-[90%] sm:w-[550px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Edit Field: {modalField.name}
            </h2>

            <div className="flex flex-col gap-4">
              {/* Alias */}
              <div>
                <label className="text-gray-700 dark:text-gray-200 font-medium">Alias</label>
                <input
                  type="text"
                  value={tempFieldData.alias}
                  onChange={(e) =>
                    setTempFieldData({ ...tempFieldData, alias: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-lg transition-all"
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-gray-700 dark:text-gray-200 font-medium">Type</label>
                <select
                  value={tempFieldData.type}
                  onChange={(e) =>
                    setTempFieldData({ ...tempFieldData, type: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-lg transition-all"
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type-specific settings */}
              {["list", "weighted list"].includes(tempFieldData.type) && (
                <div>
                  <label className="text-gray-700 dark:text-gray-200 font-medium">
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tempFieldData.options.join(",")}
                    onChange={(e) =>
                      setTempFieldData({
                        ...tempFieldData,
                        options: e.target.value.split(",").map((s) => s.trim()),
                      })
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-lg transition-all"
                  />
                </div>
              )}

              {tempFieldData.type === "constant" && (
                <div>
                  <label className="text-gray-700 dark:text-gray-200 font-medium">
                    Constant Value
                  </label>
                  <input
                    type="text"
                    value={tempFieldData.value}
                    onChange={(e) =>
                      setTempFieldData({ ...tempFieldData, value: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-lg transition-all"
                  />
                </div>
              )}

              {tempFieldData.type === "color" && (
                <div>
                  <label className="text-gray-700 dark:text-gray-200 font-medium">Color</label>
                  <input
                    type="color"
                    value={tempFieldData.value || "#000000"}
                    onChange={(e) =>
                      setTempFieldData({ ...tempFieldData, value: e.target.value })
                    }
                    className="w-full h-10 p-1 border rounded-lg dark:border-gray-600 shadow-sm hover:shadow-lg transition-all"
                  />
                </div>
              )}

              {tempFieldData.type === "url" && (
                <div>
                  <label className="text-gray-700 dark:text-gray-200 font-medium">URL</label>
                  <input
                    type="text"
                    value={tempFieldData.value || ""}
                    onChange={(e) =>
                      setTempFieldData({ ...tempFieldData, value: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-lg transition-all"
                  />
                </div>
              )}

              {tempFieldData.type === "number range" && (
                <div className="flex gap-2">
                  <div>
                    <label className="text-gray-700 dark:text-gray-200 font-medium">Min</label>
                    <input
                      type="number"
                      value={tempFieldData.min || 0}
                      onChange={(e) =>
                        setTempFieldData({ ...tempFieldData, min: Number(e.target.value) })
                      }
                      className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-lg transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 dark:text-gray-200 font-medium">Max</label>
                    <input
                      type="number"
                      value={tempFieldData.max || 100}
                      onChange={(e) =>
                        setTempFieldData({ ...tempFieldData, max: Number(e.target.value) })
                      }
                      className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-lg transition-all"
                    />
                  </div>
                </div>
              )}

              {tempFieldData.type === "normal distribution" && (
                <div className="flex gap-2">
                  <div>
                    <label className="text-gray-700 dark:text-gray-200 font-medium">Mean</label>
                    <input
                      type="number"
                      value={tempFieldData.mean || 0}
                      onChange={(e) =>
                        setTempFieldData({ ...tempFieldData, mean: Number(e.target.value) })
                      }
                      className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-lg transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 dark:text-gray-200 font-medium">Std Dev</label>
                    <input
                      type="number"
                      value={tempFieldData.stddev || 1}
                      onChange={(e) =>
                        setTempFieldData({ ...tempFieldData, stddev: Number(e.target.value) })
                      }
                      className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white shadow-sm hover:shadow-lg transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalField(null)}
                className="px-4 py-2 rounded-lg border border-gray-400 text-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm hover:shadow-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveModal}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-lg transition-all"
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
