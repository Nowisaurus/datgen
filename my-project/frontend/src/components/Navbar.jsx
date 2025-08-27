import React from "react";
import { Link } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";

export default function Navbar({ darkMode, setDarkMode }) {
  const openModal = (mode) => {
    document.dispatchEvent(new CustomEvent("openAuthModal", { detail: mode }));
  };

  const navButtonClass =
    "px-3 py-2 rounded-lg font-medium transition-colors duration-200 " +
    "text-gray-700 dark:text-gray-200 " +
    "hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white";

  return (
    <header className="w-full bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200">
          Generate Data
        </h1>
        <nav className="flex items-center gap-4">
          <Link to="/" className={navButtonClass}>Home</Link>
          <Link to="/generator" className={navButtonClass}>Generator</Link>
          <button onClick={() => openModal("register")} className={navButtonClass}>Register</button>
          <button onClick={() => openModal("login")} className={navButtonClass}>Login</button>
          <DarkModeToggle className={navButtonClass} darkMode={darkMode} setDarkMode={setDarkMode} />
        </nav>
      </div>
    </header>
  );
}
