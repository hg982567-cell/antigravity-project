"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface DemoContextType {
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
  activeStore: {
    id: string;
    name: string;
    platform: string;
    isConnected: boolean;
  };
  setActiveStore: (store: { id: string; name: string; platform: string; isConnected: boolean }) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [activeStore, setActiveStore] = useState({
    id: "store_1",
    name: "Apex Living USA",
    platform: "SHOPIFY",
    isConnected: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem("dropai_demo_mode");
    if (saved !== null) {
      setIsDemoMode(saved === "true");
    }
  }, []);

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    localStorage.setItem("dropai_demo_mode", String(enabled));
  };

  const toggleDemoMode = () => {
    setDemoMode(!isDemoMode);
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        setDemoMode,
        toggleDemoMode,
        activeStore,
        setActiveStore,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}
