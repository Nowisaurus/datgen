// src/components/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
// We don't need DarkModeToggle, we'll use the props

export default function Navbar({ darkMode, setDarkMode }) { // Accept props
  const openModal = (mode) => {
    document.dispatchEvent(new CustomEvent("openAuthModal", { detail: mode }));
  };

  // --- STYLE DEFINITIONS ---
  const buttonBaseStyle =
    "px-3 py-1.5 rounded-md font-medium transition-all duration-200 border-2 " +
    "bg-gray-200 text-gray-800 hover:bg-gray-300 " +
    "dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 " +
    "border-transparent " +
    "active:scale-95";

  const activePageStyle =
    "bg-blue-600 text-white border-blue-700 scale-105 shadow-lg";

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
          
          <button onClick={() => openModal("register")} className={buttonBaseStyle}>
            Register
          </button>
          <button onClick={() => openModal("login")} className={buttonBaseStyle}>
            Login
          </button>
          
          {/* Simple dark mode toggle button using the props */}
          <button onClick={() => setDarkMode(!darkMode)} className={buttonBaseStyle}>
            {darkMode ? "Light" : "Dark"}
          </button>
        </nav>
      </div>
    </header>
  );
}