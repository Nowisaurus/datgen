// src/components/SettingsModal.jsx
import React, { useEffect } from "react";

export default function SettingsModal({
  isOpen,
  selectedFormat,
  settings,
  setSettings,
  onClose,
}) {
  // Load default settings when format changes
  useEffect(() => {
    if (!selectedFormat) return;

    const defaults = {
      csv: { delimiter: ",", eol: "unix" },
      json: { jsonStructure: "simple", jsonIndent: 2 },
      sql: {
        dbType: "mysql",
        tableName: "my_table",
        dropTable: false,
        includeCreate: true,
        encloseNames: false,
        addPrimaryKey: false,
      },
      excel: { sheetName: "Sheet1" },
      html: { htmlBorder: 1, includeCss: true },
      yaml: { yamlIndent: 2 },
      javascript: { jsExportType: "module" },
      typescript: { tsExportType: "interface" },
      php: { phpArrayType: "associative" },
      python: { pythonStructure: "list" },
      ruby: { rubyType: "array" },
      "c#": { csClassName: "MyClass" },
    };

    setSettings((prev) => ({
      ...defaults[selectedFormat.toLowerCase()],
      ...prev, // keep universal settings
    }));
  }, [selectedFormat, setSettings]);

  if (!isOpen) return null;

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const formatLabel = (selectedFormat || "").toUpperCase();
  const inputClass =
    "w-full p-2 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-700";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-[650px] max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Settings - {formatLabel}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-white font-bold text-lg"
            aria-label="Close Settings"
          >
            ✕
          </button>
        </div>

        {/* Universal Settings */}
        <div className="mb-6 border-b border-gray-300 dark:border-gray-700 pb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Editor Settings
          </h3>

          {/* Line Wrapping */}
          <label className="flex items-center gap-2 text-gray-800 dark:text-gray-200 mb-2">
            <input
              type="checkbox"
              checked={settings?.lineWrap || false}
              onChange={(e) => updateSetting("lineWrap", e.target.checked)}
              className="accent-gray-500"
            />
            Enable Line Wrapping
          </label>

          {/* Line Numbers */}
          <label className="flex items-center gap-2 text-gray-800 dark:text-gray-200 mb-2">
            <input
              type="checkbox"
              checked={settings?.lineNumbers || false}
              onChange={(e) => updateSetting("lineNumbers", e.target.checked)}
              className="accent-gray-500"
            />
            Show Line Numbers
          </label>

          {/* Font Size */}
          <div className="flex flex-col gap-2 mb-2">
            <label className="text-gray-800 dark:text-gray-200">Font Size</label>
            <input
              type="range"
              min="10"
              max="24"
              step="1"
              value={settings?.fontSize || 14}
              onChange={(e) => updateSetting("fontSize", parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {settings?.fontSize || 14}px
            </span>
          </div>

          {/* Font Theme */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-800 dark:text-gray-200">Font Theme</label>
            <select
              value={settings?.fontTheme || "monospace"}
              onChange={(e) => updateSetting("fontTheme", e.target.value)}
              className={inputClass}
            >
              <option value="monospace">Monospace</option>
              <option value="serif">Serif</option>
              <option value="sans">Sans</option>
            </select>
          </div>
        </div>

        {/* Format-Specific Settings */}
        <div className="space-y-4">
          {/* CSV */}
          {selectedFormat === "csv" && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-gray-800 dark:text-gray-200">
                  Delimiter
                </label>
                <input
                  type="text"
                  value={settings?.delimiter || ","}
                  onChange={(e) => updateSetting("delimiter", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-800 dark:text-gray-200">
                  End of Line
                </label>
                <select
                  value={settings?.eol || "unix"}
                  onChange={(e) => updateSetting("eol", e.target.value)}
                  className={inputClass}
                >
                  <option value="unix">Unix (\n)</option>
                  <option value="windows">Windows (\r\n)</option>
                  <option value="mac">Mac (\r)</option>
                </select>
              </div>
            </>
          )}

          {/* JSON */}
          {selectedFormat === "json" && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-gray-800 dark:text-gray-200">
                  Data Structure
                </label>
                <select
                  value={settings?.jsonStructure || "simple"}
                  onChange={(e) => updateSetting("jsonStructure", e.target.value)}
                  className={inputClass}
                >
                  <option value="simple">Simple</option>
                  <option value="complex">Complex</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-800 dark:text-gray-200">
                  Indentation
                </label>
                <input
                  type="number"
                  min="0"
                  max="8"
                  value={settings?.jsonIndent || 2}
                  onChange={(e) => updateSetting("jsonIndent", e.target.value)}
                  className={inputClass}
                />
              </div>
            </>
          )}

          {/* SQL */}
          {selectedFormat === "sql" && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-gray-800 dark:text-gray-200">
                  Database Type
                </label>
                <select
                  value={settings?.dbType || "mysql"}
                  onChange={(e) => updateSetting("dbType", e.target.value)}
                  className={inputClass}
                >
                  <option value="mysql">MySQL</option>
                  <option value="postgres">PostgreSQL</option>
                  <option value="sqlite">SQLite</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-800 dark:text-gray-200">
                  Table Name
                </label>
                <input
                  type="text"
                  value={settings?.tableName || "my_table"}
                  onChange={(e) => updateSetting("tableName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { key: "dropTable", label: "Include DROP TABLE" },
                  { key: "includeCreate", label: "Include CREATE TABLE" },
                  { key: "encloseNames", label: "Enclose column names in quotes" },
                  { key: "addPrimaryKey", label: "Add Primary Key" },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-gray-800 dark:text-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={settings?.[key] || false}
                      onChange={(e) => updateSetting(key, e.target.checked)}
                      className="accent-gray-500"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </>
          )}

          {/* Add your other format-specific settings here (excel, html, yaml, etc.) */}
        </div>

        {/* Footer */}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
