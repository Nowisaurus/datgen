// src/components/UpgradeModal.jsx
import React, { useState } from "react";
import Paypalbutton from "./Paypalbutton"; // Make sure the path is correct

export default function UpgradeModal({ isOpen, onClose, onUpgrade }) {
  const [showPayment, setShowPayment] = useState(false);

  // NOTE: You can pass these in as props if they are dynamic
  const planName = "Pro Plan";
  const planPrice = "$5.00 / month"; 

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    setShowPayment(false); 
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 m-4 max-w-sm w-full text-center">
        {!showPayment ? (
          // View 1: Initial Upgrade Prompt
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Upgrade to Pro
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You've reached a limit on the free plan. Upgrade now to unlock unlimited rows, advanced features, and more!
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowPayment(true)} 
                className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Upgrade Now
              </button>
              <button
                onClick={handleClose} 
                className="w-full px-4 py-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </>
        ) : (
          // View 2: Payment View (Now with Subscription Content)
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Complete Your Subscription
            </h2>

            {/* --- START: NEW SUBSCRIPTION CONTENT --- */}
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6 text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Plan:</span>
                <span className="text-gray-900 dark:text-gray-100 font-bold">{planName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Price:</span>
                <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">{planPrice}</span>
              </div>
            </div>
            {/* --- END: NEW SUBSCRIPTION CONTENT --- */}

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Select your payment method below to avail the Pro plan.
            </p>

            {/* This is the payment method */}
            <Paypalbutton
              onSuccess={(data) => {
                onUpgrade(data);
                handleClose(); 
              }}
              onCancel={() => {
                setShowPayment(false);
                console.log("User cancelled the payment process.");
              }}
              onError={(err) => {
                console.error("PayPal Payment Error:", err); 
                alert("An error occurred with your payment. Please try again.");
                setShowPayment(false);
              }}
            />
             <button
                onClick={() => setShowPayment(false)} 
                className="w-full px-4 py-2 mt-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Go Back
              </button>
          </>
        )}
      </div>
    </div>
  );
}