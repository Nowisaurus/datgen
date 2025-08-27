// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AuthModal from "./components/AuthModal";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [authModal, setAuthModal] = useState(null); // "login" | "register" | null

  // Listen to modal open events
  useEffect(() => {
    const handler = (e) => setAuthModal(e.detail);
    document.addEventListener("openAuthModal", handler);
    return () => document.removeEventListener("openAuthModal", handler);
  }, []);

  return (
    <div className={`min-h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 flex flex-col`}>
      
      {/* Main content container: responsive, scrollable if needed */}
      <div className="flex-1 w-full max-w-full overflow-x-hidden overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home darkMode={darkMode} />} />
          <Route path="/generator" element={<Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />} />
        </Routes>
      </div>

      {/* Auth Modal */}
      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />}
    </div>
  );
}
