// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AuthModal from "./components/AuthModal";
import Dashboard from "./pages/Dashboard";

export default function App() {
  // The AuthModal component provided listens for a global event
  // and manages its own visibility. We just need to render it
  // at the top level so it's always available.
  // Home and Dashboard manage their own dark mode state internally.

  return (
    <div className={`min-h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 flex flex-col`}>
      
      {/* Main content container: responsive, scrollable if needed */}
      <div className="flex-1 w-full max-w-full overflow-x-hidden overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generator" element={<Dashboard />} />
        </Routes>
      </div>

      {/* Auth Modal - Renders itself when event is fired */}
      <AuthModal />
    </div>
  );
}