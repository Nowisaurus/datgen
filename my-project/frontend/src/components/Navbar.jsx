// src/components/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";

export default function Navbar() {
  const openModal = (mode) => {
    document.dispatchEvent(new CustomEvent("openAuthModal", { detail: mode }));
  };

  // --- STYLE DEFINITIONS ---
  // Base style for ALL buttons. ONLY has scale-95 on click.
  // NO 'active:text-blue' or 'active:bg-blue' here.
  const buttonBaseStyle =
    "px-3 py-1.5 rounded-md font-medium transition-all duration-200 border-2 " +
    "bg-gray-200 text-gray-800 hover:bg-gray-300 " +         // Light mode
    "dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 " + // Dark mode
    "border-transparent " +
    "active:scale-95"; // ONLY click effect is "press down"

  // Active style (for the CURRENT PAGE link ONLY)
  const activePageStyle =
    "bg-blue-600 text-white border-blue-700 scale-105 shadow-lg";

  // Combines styles.
  const navLinkClass = ({ isActive }) =>
    `${buttonBaseStyle} ${isActive ? activePageStyle : ""}`;
    
  // --- END OF STYLES ---

  return (
    <header className="w-full bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200">
          Generate Data
        </h1>
        <nav className="flex items-center gap-4">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/generator" className={navLinkClass}>
            Generator
          </NavLink>
          {/* These buttons only use buttonBaseStyle */}
          <button onClick={() => openModal("register")} className={buttonBaseStyle}>
            Register
          </button>
          <button onClick={() => openModal("login")} className={buttonBaseStyle}>
            Login
          </button>
          <DarkModeToggle className={buttonBaseStyle} />
        </nav>
      </div>
    </header>
  );
}