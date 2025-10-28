"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SubscriptionContextType {
  isPremium: boolean;
  togglePremium: () => void;
  features: {
    aiGeneration: boolean;
    advancedAnalytics: boolean;
    unlimitedStorage: boolean;
    prioritySupport: boolean;
  };
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);

  // Load premium status from localStorage on mount
  useEffect(() => {
    const savedPremiumStatus = localStorage.getItem("noto-premium-status");
    if (savedPremiumStatus) {
      setIsPremium(JSON.parse(savedPremiumStatus));
    }
  }, []);

  // Save premium status to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("noto-premium-status", JSON.stringify(isPremium));
  }, [isPremium]);

  const togglePremium = () => {
    setIsPremium(!isPremium);
  };

  const features = {
    aiGeneration: isPremium,
    advancedAnalytics: isPremium,
    unlimitedStorage: isPremium,
    prioritySupport: isPremium,
  };

  return (
    <SubscriptionContext.Provider value={{ isPremium, togglePremium, features }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}