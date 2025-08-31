// src/components/DataTable.jsx
import React, { useState } from "react";
import { FiDownload, FiUpload } from "react-icons/fi";
import jsyaml from "js-yaml";
import { importFile } from "../utils/importer";

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

const FORMATS = [
  "csv",
  "json",
  "sql",
  "excel",
  "html",
  "yaml",
  "javascript",
  "typescript",
  "php",
  "python",
  "ruby",
  "c#",
];

export default function DataTable({ darkMode = false }) {
  const [userPlan] = useState("free"); // free/paid/sub
  const [columns, setColumns] = useState([
    { name: "Name", type: "string" },
    { name: "Email", type: "string" },
    { name: "Age", type: "number" },
  ]);
  const [data, setData] = useState([]);
  const [templateData, setTemplateData] = useState([]); // for template table
  const [rowInput, setRowInput] = useState("");
  const [warning, setWarning] = useState("");
  const [previewSettings, setPreviewSettings] = useState({
    format: "csv",
    fontSize: 14,
    fontTheme: "monospace",
    showLineNumbers: false,
    wrapLines: false,
  });

  const updateSetting = (key, value) => {
    setPreviewSettings((prev) => ({ ...prev, [key]: value }));
  };

  // --- Actions ---
  const handleGenerateRows = () => {
    const count = parseInt(rowInput, 10);
    if (!count || count <= 0) return;

    const maxRows = userPlan === "free" ? 500 : 1000;
    if (data.length + count > maxRows) {
      setWarning(`⚠️ ${userPlan} plan allows max ${maxRows} rows.`);
      return;
    } else setWarning("");

    const newRows = Array.from({ length: count }, () => {
      const emptyRow = {};
      columns.forEach((col) => (emptyRow[col.name] = ""));
      return emptyRow;
    });

    setData([...data, ...newRows]);
    setRowInput("");
  };

  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.json,.xlsx,.xls,.yaml,.yml,.xml";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      importFile(file, userPlan, ({ data: imported, columns }) => {
        setData(imported);
        setColumns(columns);

        if (userPlan === "free" && imported.length > 3)
          setWarning("⚠️ Free plan only imports up to 3 rows. Upgrade to unlock more.");
        else if (userPlan === "paid" && imported.length > 10)
          setWarning("⚠️ Paid plan only imports up to 10 rows. Subscribe for unlimited.");
        else setWarning("");
      });
    };

    input.click();
  };

  const handleDownload = () => {
    // Combine main data + templateData
    const combinedData = [...templateData, ...data];
    const blob = new Blob([formatData(combinedData, previewSettings.format)], {
      type: "text/plain;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `data.${previewSettings.format}`;
    link.click();
  };

  const formatData = (data, format) => {
    if (!data || data.length === 0) return "";

    switch (format) {
      case "csv": {
        const headers = Object.keys(data[0]);
        const rows = data.map((row) => headers.map((h) => row[h]));
        return [headers, ...rows].map((r) => r.join(",")).join("\n");
      }
      case "excel": {
        const headers = Object.keys(data[0]);
        const rows = data.map((row) => headers.map((h) => row[h]));
        return [headers, ...rows].map((r) => r.join("\t")).join("\n");
      }
      case "json":
        return JSON.stringify(data, null, 2);
      case "sql": {
        const tableName = "my_table";
        return data
          .map((row) => {
            const cols = Object.keys(row).map((c) => `\`${c}\``).join(", ");
            const vals = Object.values(row)
              .map((v) => (typeof v === "string" ? `'${v}'` : v))
              .join(", ");
            return `INSERT INTO ${tableName} (${cols}) VALUES (${vals});`;
          })
          .join("\n");
      }
      case "yaml":
        try {
          return jsyaml.dump(data);
        } catch {
          return "YAML formatting failed";
        }
      case "html":
        return `<table>\n${data
          .map(
            (row) =>
              "<tr>" +
              Object.values(row)
                .map((v) => `<td>${v}</td>`)
                .join("") +
              "</tr>"
          )
          .join("\n")}\n</table>`;
      case "javascript":
        return `const data = ${JSON.stringify(data, null, 2)};`;
      case "typescript": {
        const tsType = `type Row = ${JSON.stringify(
          Object.keys(data[0]).reduce((acc, key) => {
            const val = data[0][key];
            acc[key] =
              typeof val === "number"
                ? "number"
                : typeof val === "boolean"
                ? "boolean"
                : "string";
            return acc;
          }, {})
        )};\nconst data: Row[] = ${JSON.stringify(data, null, 2)};`;
        return tsType;
      }
      case "python":
        return `data = ${JSON.stringify(data, null, 2)
          .replace(/:/g, ": ")
          .replace(/true/g, "True")
          .replace(/false/g, "False")
          .replace(/null/g, "None")}`;
      case "php":
        return `<?php\n$data = ${JSON.stringify(data, null, 2)};\n?>`;
      case "ruby":
        return `data = ${JSON.stringify(data, null, 2)
          .replace(/:/g, "=>")
          .replace(/true/g, "true")
          .replace(/false/g, "false")
          .replace(/null/g, "nil")}`;
      case "c#":
        return `var data = ${JSON.stringify(data, null, 2)};`;
      default:
        return JSON.stringify(data, null, 2);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* --- BUTTONS TABLE --- */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl shadow p-4 border border-gray-300 dark:border-gray-600 flex flex-wrap gap-2">
        <input
          type="number"
          min="1"
          value={rowInput}
          onChange={(e) => setRowInput(e.target.value)}
          placeholder="Rows"
          className="w-24 px-2 py-1 rounded border dark:bg-gray-800 dark:text-gray-100"
        />
        <button
          onClick={handleGenerateRows}
          className="px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          Generate Rows
        </button>
        <button
          onClick={handleImportClick}
          className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
        >
          <FiUpload /> Import
        </button>
        <button
          onClick={handleDownload}
          className="px-3 py-1 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1"
        >
          <FiDownload /> Download
        </button>
      </div>

      {/* --- TABLE 1: Data Table --- */}
      <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow p-4 border border-gray-300 dark:border-gray-700">
        <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
          Data Table
        </h2>
        {warning && (
          <div className="p-2 bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 rounded-md text-sm mb-2">
            {warning}
          </div>
        )}
        <table className="w-full border border-gray-300 dark:border-gray-600">
          <thead className="bg-gray-200 dark:bg-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.name}
                  className="border p-2 border-gray-300 dark:border-gray-600 text-left text-gray-900 dark:text-gray-100"
                >
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={idx} className="odd:bg-gray-50 even:bg-gray-100 dark:odd:bg-gray-800 dark:even:bg-gray-900">
                  {columns.map((col) => (
                    <td key={col.name} className="border p-2 border-gray-300 dark:border-gray-600">
                      <input
                        type="text"
                        value={row[col.name]}
                        onChange={(e) => {
                          const newData = [...data];
                          newData[idx][col.name] = e.target.value;
                          setData(newData);
                        }}
                        className="w-full px-1 py-1 border rounded dark:bg-gray-800 dark:text-gray-100 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No data yet. Generate rows or import a file.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- TABLE 2: Template Table --- */}
      <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow p-4 border border-gray-300 dark:border-gray-700">
        <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
          Template Table
        </h2>
        <table className="w-full border border-gray-300 dark:border-gray-600">
          <thead className="bg-gray-200 dark:bg-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.name}
                  className="border p-2 border-gray-300 dark:border-gray-600 text-left text-gray-900 dark:text-gray-100"
                >
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {templateData.length > 0 ? (
              templateData.map((row, idx) => (
                <tr key={idx} className="odd:bg-gray-50 even:bg-gray-100 dark:odd:bg-gray-800 dark:even:bg-gray-900">
                  {columns.map((col) => (
                    <td key={col.name} className="border p-2 border-gray-300 dark:border-gray-600">
                      <input
                        type="text"
                        value={row[col.name]}
                        onChange={(e) => {
                          const newData = [...templateData];
                          newData[idx][col.name] = e.target.value;
                          setTemplateData(newData);
                        }}
                        className="w-full px-1 py-1 border rounded dark:bg-gray-800 dark:text-gray-100 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No template data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Preview Section remains unchanged --- */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Preview
        </h2>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <select
            value={previewSettings.format}
            onChange={(e) => updateSetting("format", e.target.value)}
            className={`p-2 rounded border focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? "bg-gray-700 text-gray-100 border-gray-600"
                : "bg-gray-200 text-gray-900 border-gray-400"
            }`}
          >
            {FORMATS.map((format) => (
              <option key={format} value={format}>
                {format.toUpperCase()}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="10"
            max="32"
            value={previewSettings.fontSize}
            onChange={(e) => updateSetting("fontSize", Number(e.target.value))}
            className={`w-20 p-2 rounded border focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? "bg-gray-700 text-gray-100 border-gray-600"
                : "bg-gray-200 text-gray-900 border-gray-400"
            }`}
          />

          <select
            value={previewSettings.fontTheme}
            onChange={(e) => updateSetting("fontTheme", e.target.value)}
            className={`p-2 rounded border focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? "bg-gray-700 text-gray-100 border-gray-600"
                : "bg-gray-200 text-gray-900 border-gray-400"
            }`}
          >
            {Object.keys(FONT_FAMILIES).map((theme) => (
              <option key={theme} value={theme}>
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={previewSettings.showLineNumbers}
              onChange={(e) => updateSetting("showLineNumbers", e.target.checked)}
            />
            Line Numbers
          </label>

          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={previewSettings.wrapLines}
              onChange={(e) => updateSetting("wrapLines", e.target.checked)}
            />
            Wrap Lines
          </label>

          <button className="ml-auto px-3 py-1 rounded-lg bg-gray-600 text-white hover:bg-gray-700 text-sm">
            Save Settings
          </button>
        </div>

        <div
          className="overflow-auto border rounded p-2 max-h-[300px]"
          style={{
            fontFamily:
              FONT_FAMILIES[previewSettings.fontTheme] || FONT_FAMILIES.monospace,
            fontSize: previewSettings.fontSize,
            whiteSpace: previewSettings.wrapLines ? "pre-wrap" : "pre",
          }}
        >
          {data.length + templateData.length > 0 ? (
            <pre>
              {previewSettings.showLineNumbers
                ? formatData([...templateData, ...data], previewSettings.format)
                    .split("\n")
                    .map((line, idx) => `${idx + 1}: ${line}`)
                    .join("\n")
                : formatData([...templateData, ...data], previewSettings.format)}
            </pre>
          ) : (
            <p className="text-sm text-gray-500">No data to preview</p>
          )}
        </div>
      </div>
    </div>
  );
}
