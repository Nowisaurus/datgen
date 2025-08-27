import React, { useEffect, useState } from "react";

export default function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("login"); // "login" or "register"

  useEffect(() => {
    const handleOpen = (e) => {
      setMode(e.detail || "login");
      setIsOpen(true);
    };

    document.addEventListener("openAuthModal", handleOpen);
    return () => document.removeEventListener("openAuthModal", handleOpen);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[999]"
    >
      <div
        className="relative w-96 p-6 rounded-2xl shadow-2xl bg-white dark:bg-gray-800
                   text-gray-900 dark:text-gray-200 transform transition-transform
                   duration-300 scale-90 animate-scaleIn"
      >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-xl text-gray-600 dark:text-gray-300
                     hover:text-gray-900 dark:hover:text-white transition-colors"
          aria-label="Close Modal"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === "login" ? "Login" : "Register"}
        </h2>

        {/* Form */}
        <form className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded border dark:border-gray-600
                       dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400
                       text-gray-900 dark:text-gray-100"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded border dark:border-gray-600
                       dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400
                       text-gray-900 dark:text-gray-100"
          />
          {mode === "register" && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-2 rounded border dark:border-gray-600
                         dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400
                         text-gray-900 dark:text-gray-100"
            />
          )}
          <button
            type="submit"
            className="w-full py-2 rounded-full bg-gray-700 dark:bg-gray-600 
                       hover:bg-gray-600 dark:hover:bg-gray-500 text-white font-semibold 
                       transition-colors duration-200"
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        {/* Switch mode */}
        <p className="mt-4 text-center text-gray-700 dark:text-gray-300">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                className="text-gray-900 dark:text-gray-100 font-semibold hover:underline"
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="text-gray-900 dark:text-gray-100 font-semibold hover:underline"
                onClick={() => setMode("login")}
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
