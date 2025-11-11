import React, { useState, useRef, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import FieldSelector from "../components/FieldSelector";
import SettingsModal from "../components/SettingsModal";
import exportData from "../utils/exportData";
import Paypalbutton from "../components/Paypalbutton";
import UpgradeModal from "../components/UpgradeModal";

import Papa from "papaparse";
import * as XLSX from "xlsx";
import yaml from "js-yaml";
import { xml2js } from "xml-js";

// --- (Constants) ---
const DEPARTMENT_TEMPLATES = {
  FINANCE: ["account", "accountName", "amount", "bic"],
  COMMERCE: ["department", "price", "product", "productAdjective"],
  AIRPORTS: ["airline", "airportCode", "airportName", "flightNumber"],
  INTERNET: ["avatar", "color", "domainName", "email", "ip"],
  USERIDENTITY: ["email", "domain", "ipV4", "ipV6"],
  MARKETING: ["campaignName", "campaignChannel", "adSlogan", "brandName"],
  IT: ["assetTag", "deviceType", "osVersion", "softwareName", "ipAddress"],
  HR: ["employeeId", "firstName", "lastName", "jobTitle", "hireDate"],
  CUSTOMER_SUPPORT: ["ticketId", "customerName", "customerEmail", "issueCategory"],
  RESEARCH: ["projectId", "projectName", "experimentTitle", "researcherName"],
};
const FONT_FAMILIES = {
  monospace: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  courier: "'Courier New', Courier, monospace",
  consolas: "Consolas, 'Courier New', monospace",
  ubuntu: "'Ubuntu Mono', monospace",
  roboto: "'Roboto Mono', monospace",
  serif: "serif",
  sans: "sans-serif",
};
const generateDataForRow = (columns, index) => {
  const row = {};
  const i = index + 1;
  columns.forEach((col) => {
    const key = col.alias || col.name;
    switch (col.type) {
      case "constant": row[key] = col.value; break;
      case "number range": row[key] = Math.floor(Math.random() * (col.max - col.min + 1)) + col.min; break;
      case "normal distribution": row[key] = Math.round(col.mean + (Math.random() - 0.5) * 2 * col.stddev); break;
      case "list":
      case "weighted list":
        row[key] = col.options?.length > 0 ? col.options[Math.floor(Math.random() * col.options.length)] : "";
        break;
      case "color": row[key] = col.value || "#000000"; break;
      case "url": row[key] = col.value || "https://example.com"; break;
      default: row[key] = `${key}_${i}`;
    }
  });
  return row;
};
// --- (End of constants) ---

export default function Dashboard({ darkMode }) {
  // --- State ---
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [rowCountInput, setRowCountInput] = useState(1);
  const [previewSettings, setPreviewSettings] = useState({ format: "csv", fontSize: 14, fontTheme: "monospace" });
  const [previewData, setPreviewData] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateData, setTemplateData] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // --- SUPABASE-POWERED STATE ---
  const [userPlan, setUserPlan] = useState("free");
  const [session, setSession] = useState(null);
  // ------------------------------------

  const [showPaypal, setShowPaypal] = useState(false);
  const [isTransposed, setIsTransposed] = useState(false);
  const [isPreviewTransposed, setIsPreviewTransposed] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const fileInputRef = useRef();

  // --- Free Plan Logic ---
  const planRowLimit = useMemo(() => {
    switch (userPlan) {
      case "sub": return Infinity;
      case "paid": return 1000;
      default: return 500;
    }
  }, [userPlan]);

  const planImportLimit = useMemo(() => {
    switch (userPlan) {
      case "sub": return Infinity;
      case "paid": return 1000;
      default: return 3;
    }
  }, [userPlan]);

  // --- useEffect hooks to fetch user data ---
  useEffect(() => {
    const fetchUserProfile = async (userId) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', userId)
          .single();

        if (error) throw error;
        if (data) {
          setUserPlan(data.plan);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error.message);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          fetchUserProfile(session.user.id);
        } else {
          setUserPlan('free');
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);
  // -------------------------------------------------

  useEffect(() => {
    const normalizeRows = (rows) =>
      rows.map((row) => {
        const newRow = {};
        columns.forEach((col) => {
          const key = col.alias || col.name;
          newRow[key] = row[key] ?? "";
        });
        return newRow;
      });
    setData((prev) => normalizeRows(prev));
    setPreviewData((prev) => normalizeRows(prev));
  }, [columns]);

  // --- Helper functions ---
  const upsell = () => {
    if (!session) {
      document.dispatchEvent(new CustomEvent("openAuthModal", { detail: "login" }));
    } else {
      setShowUpgradeModal(true);
    }
  };

  const handleAddRow = () => {
    const n = Number(rowCountInput);
    if (Number.isNaN(n) || n <= 0) return;
    if (columns.length === 0) { alert("Please add fields from the 'Field Selector' first."); return; }
    const current = data.length;
    const nextTotal = current + n;

    if (nextTotal > planRowLimit) {
      upsell();
      return;
    }
    const newRows = Array.from({ length: n }, (_, i) => generateDataForRow(columns, current + i));
    const updatedData = [...data, ...newRows];
    setData(updatedData);
    setPreviewData([...updatedData, ...templateData]);
    setRowCountInput(1);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    const reader = new FileReader();
    reader.onload = (ev) => {
      let parsed = [];
      try {
        const content = ev.target.result;
        if (ext === "csv") {
          const result = Papa.parse(content, { header: true, skipEmptyLines: true });
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
              Object.entries(r).forEach(([k, v]) => { if (k === "_attributes" || k === "_text") return; out[k] = v?._text ?? v?._cdata ?? ""; });
              return out;
            });
          } else if (rows && typeof rows === "object") {
            const out = {};
            Object.entries(rows).forEach(([k, v]) => { if (k === "_attributes" || k === "_text") return; out[k] = v?._text ?? v?._cdata ?? ""; });
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
        alert("❌ Failed to parse file: " + (err?.message || String(err)));
        e.target.value = "";
        return;
      }

      if (!parsed || parsed.length === 0) {
        alert("No rows found in the imported file.");
        e.target.value = "";
        return;
      }

      const allowed = parsed.slice(0, Math.max(0, planImportLimit - data.length));

      if (allowed.length < parsed.length) {
        upsell();
      }

      const keys = Object.keys(allowed[0] || {});
      if (keys.length > 0) { setColumns(keys.map((k) => ({ name: k, alias: k, type: "string" }))); }
      setData(allowed);
      setPreviewData([...allowed, ...templateData]);
      e.target.value = "";
    };
    if (ext === "xlsx" || ext === "xls") {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleDownloadData = () => {
    let combined = [...data, ...templateData];
    if (!combined.length) return alert("No data to download.");
    const exportCols = columns.map(c => c.alias || c.name);
    exportData(combined, exportCols, previewSettings.format);
  };

  // --- Handle a successful subscription (CLEANED) ---
  const handleSubscriptionSuccess = async (paypalData) => {
    if (!session) {
      alert("Error: You are not logged in.");
      return;
    }

    try {
      const { data: result, error } = await supabase.functions.invoke(
        'upgrade-plan-v2',
        {
          body: JSON.stringify({ subscriptionID: paypalData.subscriptionID }),
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (error) throw error;

      if (result.success) {
        alert("🎉 Your plan has been upgraded!");
        setUserPlan('sub');
      } else {
        throw new Error(result.error || "Unknown error during upgrade.");
      }

    } catch (err) {
      console.error("Upgrade failed:", err);
      alert("❌ Upgrade failed. Please contact support.");
    } finally {
      setShowPaypal(false);
    }
  };

  const buttonBaseStyle = "px-3 py-2 rounded-lg border transition-all duration-200 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600";
  const buttonActiveStyle = "bg-blue-600 text-white border-blue-700 scale-105 shadow-lg";

  return (
    <div className={`${darkMode ? "dark" : ""} font-sans`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
        {/* Navbar and AuthModal are rendered in App.js */}

        <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-[95vw] lg:max-w-7xl mx-auto flex flex-col gap-6">
          {/* --- Controls --- */}
          <div className="overflow-auto border rounded-lg bg-gray-200 dark:bg-gray-700 p-2 mb-4 flex flex-nowrap gap-2 items-center justify-start">

            <button
              onClick={upsell}
              className="px-3 py-1 text-sm font-semibold rounded-lg bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200 border border-yellow-400 dark:border-yellow-600 hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors whitespace-nowrap"
              title="Upgrade your plan"
            >
              Plan: {userPlan}
            </button>

            <input type="number" min={1} value={rowCountInput} onChange={(e) => setRowCountInput(e.target.value)} className="w-20 sm:w-24 p-1 border rounded text-black dark:text-gray-100 dark:bg-gray-600 text-sm" placeholder="Rows" />

            <button onClick={handleAddRow} className="px-3 sm:px-4 py-1 sm:py-2 rounded-lg bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm whitespace-nowrap">
              {isTransposed ? "Generate Column" : "Generate Rows"}
            </button>

            <button onClick={handleImportClick} className="px-3 sm:px-4 py-1 sm:py-2 rounded-lg bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm whitespace-nowrap">Import</button>
            <select value={previewSettings.format} onChange={(e) => setPreviewSettings((s) => ({ ...s, format: e.target.value }))} className="p-1 sm:p-2 border rounded text-black dark:text-gray-100 dark:bg-gray-600 text-sm min-w-[120px]">
              <option value="csv">CSV</option><option value="json">JSON</option><option value="xlsx">Excel</option><option value="sql">SQL</option><option value="xml">XML</option><option value="yaml">YAML</option><option value="yml">YAML (.yml)</option><option value="html">HTML</option><option value="ts">TypeScript</option><option value="js">JavaScript</option><option value="py">Python</option><option value="php">PHP</option><option value="rb">Ruby</option><option value="cs">C#</option>
            </select>
            <button onClick={handleDownloadData} className="px-3 sm:px-4 py-1 sm:py-2 rounded-lg bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm whitespace-nowrap">Download All</button>
            <button onClick={() => setSettingsOpen(true)} className="px-3 sm:px-4 py-1 sm:py-2 rounded-lg bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm whitespace-nowrap">Settings</button>
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv,.json,.xlsx,.xml,.yaml,.yml" className="hidden" />
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border w-full">
              <h2 className="text-xl font-bold mb-4">Department Templates</h2>
              <div className="flex flex-wrap gap-2">
                {Object.keys(DEPARTMENT_TEMPLATES).map((dept) => (<button key={dept} onClick={() => { setSelectedTemplate(dept); const cols = DEPARTMENT_TEMPLATES[dept]; const templateCols = cols.map(colName => ({ name: colName, alias: colName, type: "string" })); const newTemplateData = [generateDataForRow(templateCols, 0)]; setTemplateData(newTemplateData); setColumns(templateCols); setData(newTemplateData); setPreviewData(newTemplateData); }} className={`${buttonBaseStyle} ${selectedTemplate === dept ? buttonActiveStyle : ""}`}>{dept}</button>))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border w-full">
              <h2 className="text-xl font-bold mb-4">Field Selector</h2>
              <FieldSelector selectedColumns={columns} setSelectedColumns={setColumns} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border w-full">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Data Table</h2>
                <button onClick={() => setIsTransposed(prev => !prev)} className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600">{isTransposed ? "Show Row View" : "Show Column View"}</button>
              </div>
              <div className="overflow-auto max-h-[400px] border rounded">
                <table className="w-full text-sm">
                  {isTransposed ? (<><thead><tr><th className="border p-2 bg-gray-100 dark:bg-gray-700 sticky left-0 z-10">Field</th>{data.map((row, rIdx) => (<th key={rIdx} className="border p-2 bg-gray-100 dark:bg-gray-700">Record {rIdx + 1}</th>))}</tr></thead><tbody>{columns.length === 0 ? (<tr><td colSpan="100%" className="p-4 text-center text-gray-500">No fields selected.</td></tr>) : (columns.map((col) => { const key = col.alias || col.name; return (<tr key={key}><td className="border p-2 font-semibold bg-gray-50 dark:bg-gray-800 sticky left-0 z-10">{key}</td>{data.map((row, rIdx) => (<td key={`${key}-${rIdx}`} className="border p-2"><input type="text" value={row[key] ?? ""} onChange={(e) => { const next = [...data]; next[rIdx][key] = e.target.value; setData(next); setPreviewData([...next, ...templateData]); }} className={`w-full p-1 rounded ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`} /></td>))}</tr>); }))}</tbody></>) : (<><thead><tr>{columns.map((col) => (<th key={col.name} className="border p-2 bg-gray-100 dark:bg-gray-700">{col.alias || col.name}</th>))}</tr></thead><tbody>{data.length === 0 && (<tr><td colSpan={columns.length || 1} className="p-4 text-center text-gray-500">No data. Generate rows or import a file.</td></tr>)}{data.map((row, rIdx) => (<tr key={rIdx}>{columns.map((col) => { const key = col.alias || col.name; return (<td key={key} className="border p-2"><input type="text" value={row[key] ?? ""} onChange={(e) => { const next = [...data]; next[rIdx][key] = e.target.value; setData(next); setPreviewData([...next, ...templateData]); }} className={`w-full p-1 rounded ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`} /></td>); })}</tr>))}</tbody></>)}
                </table>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border w-full">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Preview</h2>
                <button onClick={() => setIsPreviewTransposed(prev => !prev)} className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600">{isPreviewTransposed ? "Show Raw View" : "Show Column View"}</button>
              </div>
              {isPreviewTransposed ? (<div className="overflow-auto max-h-[400px] border rounded"><table className="w-full text-sm"><thead><tr><th className="border p-2 bg-gray-100 dark:bg-gray-700 sticky left-0 z-10">Field</th>{previewData.map((row, rIdx) => (<th key={rIdx} className="border p-2 bg-gray-100 dark:bg-gray-700">Record {rIdx + 1}</th>))}</tr></thead><tbody>{columns.length === 0 ? (<tr><td colSpan="100%" className="p-4 text-center text-gray-500">No fields selected.</td></tr>) : (columns.map((col) => { const key = col.alias || col.name; return (<tr key={key}><td className="border p-2 font-semibold bg-gray-50 dark:bg-gray-800 sticky left-0 z-10">{key}</td>{previewData.map((row, rIdx) => (<td key={`${key}-${rIdx}`} className="border p-2 whitespace-pre-wrap break-all">{String(row[key] ?? "")}</td>))}</tr>); }))}</tbody></table></div>) : (<div className="overflow-auto border rounded h-[400px] p-2" style={{ fontSize: previewSettings.fontSize, fontFamily: FONT_FAMILIES[previewSettings.fontTheme] }}>{previewSettings.format === "json" ? (<pre>{JSON.stringify(previewData, null, 2)}</pre>) : previewSettings.format === "csv" ? (<pre>{Papa.unparse(previewData)}</pre>) : previewSettings.format === "yaml" || previewSettings.format === "yml" ? (<pre>{yaml.dump(previewData)}</pre>) : (<pre>{JSON.stringify(previewData, null, 2)}</pre>)}</div>)}
            </div>
          </div>
        </div>

        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} settings={previewSettings} setSettings={setPreviewSettings} selectedFormat={previewSettings.format} />

        {showPaypal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => setShowPaypal(false)}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-[400px]" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4">Complete Your Subscription</h2>
              <p className="mb-4 text-sm">You are subscribing to the Pro Plan.</p>
              <Paypalbutton
                onSuccess={handleSubscriptionSuccess}
                onCancel={() => setShowPaypal(false)}
                onError={(err) => {
                  console.error(err);
                  alert("❌ PayPal Error.");
                  setShowPaypal(false);
                }}
              />
              <button onClick={() => setShowPaypal(false)} className="mt-4 px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 w-full">Cancel</button>
            </div>
          </div>
        )}

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => {
            setShowUpgradeModal(false);
            setShowPaypal(true);
          }}
        />
      </div>
    </div>
  );
}