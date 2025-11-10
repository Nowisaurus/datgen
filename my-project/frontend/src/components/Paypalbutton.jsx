// src/components/Paypalbutton.jsx
import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function Paypalbutton({ onSuccess, onCancel, onError }) {
  
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const planId = import.meta.env.VITE_PAYPAL_PLAN_ID;

  if (!clientId || !planId) {
    console.error("Missing VITE_PAYPAL_CLIENT_ID or VITE_PAYPAL_PLAN_ID");
    console.error("Please check your .env file and restart the Vite server.");
    
    return (
      <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg text-center text-red-700 dark:text-red-200">
        <p className="font-bold">Payment System Error</p>
        <p className="text-sm">Payment provider is not configured correctly.</p>
        <p className="text-xs mt-1">(Check console for details)</p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        "client-id": clientId, 
        vault: true,
        intent: "subscription",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical", color: "gold", shape: "rect", label: "subscribe" }}
        createSubscription={(data, actions) => {
          if (!planId) { 
             console.error("VITE_PAYPAL_PLAN_ID is missing.");
             if (onError) onError(new Error("PayPal Plan ID is not configured."));
             return; 
          }
          return actions.subscription.create({
            plan_id: planId, 
          });
        }}
        // --- FIX IS HERE ---
        // Removed 'actions' as it was unused
        onApprove={(data) => { 
          console.log("Subscription approved:", data);
          if (onSuccess) onSuccess(data);
        }}
        onCancel={(data) => {
          console.log("Subscription cancelled:", data);
          if (onCancel) onCancel();
        }}
        onError={(err) => {
          console.error("PayPal Button SDK Error:", err);
          if (onError) onError(err);
        }}
      />
    </PayPalScriptProvider>
  );
}