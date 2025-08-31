// src/pages/Dashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import AuthModal from "../components/AuthModal";
import FieldSelector from "../components/FieldSelector";
import SettingsModal from "../components/SettingsModal";
import exportData from "../utils/exportData";

import Papa from "papaparse";
import * as XLSX from "xlsx";
import yaml from "js-yaml";
import { xml2js } from "xml-js";

// Department templates
const DEPARTMENT_TEMPLATES = {
  FINANCE: [
    "account",
    "accountName",
    "amount",
    "bic",
    "bitcoinAddress",
    "creditCardCVV",
    "creditCardIssuer",
    "creditCardNumber",
    "currencyCode",
    "currencyName",
    "currencySymbol",
    "ethereumAddress",
    "iban",
    "litecoinAddress",
    "mask",
    "pin",
    "routingNumber",
    "transactionDescription",
    "transactionType",
  ],
  COMMERCE: [
    "department",
    "price",
    "product",
    "productAdjective",
    "productDescription",
  ],
  AIRPORTS: [
    "airline",
    "airportCode",
    "airportName",
    "flightNumber",
    "seatNumber",
  ],
  INTERNET: [
    "avatar",
    "color",
    "domainName",
    "domainSuffix",
    "domainWord",
    "email",
    "emoji",
    "exampleEmail",
    "httpMethod",
    "httpStatusCode",
    "ip",
    "ipv4",
    "ipv6",
    "mac",
    "password",
    "port",
    "protocol",
    "url",
  ],
  USERIDENTITY: ["email", "domain", "ipV4", "ipV6"],
  MARKETING: [
    "campaignName",
    "campaignChannel",
    "campaignBudget",
    "adSlogan",
    "adjective",
    "hashtag",
    "brandName",
    "marketSegment",
    "conversionRate",
    "customerReview",
  ],
  IT: [
    "assetTag",
    "deviceType",
    "osVersion",
    "softwareName",
    "licenseKey",
    "ipAddress",
    "macAddress",
    "firewallStatus",
    "ticketId",
    "issueType",
    "resolutionStatus",
  ],
  HR: [
    "employeeId",
    "firstName",
    "lastName",
    "jobTitle",
    "departmentName",
    "hireDate",
    "salary",
    "employmentStatus",
    "performanceScore",
    "leaveBalance",
  ],
  CUSTOMER_SUPPORT: [
    "ticketId",
    "customerName",
    "customerEmail",
    "issueCategory",
    "priority",
    "status",
    "responseTime",
    "resolutionComment",
    "satisfactionRating",
  ],
  RESEARCH: [
    "projectId",
    "projectName",
    "experimentTitle",
    "description",
    "startDate",
    "endDate",
    "budget",
    "result",
    "researcherName",
  ],
};
;

// Font families
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

export default function Dashboard() {
  // --- States ---
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [rowCountInput, setRowCountInput] = useState(1);

  const [previewSettings, setPreviewSettings] = useState({
    format: "csv",
    fontSize: 14,
    fontTheme: "monospace",
  });

  const [previewData, setPreviewData] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateData, setTemplateData] = useState([]);

  const [darkMode, setDarkMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fileInputRef = useRef();

  // --- Ensure all rows have all columns ---
  useEffect(() => {
    if (columns.length === 0) return;

    const normalizeRows = (rows) =>
      rows.map((row) => {
        const newRow = {};
        columns.forEach((col) => (newRow[col.name] = row[col.name] ?? ""));
        return newRow;
      });

    setData((prev) => normalizeRows(prev));
    setPreviewData((prev) => normalizeRows(prev));
  }, [columns]);

  // --- Helper functions ---
  const upsell = (msg) => {
    alert(
      `${msg}\n\nUpgrade options:\n• +1000 rows\n• +2000 rows\n• Unlimited rows\n\nImports:\n• 10 imports\n• Unlimited imports`
    );
    setShowAuth(true);
  };

  const handleRowCountInput = (val) => {
    const n = Number(val);
    setRowCountInput(Number.isNaN(n) || n < 1 ? 1 : n);
  };

  const handleAddRow = () => {
    const n = Number(rowCountInput);
    if (Number.isNaN(n) || n <= 0) return;
    if (n + data.length > 500) {
      upsell("Free row limit (500) reached.");
      return;
    }

    const newRows = Array.from({ length: n }, () =>
      columns.reduce((acc, c) => ({ ...acc, [c.name]: "" }), {})
    );
    const updatedData = [...data, ...newRows];
    setData(updatedData);
    setPreviewData(updatedData);
    setRowCountInput(1);
  };

  const handleImportClick = () => fileInputRef.current?.click();

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
      if (keys.length > 0) setColumns(keys.map((k) => ({ name: k, type: "string" })));

      setData(parsed);
      setPreviewData(parsed);
      e.target.value = "";
    };

    if (ext === "xlsx") reader.readAsBinaryString(file);
    else reader.readAsText(file);
  };

  const handleDownloadData = () => {
    let combined = [...data];
    if (selectedTemplate && templateData.length > 0) combined = [...combined, ...templateData];
    if (!combined.length) return alert("No data to download.");
    exportData(combined, previewSettings.format);
  };

  // --- JSX ---
  return (
    <div className={`${darkMode ? "dark" : ""} font-sans`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

        <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-[95vw] lg:max-w-7xl mx-auto flex flex-col gap-6">

          {/* --- Controls --- */}
          <div className="overflow-auto border rounded-lg bg-gray-200 dark:bg-gray-700 p-2 mb-4 flex flex-nowrap gap-2 items-center justify-start">
            <input
              type="number"
              min={1}
              value={rowCountInput}
              onChange={(e) => handleRowCountInput(e.target.value)}
              className="w-20 sm:w-24 p-1 border rounded text-black dark:text-gray-100 dark:bg-gray-600 text-sm"
              placeholder="Rows"
            />
            <button
              onClick={handleAddRow}
              className="px-3 sm:px-4 py-1 sm:py-2 rounded-lg bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm whitespace-nowrap"
            >
              Generate Rows
            </button>
            <button
              onClick={handleImportClick}
              className="px-3 sm:px-4 py-1 sm:py-2 rounded-lg bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm whitespace-nowrap"
            >
              Import
            </button>
            <select
              value={previewSettings.format}
              onChange={(e) => setPreviewSettings((s) => ({ ...s, format: e.target.value }))}
              className="p-1 sm:p-2 border rounded text-black dark:text-gray-100 dark:bg-gray-600 text-sm min-w-[120px]"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="xlsx">Excel</option>
              <option value="sql">SQL</option>
              <option value="xml">XML</option>
              <option value="yaml">YAML</option>
              <option value="yml">YAML (.yml)</option>
              <option value="html">HTML</option>
              <option value="ts">TypeScript</option>
              <option value="js">JavaScript</option>
              <option value="py">Python</option>
              <option value="php">PHP</option>
              <option value="rb">Ruby</option>
              <option value="cs">C#</option>
            </select>
            <button
              onClick={handleDownloadData}
              className="px-3 sm:px-4 py-1 sm:py-2 rounded-lg bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm whitespace-nowrap"
            >
              Download All
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="px-3 sm:px-4 py-1 sm:py-2 rounded-lg bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm whitespace-nowrap"
            >
              Settings
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".csv,.json,.xlsx,.xml,.yaml,.yml"
              className="hidden"
            />
          </div>

          {/* --- Field Selector & Data Table --- */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border w-full lg:w-1/3">
              <h2 className="text-xl font-bold mb-2">Field Selector</h2>
              <FieldSelector selectedColumns={columns} setSelectedColumns={setColumns} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border w-full lg:w-2/3">
              <div className="overflow-auto max-h-[400px] border rounded">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {columns.map((col) => (
                        <th key={col.name} className="border p-2 bg-gray-100 dark:bg-gray-700">{col.name}</th>
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
                                setPreviewData([...next, ...templateData]);
                              }}
                              className={`w-full p-1 rounded ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* --- Templates & Preview --- */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border w-full lg:w-1/2">
              <h2 className="text-xl font-bold mb-2">Department Templates</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {Object.keys(DEPARTMENT_TEMPLATES).map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
                      setSelectedTemplate(dept);
                      const cols = DEPARTMENT_TEMPLATES[dept];
                      const newTemplateData = [cols.reduce((acc, c) => ({ ...acc, [c]: "" }), {})];
                      setTemplateData(newTemplateData);
                      setPreviewData([...data, ...newTemplateData]);
                    }}
                    className={`px-3 py-1 rounded-lg border transition ${selectedTemplate === dept ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"}`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
              <div className="overflow-auto max-h-[400px] border rounded">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {selectedTemplate &&
                        DEPARTMENT_TEMPLATES[selectedTemplate].map((col) => (
                          <th key={col} className="border p-2 bg-gray-100 dark:bg-gray-700">{col}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {templateData.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, i) => (
                          <td key={i} className="border p-2">
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => {
                                const next = [...templateData];
                                const keys = Object.keys(next[idx]);
                                next[idx][keys[i]] = e.target.value;
                                setTemplateData(next);
                                setPreviewData([...data, ...next]);
                              }}
                              className={`w-full p-1 rounded ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border w-full lg:w-1/2">
              <div
                className="overflow-auto max-h-[400px] border rounded p-2"
                style={{
                  fontSize: `${previewSettings.fontSize}px`,
                  fontFamily: FONT_FAMILIES[previewSettings.fontTheme] || FONT_FAMILIES.monospace,
                }}
              >
                <pre>{JSON.stringify(previewData, null, 2)}</pre>
              </div>
            </div>
          </div>

          {/* --- Modals --- */}
          <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
          <SettingsModal
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            selectedFormat={previewSettings.format}
            settings={previewSettings}
            setSettings={setPreviewSettings}
          />
        </div>
      </div>
    </div>
  );
}
