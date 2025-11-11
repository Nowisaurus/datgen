import React, { useEffect, useState } from "react";
import { supabase } from '../supabaseClient'; 

export default function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("login");

  // State to manage the closing animation
  const [isClosing, setIsClosing] = useState(false); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleOpen = (e) => {
      setMode(e.detail || "login");
      setIsOpen(true); 
      setIsClosing(false); // Reset closing state on open
      setError(null);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    };

    document.addEventListener("openAuthModal", handleOpen);
    return () => document.removeEventListener("openAuthModal", handleOpen);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      let authResponse = null;
      if (mode === "register") {
        authResponse = await supabase.auth.signUp({ email, password });
        if (authResponse.error) throw authResponse.error;
        alert("Registration successful! Please check your email to confirm.");
      } else {
        authResponse = await supabase.auth.signInWithPassword({ email, password });
        if (authResponse.error) throw authResponse.error;
      }
      
      handleClose(); // Trigger the close animation on success

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Updated close function to handle animation
  const handleClose = () => {
    // --- THIS IS THE FIX ---
    // If we are already in the process of closing, do nothing.
    // This prevents multiple clicks from firing multiple timeouts.
    if (isClosing) return; 
    // -----------------------

    // 1. Trigger the 'out' animation
    setIsClosing(true); 
    
    // 2. Wait for the animation to finish (300ms)
    setTimeout(() => {
      // 3. Fully unmount the component
      setIsOpen(false); 
    }, 300); // This MUST match the transition duration
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[999]"
      onClick={handleClose} 
    >
      <div
        className={`relative w-96 p-6 rounded-2xl shadow-2xl bg-white dark:bg-gray-800
                   text-gray-900 dark:text-gray-200 transform transition-all
                   duration-300
                   ${isClosing ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={handleClose} 
          className="absolute top-4 right-4 text-xl text-gray-600 dark:text-gray-300
                     hover:text-gray-900 dark:hover:text-white transition-colors"
          aria-label="Close Modal"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === "login" ? "Login" : "Register"}
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          
          {error && (
            <p className="p-2 text-sm text-center text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-200">
              {error}
            </p>
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded border dark:border-gray-600
                       dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400
                       text-gray-900 dark:text-gray-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded border dark:border-gray-600
                       dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400
                       text-gray-900 dark:text-gray-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "register" && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-2 rounded border dark:border-gray-600
                         dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400
                         text-gray-900 dark:text-gray-100"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}
          <button
            type="submit"
            className="w-full py-2 rounded-full bg-gray-700 dark:bg-gray-600 
                       hover:bg-gray-600 dark:hover:bg-gray-500 text-white font-semibold 
                       transition-colors duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Working..." : (mode === "login" ? "Login" : "Register")}
          </button>
        </form>

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