import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 flex flex-col`}>
      
      {/* Navbar is rendered once and controls dark mode */}
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main content area switches between pages */}
      <div className="flex-1 w-full max-w-full overflow-x-hidden overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home darkMode={darkMode} />} />
          <Route path="/generator" element={<Dashboard darkMode={darkMode} />} />
        </Routes>
      </div>

      {/* AuthModal is rendered once, globally */}
      <AuthModal />
    </div>
  );
}