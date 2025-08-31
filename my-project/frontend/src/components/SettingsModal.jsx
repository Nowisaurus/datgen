// src/components/SettingsModal.jsx
import React, { useEffect, useState } from "react";

// Font families for the editor
const FONT_FAMILIES = {
  monospace:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  courier: "'Courier New', Courier, monospace",
  consolas: "Consolas, 'Courier New', monospace",
  ubuntu: "'Ubuntu Mono', monospace",
  roboto: "'Roboto Mono', monospace",
  serif: "serif",
  sans: "sans-serif",
};

export default function SettingsModal({
  isOpen,
  selectedFormat,
  settings,
  setSettings,
  onClose,
}) {
  const [openSection, setOpenSection] = useState("editor");

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
      ...prev,
    }));

    setOpenSection(selectedFormat); 
  }, [selectedFormat, setSettings]);

  if (!isOpen) return null;

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const formatLabel = (selectedFormat || "").toUpperCase();
  const inputClass =
    "w-full p-2 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-700 text-sm";

  // Collapsible section component
  const Section = ({ id, title, children }) => (
    <div className="border rounded-lg dark:border-gray-700">
      <button
        onClick={() => setOpenSection(openSection === id ? null : id)}
        className="w-full flex justify-between items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium rounded-t-lg"
      >
        {title}
        <span>{openSection === id ? "▾" : "▸"}</span>
      </button>
      {openSection === id && (
        <div className="p-3 bg-white dark:bg-gray-900 space-y-3">{children}</div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-5 w-[500px] max-h-[85vh] overflow-y-auto relative space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Settings – {formatLabel}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-bold text-lg"
            aria-label="Close Settings"
          >
            ✕
          </button>
        </div>

        {/* Sections */}
        <Section id="editor" title="Editor Settings">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={settings?.lineWrap || false}
              onChange={(e) => updateSetting("lineWrap", e.target.checked)}
              className="accent-gray-500"
            />
            Enable Line Wrapping
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={settings?.lineNumbers || false}
              onChange={(e) => updateSetting("lineNumbers", e.target.checked)}
              className="accent-gray-500"
            />
            Show Line Numbers
          </label>
          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Font Size (px)
            </label>
            <input
              type="number"
              min="10"
              max="24"
              step="1"
              value={settings?.fontSize || 14}
              onChange={(e) =>
                updateSetting("fontSize", parseInt(e.target.value) || 14)
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300">
  Font Theme
</label>
<select
  value={settings?.fontTheme || "monospace"}
  onChange={(e) => updateSetting("fontTheme", e.target.value)}
  className={inputClass}
>
  {Object.keys(FONT_FAMILIES).map((fontKey) => (
    <option key={fontKey} value={fontKey}>
      {fontKey.charAt(0).toUpperCase() + fontKey.slice(1)}
    </option>
  ))}
</select>

          </div>
        </Section>

        {/* CSV */}
        {selectedFormat === "csv" && (
          <Section id="csv" title="CSV Settings">
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Delimiter
              </label>
              <input
                type="text"
                value={settings?.delimiter || ","}
                onChange={(e) => updateSetting("delimiter", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300">
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
          </Section>
        )}

        {/* JSON */}
        {selectedFormat === "json" && (
          <Section id="json" title="JSON Settings">
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300">
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
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Indentation
              </label>
              <input
                type="number"
                min="0"
                max="8"
                value={settings?.jsonIndent || 2}
                onChange={(e) =>
                  updateSetting("jsonIndent", parseInt(e.target.value) || 2)
                }
                className={inputClass}
              />
            </div>
          </Section>
        )}

        {/* SQL */}
        {selectedFormat === "sql" && (
          <Section id="sql" title="SQL Settings">
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300">
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
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Table Name
              </label>
              <input
                type="text"
                value={settings?.tableName || "my_table"}
                onChange={(e) => updateSetting("tableName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              {[
                { key: "dropTable", label: "Include DROP TABLE" },
                { key: "includeCreate", label: "Include CREATE TABLE" },
                { key: "encloseNames", label: "Enclose column names in quotes" },
                { key: "addPrimaryKey", label: "Add Primary Key" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
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
          </Section>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
