// src/utils/importer.jsx
import Papa from "papaparse";
import * as XLSX from "xlsx";
import yaml from "js-yaml";
import { xml2js } from "xml-js";

// Flatten helper so XML/YAML nested objects don’t break table
const flattenObj = (obj, parentKey = "", res = {}) => {
  for (let key in obj) {
    const propName = parentKey ? `${parentKey}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      flattenObj(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
};

// Row limiter based on plan
const applyPlanLimit = (rows, plan) => {
  if (plan === "free") return rows.slice(0, 3);   // 3 rows free
  if (plan === "paid") return rows.slice(0, 10);  // 10 rows paid
  return rows; // subscription → unlimited
};

// Main importer function
export const importFile = (file, plan = "free", callback) => {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      let imported = [];
      let columns = [];

      if (file.name.endsWith(".json")) {
        const parsed = JSON.parse(e.target.result);
        imported = Array.isArray(parsed) ? parsed.map(flattenObj) : [flattenObj(parsed)];
        columns = Object.keys(imported[0] || {}).map((k) => ({ name: k, alias: k }));

      } else if (file.name.endsWith(".csv")) {
        const result = Papa.parse(e.target.result, { header: true });
        imported = result.data.map(flattenObj);
        columns = result.meta.fields.map((f) => ({ name: f, alias: f }));

      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const workbook = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json(sheet);
        imported = parsed.map(flattenObj);
        columns = Object.keys(imported[0] || {}).map((k) => ({ name: k, alias: k }));

      } else if (file.name.endsWith(".yaml") || file.name.endsWith(".yml")) {
        const parsed = yaml.load(e.target.result);
        imported = Array.isArray(parsed) ? parsed.map(flattenObj) : [flattenObj(parsed)];
        columns = Object.keys(imported[0] || {}).map((k) => ({ name: k, alias: k }));

      } else if (file.name.endsWith(".xml")) {
        const parsed = xml2js(e.target.result, { compact: true });
        const rows = parsed?.root?.row || [];
        imported = rows.map((r) => {
          const obj = {};
          for (let key in r) obj[key] = r[key]._text || "";
          return flattenObj(obj);
        });
        columns = imported.length > 0 ? Object.keys(imported[0]).map((k) => ({ name: k, alias: k })) : [];
      }

      // Apply plan-based row limits
      const limited = applyPlanLimit(imported, plan);

      callback({ data: limited, columns });
    } catch (err) {
      console.error("❌ Import error:", err);
      alert("Failed to import file: " + err.message);
    }
  };

  if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file);
  }
};
