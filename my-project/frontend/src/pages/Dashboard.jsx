// src/pages/Dashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import AuthModal from "../components/AuthModal";
import FieldSelector from "../components/FieldSelector";
import SettingsModal from "../components/SettingsModal";
import exportData from "../utils/exportData";

import Papa from "papaparse";
import * as XLSX from "xlsx";
import yaml from "js-yaml";
import { xml2js } from "xml-js";

export default function Dashboard() {
  const location = useLocation();
  const { selectedTypes = [], selectedFormat: formatFromHome = "csv" } =
    location.state || {};

  // TABLE 1: Field selector
  const [columns, setColumns] = useState([]);

  // TABLE 2: Editable
  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);

  // Limits
  const [importCount, setImportCount] = useState(0);

  // TABLE 3: Preview
  const [previewData, setPreviewData] = useState([]);
  const [previewSettings, setPreviewSettings] = useState({
    format: formatFromHome,
    fontSize: 14,
    fontTheme: "monospace",
  });
const fontFamilies = {
  monospace: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  courier: "'Courier New', Courier, monospace",
  consolas: "Consolas, 'Courier New', monospace",
  ubuntu: "'Ubuntu Mono', monospace",
  roboto: "'Roboto Mono', monospace",
  serif: "serif",
  sans: "sans-serif",
};
  // UI
  const [darkMode, setDarkMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode] = useState("login");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fileInputRef = useRef();

  // Initialize columns from Home selections
  useEffect(() => {
    if (selectedTypes.length > 0) {
      const mappedColumns = selectedTypes.map((type) => ({
        name: type,
        type: "string",
      }));
      setColumns(mappedColumns);

      if (data.length === 0) {
        const empty = {};
        mappedColumns.forEach((c) => (empty[c.name] = ""));
        setData([empty]);
        setPreviewData([empty]);
        setRowCount(1);
      }
    }
  }, [selectedTypes]); // eslint-disable-line

  // --- Limits & Actions ---
  const upsell = (msg) => {
    alert(
      `${msg}\n\nUpgrade options:\n• +1000 rows\n• +2000 rows\n• Unlimited rows\n\nImports:\n• 10 imports\n• Unlimited imports`
    );
    setShowAuth(true);
  };

  const handleAddRow = () => {
    if (rowCount >= 500) {
      upsell("Free row limit (500) reached.");
      return;
    }
    const newRow = {};
    columns.forEach((c) => (newRow[c.name] = ""));
    const next = [...data, newRow];
    setData(next);
    setPreviewData(next);
    setRowCount((n) => n + 1);
  };

  const handleRowCountInput = (val) => {
    const n = Number(val);
    if (Number.isNaN(n) || n < 0) return;
    if (n > 500) {
      upsell("Free users can only use up to 500 rows.");
      return;
    }
    const next = [...data];
    if (n > next.length) {
      for (let i = next.length; i < n; i++) {
        const empty = {};
        columns.forEach((c) => (empty[c.name] = ""));
        next.push(empty);
      }
    } else {
      next.length = n;
    }
    setRowCount(n);
    setData(next);
    setPreviewData(next);
  };

  // --- Import ---
  const handleImportClick = () => {
    if (importCount >= 3) {
      upsell("Free trial import limit reached (3 files).");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = (ev) => {
      const content = ev.target.result;
      let parsed = [];

      try {
        if (ext === "csv") {
          const result = Papa.parse(content, { header: true });
          parsed = result.data.filter((r) => Object.keys(r).length > 0);
        } else if (ext === "json") {
          const j = JSON.parse(content);
          parsed = Array.isArray(j) ? j : [j];
        } else if (ext === "xlsx") {
          const wb = XLSX.read(content, { type: "binary" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          parsed = XLSX.utils.sheet_to_json(ws);
        } else if (ext === "xml") {
          const obj = xml2js(content, { compact: true });
          const rows = obj?.rows?.row;
          if (Array.isArray(rows)) {
            parsed = rows.map((r) => {
              const out = {};
              Object.entries(r).forEach(([k, v]) => {
                if (k === "_attributes" || k === "_text") return;
                out[k] = v?._text ?? v?._cdata ?? "";
              });
              return out;
            });
          } else if (rows && typeof rows === "object") {
            const out = {};
            Object.entries(rows).forEach(([k, v]) => {
              if (k === "_attributes" || k === "_text") return;
              out[k] = v?._text ?? v?._cdata ?? "";
            });
            parsed = [out];
          }
        } else if (ext === "yaml" || ext === "yml") {
          const y = yaml.load(content);
          parsed = Array.isArray(y) ? y : [y];
        } else {
          alert("Unsupported file type.");
          return;
        }
      } catch (err) {
        alert("❌ Failed to parse file: " + err.message);
        return;
      }

      if (!parsed || parsed.length === 0) {
        alert("No rows found in the imported file.");
        return;
      }

      const keys = Object.keys(parsed[0] || {});
      if (keys.length > 0) {
        setColumns(keys.map((k) => ({ name: k, type: "string" })));
      }

      setData(parsed);
      setPreviewData(parsed);
      setRowCount(parsed.length);

      setImportCount((n) => n + 1);
      e.target.value = "";
    };

    if (ext === "xlsx") reader.readAsBinaryString(file);
    else reader.readAsText(file);
  };

  // --- Preview ---
  const handleSaveSettings = () => {
    alert("Settings saved ✅");
  };

  const handleDownload = () => {
    if (!previewData || previewData.length === 0) {
      alert("No data to download.");
      return;
    }
    exportData(previewData, previewSettings.format);
  };

  return (
    <div className={`${darkMode ? "dark" : ""} font-sans`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

        <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-[95vw] lg:max-w-7xl mx-auto flex flex-col gap-6">
          {/* Row 1: Field Selector + Editable */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Table 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border w-full lg:w-1/3">
              <h2 className="text-xl font-bold mb-2">Table 1: Field Selector</h2>
              <FieldSelector
                selectedColumns={columns}
                setSelectedColumns={setColumns}
              />
            </div>

            {/* Table 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border w-full lg:w-2/3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">Table 2: Editable Data</h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm">Rows:</label>
                  <input
                    type="number"
                    min={0}
                    value={rowCount}
                    onChange={(e) => handleRowCountInput(e.target.value)}
                    className="w-24 p-1 border rounded text-black"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImport}
                    accept=".csv,.json,.xlsx,.xml,.yaml,.yml"
                    className="hidden"
                  />
                  <button
  onClick={handleImportClick}
  className="
    px-3 py-1 rounded-lg text-sm font-medium
    bg-gray-200 hover:bg-gray-300 text-gray-900
    dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100
    transition-colors duration-200
  "
>
  📂 Import
</button>

<button
  onClick={handleAddRow}
  className="
    px-3 py-1 rounded-lg text-sm font-medium
    bg-gray-200 hover:bg-gray-300 text-gray-900
    dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100
    transition-colors duration-200
  "
>
  ➕ Add Row
</button>

                </div>
              </div>

              <table className="w-full text-sm border">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.name} className="border p-2 bg-gray-100">
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {columns.map((col) => (
                        <td key={col.name} className="border p-2">
                          <input
                            type="text"
                            value={row[col.name] ?? ""}
                            onChange={(e) => {
                              const next = [...data];
                              next[rIdx][col.name] = e.target.value;
                              setData(next);
                              setPreviewData(next);
                            }}
                            className={`w-full p-1 rounded ${
                              darkMode
                                ? "bg-gray-700 text-gray-100"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-2 text-xs text-gray-500">
                Free plan: up to 500 rows. Upgrade for more.
              </p>
              <p className="text-xs text-gray-500">
                Imports: {importCount}/3 used. Upgrade for 10+ or unlimited.
              </p>
            </div>
          </div>

          {/* Row 2: Table 3 Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border w-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">Table 3: Preview</h2>
              <div className="flex items-center gap-2">
                <select
                  value={previewSettings.format}
                  onChange={(e) =>
                    setPreviewSettings((s) => ({ ...s, format: e.target.value }))
                  }
                  className="p-2 border rounded text-black"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="xlsx">Excel</option>
                  <option value="sql">SQL</option>
                  <option value="xml">XML</option>
                  <option value="yaml">YAML</option>
                  <option value="html">HTML</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="php">PHP</option>
                  <option value="python">Python</option>
                  <option value="ruby">Ruby</option>
                  <option value="csharp">C#</option>
                </select>
                <button
  onClick={handleSaveSettings}
  className="
    px-3 py-1 rounded-lg text-sm font-medium
    bg-gray-200 hover:bg-gray-300 text-gray-900
    dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100
    transition-colors duration-200
  "
>
  💾 Save Settings
</button>

<button
  onClick={handleDownload}
  className="
    px-3 py-1 rounded-lg text-sm font-medium
    bg-gray-200 hover:bg-gray-300 text-gray-900
    dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100
    transition-colors duration-200
  "
>
  ⬇️ Download
</button>

<button
  onClick={() => setSettingsOpen(true)}
  className="
    px-3 py-1 rounded-lg text-sm font-medium
    bg-gray-200 hover:bg-gray-300 text-gray-900
    dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100
    transition-colors duration-200
  "
>
  ⚙️ Settings
</button>

              </div>
            </div>

            {/* Preview content */}
<div
  className="border rounded p-2 overflow-auto"
  style={{
    fontSize: `${previewSettings.fontSize}px`,
    fontFamily: fontFamilies[previewSettings.fontTheme] || fontFamilies.monospace,
  }}
>
  <pre>{JSON.stringify(previewData, null, 2)}</pre>
</div>
          </div>
        </div>

        {/* Modals */}
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          defaultMode={authMode}
        />
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          selectedFormat={previewSettings.format}
          settings={previewSettings}
          setSettings={setPreviewSettings}
        />
      </div>
    </div>
  );
}
