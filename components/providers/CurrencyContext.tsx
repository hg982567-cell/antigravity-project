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
  baseCurrency: string;
  baseCurrencyInfo: CurrencyInfo;
  setBaseCurrency: (code: string) => void;
  currentCurrency: string;
  displayCurrency: string;
  currencyInfo: CurrencyInfo;
  setCurrency: (code: string) => void;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
  availableCurrencies: CurrencyInfo[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [baseCurrency, setBaseCurrencyState] = useState<string>("USD");
  const [displayCurrency, setDisplayCurrencyState] = useState<string>(DEFAULT_CURRENCY);

  useEffect(() => {
    const savedBase = localStorage.getItem("ravan_base_currency") || localStorage.getItem("dropai_base_currency");
    if (savedBase && SUPPORTED_CURRENCIES[savedBase]) {
      setBaseCurrencyState(savedBase);
    }

    const savedDisplay = localStorage.getItem("ravan_display_currency") || localStorage.getItem("dropai_display_currency");
    if (savedDisplay && SUPPORTED_CURRENCIES[savedDisplay]) {
      setDisplayCurrencyState(savedDisplay);
    }
  }, []);

  const setBaseCurrency = (code: string) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setBaseCurrencyState(code);
      localStorage.setItem("ravan_base_currency", code);
    }
  };

  const setCurrency = (code: string) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setDisplayCurrencyState(code);
      localStorage.setItem("ravan_display_currency", code);
    }
  };

  const baseCurrencyInfo = SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES.USD;
  const currencyInfo = SUPPORTED_CURRENCIES[displayCurrency] || SUPPORTED_CURRENCIES.USD;

  const formatPrice = (amountInBase: number): string => {
    const converted = convertCurrency(amountInBase, baseCurrency, displayCurrency);
    return formatCurrency(converted, displayCurrency);
  };

  const convertPrice = (amountInBase: number): number => {
    return convertCurrency(amountInBase, baseCurrency, displayCurrency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        baseCurrency,
        baseCurrencyInfo,
        setBaseCurrency,
        currentCurrency: displayCurrency,
        displayCurrency,
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
