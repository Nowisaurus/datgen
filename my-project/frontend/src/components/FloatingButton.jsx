// src/components/FloatingButton.jsx
import React from "react";

export default function FloatingButton({ label, active, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      style={{
        transform: active ? "scale(1.05) translateY(-3px)" : "scale(1) translateY(0)",
        boxShadow: active
          ? "0px 0px 10px rgba(156,163,175,0.5), 0px 0px 20px rgba(156,163,175,0.8)"
          : "0px 4px 10px rgba(0,0,0,0.2)",
        transition: "all 0.3s ease-in-out",
      }}
      className={`
        flex items-center justify-center 
        px-4 py-2
        min-w-[100px] max-w-[140px]
        rounded-md text-center font-medium
        ${active
          ? "bg-gray-500 text-white ring-2 ring-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:ring-gray-500"
          : "bg-gray-300 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        }
        ${className}
      `}
    >
      {label}
    </button>
  );
}
