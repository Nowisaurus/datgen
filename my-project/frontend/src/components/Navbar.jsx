import React from "react";
import { NavLink } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";

export default function Navbar() {
  const openModal = (mode) => {
    document.dispatchEvent(new CustomEvent("openAuthModal", { detail: mode }));
  };

  // Base style for buttons and links
  const baseClass =
  "px-3 py-1.5 rounded-md font-medium transition-all duration-200 " +
  "bg-gray-200 text-gray-800 hover:bg-gray-300 hover:text-gray-800 " +
  "dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:hover:text-gray-100 " +
  "border-2 border-transparent";

  // Only show blue border on hover, no active page styling
  const navLinkClass = () =>
    baseClass + " hover:border-blue-500 dark:hover:border-blue-400";

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
          <button onClick={() => openModal("register")} className={baseClass}>
            Register
          </button>
          <button onClick={() => openModal("login")} className={baseClass}>
            Login
          </button>
          <DarkModeToggle className={baseClass} />
        </nav>
      </div>
    </header>
  );
}
