// src/components/PreviewTable.jsx
import React from "react";
import jsyaml from "js-yaml";

const FONT_FAMILIES = {
  monospace:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  courier: "'Courier New', Courier, monospace",
  consolas: "Consolas, 'Courier New', monospace",
  ubuntu: "'Ubuntu Mono', monospace",
  roboto: "'Roboto Mono', monospace",
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

export default function PreviewTable({ data = [], previewSettings, setPreviewSettings, darkMode = false }) {
  const updateSetting = (key, value) => {
    setPreviewSettings((prev) => ({ ...prev, [key]: value }));
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
        try { return jsyaml.dump(data); } 
        catch { return "YAML formatting failed"; }
      case "html":
        return `<table>\n${data
          .map((row) => "<tr>" + Object.values(row).map((v) => `<td>${v}</td>`).join("") + "</tr>")
          .join("\n")}\n</table>`;
      case "javascript":
        return `const data = ${JSON.stringify(data, null, 2)};`;
      case "typescript": {
        const tsType = `type Row = ${JSON.stringify(
          Object.keys(data[0]).reduce((acc, key) => {
            const val = data[0][key];
            acc[key] = typeof val === "number" ? "number" : typeof val === "boolean" ? "boolean" : "string";
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border border-gray-200 dark:border-gray-700 w-full flex flex-col gap-4 mt-4">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
        Preview
      </h2>

      {/* Controls in one line */}
      <div className="flex flex-wrap items-center gap-2 justify-start">
        <select
          value={previewSettings.format}
          onChange={(e) => updateSetting("format", e.target.value)}
          className={`p-2 rounded border focus:ring-2 focus:ring-blue-500 ${
            darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-gray-200 text-gray-900 border-gray-400"
          }`}
        >
          {FORMATS.map((format) => (
            <option key={format} value={format}>{format.toUpperCase()}</option>
          ))}
        </select>

        <input
          type="number"
          min="10"
          max="32"
          value={previewSettings.fontSize}
          onChange={(e) => updateSetting("fontSize", Number(e.target.value))}
          className={`w-20 p-2 rounded border focus:ring-2 focus:ring-blue-500 ${
            darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-gray-200 text-gray-900 border-gray-400"
          }`}
        />

        <select
          value={previewSettings.fontTheme}
          onChange={(e) => updateSetting("fontTheme", e.target.value)}
          className={`p-2 rounded border focus:ring-2 focus:ring-blue-500 ${
            darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-gray-200 text-gray-900 border-gray-400"
          }`}
        >
          {Object.keys(FONT_FAMILIES).map((theme) => (
            <option key={theme} value={theme}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</option>
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
      </div>

      {/* Preview content */}
      <div
        className="overflow-auto border rounded p-2 max-h-[300px]"
        style={{
          fontFamily: FONT_FAMILIES[previewSettings.fontTheme],
          fontSize: previewSettings.fontSize,
          whiteSpace: previewSettings.wrapLines ? "pre-wrap" : "pre",
        }}
      >
        {data.length > 0 ? (
          <pre>
            {previewSettings.showLineNumbers
              ? formatData(data, previewSettings.format)
                  .split("\n")
                  .map((line, idx) => `${idx + 1}: ${line}`)
                  .join("\n")
              : formatData(data, previewSettings.format)}
          </pre>
        ) : (
          <p className="text-sm text-gray-500">No data to preview</p>
        )}
      </div>
    </div>
  );
}
