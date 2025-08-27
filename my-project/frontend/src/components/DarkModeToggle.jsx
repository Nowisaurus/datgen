import { useState, useEffect } from "react";

export default function DarkModeToggle() {
  // Load dark mode preference from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // Apply dark mode to <html> and save preference
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const buttonClass =
    "px-3 py-2 rounded-lg font-medium transition-colors duration-200 " +
    "text-gray-700 dark:text-gray-200 " +
    "hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white";

  return (
    <button onClick={toggleDarkMode} className={buttonClass}>
      {darkMode ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
