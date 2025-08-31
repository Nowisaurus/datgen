import { useState, useEffect } from "react";

export default function DarkModeToggle({ className }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <button onClick={toggleDarkMode} className={className}>
      {darkMode ? "🌙" : "☀️"}
    </button>
  );
}
