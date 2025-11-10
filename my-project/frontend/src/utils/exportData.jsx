// src/utils/exportData.js
export default function exportData(data, columns, format = "csv") {
  let content = "";
  const filename = `data.${format}`;

  if (!data || data.length === 0) {
    console.error("Export failed: No data provided.");
    return;
  }
  
  if (!columns || columns.length === 0) {
    console.warn("Export warning: No columns provided, using keys from first row.");
    columns = Object.keys(data[0]);
  }

  switch (format) {
    case "json":
      content = JSON.stringify(data, null, 2);
      break;
    case "csv":
      content = [columns.join(","), ...data.map(row => columns.map(c => `"${String(row[c] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
      break;
    case "tsv":
    case "excel":
      content = [columns.join("\t"), ...data.map(row => columns.map(c => String(row[c] ?? "")).join("\t"))].join("\n");
      break;
    case "sql":
      content = data.map(row => `INSERT INTO table_name (${columns.join(", ")}) VALUES (${columns.map(c => `'${String(row[c] ?? "").replace(/'/g, "''")}'`).join(", ")});`).join("\n");
      break;
    case "xml":
      content = `<rows>\n${data.map(row => `  <row>\n${columns.map(c => `    <${c}>${String(row[c] ?? "")}</${c}>`).join("\n")}\n  </row>`).join("\n")}\n</rows>`;
      break;
    case "yaml":
      content = data.map(row => {
        let entry = "-";
        columns.forEach((c) => {
          entry += `\n  ${c}: ${String(row[c] ?? "")}`;
        });
        return entry;
      }).join("\n");
      break;
    default:
      content = JSON.stringify(data, null, 2);
  }

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}