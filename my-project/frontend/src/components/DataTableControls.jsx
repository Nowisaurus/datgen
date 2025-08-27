import React, { useState } from "react";
import { FiUpload, FiDownload, FiPlus, FiEye } from "react-icons/fi";

export default function DataTableControls({
  generateRows,
  handleImport,
  downloadDataHandler,
  handlePreviewClick,
  darkMode,
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [rowCount, setRowCount] = useState(1);

  const containerBg = darkMode ? "bg-gray-800" : "bg-gray-100";
  const buttonBg = darkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-400 hover:bg-gray-300";
  const buttonText = darkMode ? "text-gray-100" : "text-gray-900";
  const inputBg = darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-gray-200 border-gray-400 text-gray-900";

  return (
    <div className="fixed top-1/4 right-4 flex flex-col items-center gap-3 z-30">
      {/* Buttons */}
      <button
        onClick={() => setShowAddModal(true)}
        className={`p-3 rounded ${buttonBg} ${buttonText}`}
        title="Add Row"
      >
        <FiPlus size={20} />
      </button>

      <label className={`p-3 rounded cursor-pointer ${buttonBg} ${buttonText}`} title="Import">
        <FiUpload size={20} />
        <input
          type="file"
          accept=".json,.csv,.txt"
          onChange={handleImport}
          className="hidden"
        />
      </label>

      <button
        onClick={() => downloadDataHandler("json")}
        className={`p-3 rounded ${buttonBg} ${buttonText}`}
        title="Download"
      >
        <FiDownload size={20} />
      </button>

      <button
        onClick={handlePreviewClick}
        className={`p-3 rounded ${buttonBg} ${buttonText}`}
        title="Preview"
      >
        <FiEye size={20} />
      </button>

      {/* Add Row Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className={`p-6 rounded-lg ${containerBg} ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
            <h3 className="text-lg font-semibold mb-4">Add Rows</h3>
            <input
              type="number"
              min="1"
              value={rowCount}
              onChange={(e) => setRowCount(Number(e.target.value))}
              className={`w-24 p-2 rounded border ${inputBg}`}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { generateRows(rowCount); setShowAddModal(false); }}
                className={`px-3 py-1 rounded ${buttonBg} ${buttonText}`}
              >
                Add
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className={`px-3 py-1 rounded ${buttonBg} ${buttonText}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
