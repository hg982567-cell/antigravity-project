"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY,
  CurrencyInfo,
  convertCurrency,
  formatCurrency,
} from "@/lib/currency";

interface CurrencyContextType {
  currentCurrency: string;
  currencyInfo: CurrencyInfo;
  setCurrency: (code: string) => void;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
  availableCurrencies: CurrencyInfo[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);

  useEffect(() => {
    const saved = localStorage.getItem("dropai_display_currency");
    if (saved && SUPPORTED_CURRENCIES[saved]) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (code: string) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setCurrencyState(code);
      localStorage.setItem("dropai_display_currency", code);
    }
  };

  const currencyInfo = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD;

  const formatPrice = (amountInUSD: number): string => {
    const converted = convertCurrency(amountInUSD, "USD", currency);
    return formatCurrency(converted, currency);
  };

  const convertPrice = (amountInUSD: number): number => {
    return convertCurrency(amountInUSD, "USD", currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency: currency,
        currencyInfo,
        setCurrency,
        formatPrice,
        convertPrice,
        availableCurrencies: Object.values(SUPPORTED_CURRENCIES),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
