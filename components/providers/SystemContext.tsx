"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SystemContextType {
  lockdownActive: boolean;
  lockdownReason: string | null;
  maintenanceMode: boolean;
  platformName: string;
  featureFlags: Record<string, boolean>;
  settings: Record<string, string>;
  plans: any[];
  isFeatureEnabled: (key: string) => boolean;
  refreshSystem: () => Promise<void>;
}

const SystemContext = createContext<SystemContextType>({
  lockdownActive: false,
  lockdownReason: null,
  maintenanceMode: false,
    platformName: "RAVAN SHIPPING",
  featureFlags: {},
  settings: {},
  plans: [],
  isFeatureEnabled: () => true,
  refreshSystem: async () => {},
});

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<{
    lockdownActive: boolean;
    lockdownReason: string | null;
    maintenanceMode: boolean;
    platformName: string;
    featureFlags: Record<string, boolean>;
    settings: Record<string, string>;
    plans: any[];
  }>({
    lockdownActive: false,
    lockdownReason: null,
    maintenanceMode: false,
      platformName: "RAVAN SHIPPING",
    featureFlags: {
      ai_product_research: true,
      ai_ad_creative_studio: true,
      order_auto_fulfillment: true,
      shopify_app_bridge: true,
      high_risk_fraud_hold: true,
    },
    settings: {},
    plans: [],
  });

  const refreshSystem = async () => {
    try {
      const res = await fetch("/api/system/status");
      const json = await res.json();
      if (json) {
        setData({
          lockdownActive: !!json.lockdownActive,
          lockdownReason: json.lockdownReason || null,
          maintenanceMode: !!json.maintenanceMode,
          platformName: json.platformName || "RAVAN SHIPPING",
          featureFlags: json.featureFlags || {},
          settings: json.settings || {},
          plans: json.plans || [],
        });
      }
    } catch {
      // Fallback defaults
    }
  };

  useEffect(() => {
    refreshSystem();
    const interval = setInterval(refreshSystem, 15000); // Poll every 15s for live admin changes
    return () => clearInterval(interval);
  }, []);

  const isFeatureEnabled = (key: string): boolean => {
    if (data.lockdownActive) return false;
    if (data.featureFlags[key] === undefined) return true;
    return !!data.featureFlags[key];
  };

  return (
    <SystemContext.Provider
      value={{
        ...data,
        isFeatureEnabled,
        refreshSystem,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  return useContext(SystemContext);
}

