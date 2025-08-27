export default function exportData(data, columns, format = "csv") {
  let content = "";
  const filename = `data.${format}`;

  switch (format) {
    case "json":
      content = JSON.stringify(data, null, 2);
      break;
    case "csv":
      content = [columns.join(","), ...data.map(row => columns.map(c => row[c]).join(","))].join("\n");
      break;
    case "tsv":
    case "excel":
      content = [columns.join("\t"), ...data.map(row => columns.map(c => row[c]).join("\t"))].join("\n");
      break;
    case "sql":
      content = data.map(row => `INSERT INTO table_name (${columns.join(", ")}) VALUES (${columns.map(c => `'${row[c]}'`).join(", ")});`).join("\n");
      break;
    case "xml":
      content = `<rows>\n${data.map(row => `  <row>${columns.map(c => `<${c}>${row[c]}</${c}>`).join("")}</row>`).join("\n")}\n</rows>`;
      break;
    case "yaml":
      content = data.map((row, i) => `- row${i+1}:\n${columns.map(c => `    ${c}: ${row[c]}`).join("\n")}`).join("\n");
      break;
    default:
      content = JSON.stringify(data, null, 2);
  }

  // Trigger download
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
