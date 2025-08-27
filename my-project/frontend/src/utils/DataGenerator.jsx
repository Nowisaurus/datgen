import React, { useState } from "react";
import FieldSelector from "../components/FieldSelector";

export default function DataGenerator() {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [rows, setRows] = useState(5);
  const [exportFormat, setExportFormat] = useState("");

  const generatePreviewData = () => {
    return Array.from({ length: rows }).map((_, i) => {
      const row = {};
      selectedColumns.forEach((col) => {
        switch (col.type) {
          case "constant":
            row[col.alias] = col.value;
            break;
          case "number range":
            row[col.alias] =
              Math.floor(Math.random() * (col.max - col.min + 1)) + col.min;
            break;
          case "normal distribution":
            row[col.alias] =
              Math.round(col.mean + (Math.random() - 0.5) * 2 * col.stddev);
            break;
          case "list":
          case "weighted list":
            row[col.alias] =
              col.options.length > 0
                ? col.options[Math.floor(Math.random() * col.options.length)]
                : "";
            break;
          case "color":
            row[col.alias] = col.value || "#000000";
            break;
          case "url":
            row[col.alias] = col.value || "https://example.com";
            break;
          default:
            row[col.alias] = `${col.alias}_${i + 1}`;
        }
      });
      return row;
    });
  };

  const handleExport = () => {
    if (!exportFormat || selectedColumns.length === 0) return;

    const data = generatePreviewData();
    let content = "";
    const fileName = `data.${exportFormat}`;

    switch (exportFormat) {
      case "csv":
        content = [
          selectedColumns.map((f) => f.alias).join(","),
          ...data.map((row) =>
            selectedColumns.map((f) => row[f.alias]).join(",")
          ),
        ].join("\n");
        break;
      case "json":
        content = JSON.stringify(data, null, 2);
        break;
      case "sql":
        content = `CREATE TABLE demo (\n${selectedColumns
          .map((f) => `  ${f.alias} ${f.type.toUpperCase()}`)
          .join(",\n")}\n);\n\nINSERT INTO demo VALUES\n${data
          .map(
            (row) =>
              `(${selectedColumns.map((f) => `'${row[f.alias]}'`).join(", ")})`
          )
          .join(",\n")};`;
        break;
      case "html":
        content = `<table>
<thead>
<tr>${selectedColumns.map((f) => `<th>${f.alias}</th>`).join("")}</tr>
</thead>
<tbody>
${data
  .map(
    (row) =>
      `<tr>${selectedColumns
        .map((f) => `<td>${row[f.alias]}</td>`)
        .join("")}</tr>`
  )
  .join("")}
</tbody>
</table>`;
        break;
      case "python":
        content = `data = ${JSON.stringify(data, null, 2)}`;
        break;
      case "php":
        content = `<?php\n$data = ${JSON.stringify(data, null, 2)};\n?>`;
        break;
      case "javascript":
      case "typescript":
        content = `const data = ${JSON.stringify(data, null, 2)};`;
        break;
      case "ruby":
        content = `data = ${JSON.stringify(data, null, 2)}`;
        break;
      case "c#":
        content = `var data = ${JSON.stringify(data, null, 2)};`;
        break;
      default:
        content = JSON.stringify(data, null, 2);
    }

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  const previewContent = () => {
    const data = generatePreviewData();
    switch (exportFormat) {
      case "csv":
        return [
          selectedColumns.map((f) => f.alias).join(","),
          ...data.map((row) =>
            selectedColumns.map((f) => row[f.alias]).join(",")
          ),
        ].join("\n");
      case "json":
        return JSON.stringify(data, null, 2);
      case "sql":
        return `CREATE TABLE demo (\n${selectedColumns
          .map((f) => `  ${f.alias} ${f.type.toUpperCase()}`)
          .join(",\n")}\n);\n\nINSERT INTO demo VALUES\n${data
          .map(
            (row) =>
              `(${selectedColumns.map((f) => `'${row[f.alias]}'`).join(", ")})`
          )
          .join(",\n")};`;
      case "html":
        return `<table>
<thead>
<tr>${selectedColumns.map((f) => `<th>${f.alias}</th>`).join("")}</tr>
</thead>
<tbody>
${data
  .map(
    (row) =>
      `<tr>${selectedColumns
        .map((f) => `<td>${row[f.alias]}</td>`)
        .join("")}</tr>`
  )
  .join("")}
</tbody>
</table>`;
      case "python":
        return `data = ${JSON.stringify(data, null, 2)}`;
      case "php":
        return `<?php\n$data = ${JSON.stringify(data, null, 2)};\n?>`;
      case "javascript":
      case "typescript":
        return `const data = ${JSON.stringify(data, null, 2)};`;
      case "ruby":
        return `data = ${JSON.stringify(data, null, 2)}`;
      case "c#":
        return `var data = ${JSON.stringify(data, null, 2)};`;
      default:
        return JSON.stringify(data, null, 2);
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Field Selector */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 border border-gray-200 dark:border-gray-700 md:col-span-1">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Field Selector
          </h2>
          <FieldSelector
            selectedColumns={selectedColumns}
            setSelectedColumns={setSelectedColumns}
          />
        </div>

        {/* Preview & Export */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 border border-gray-200 dark:border-gray-700 md:col-span-2">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Preview & Export
          </h2>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <label className="text-gray-700 dark:text-gray-200 font-medium">
                Rows:
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={rows}
                onChange={(e) => setRows(Math.min(Number(e.target.value), 500))}
                className="w-20 p-1 border rounded dark:bg-gray-800 dark:text-white"
              />
            </div>

            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="border p-1 rounded dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select Format</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="sql">SQL</option>
              <option value="html">HTML</option>
              <option value="python">Python</option>
              <option value="php">PHP</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="ruby">Ruby</option>
              <option value="c#">C#</option>
            </select>

            <button
              onClick={handleExport}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download
            </button>
          </div>

          <div className="border p-3 rounded bg-gray-50 dark:bg-gray-800 text-sm overflow-auto h-64 whitespace-pre-wrap text-gray-900 dark:text-gray-100">
            {exportFormat && selectedColumns.length > 0 ? (
              <pre>{previewContent()}</pre>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Select fields and a format to preview
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
