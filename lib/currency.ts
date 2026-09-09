export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rateAgainstUSD: number; // 1 USD = X Currency
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    flag: "🇺🇸",
    rateAgainstUSD: 1.0,
    decimals: 2,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    flag: "🇪🇺",
    rateAgainstUSD: 0.92,
    decimals: 2,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    flag: "🇬🇧",
    rateAgainstUSD: 0.78,
    decimals: 2,
  },
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    flag: "🇮🇳",
    rateAgainstUSD: 83.5,
    decimals: 2,
  },
  AED: {
    code: "AED",
    symbol: "د.إ",
    name: "UAE Dirham",
    flag: "🇦🇪",
    rateAgainstUSD: 3.67,
    decimals: 2,
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    flag: "🇯🇵",
    rateAgainstUSD: 154.2,
    decimals: 0,
  },
  CAD: {
    code: "CAD",
    symbol: "CA$",
    name: "Canadian Dollar",
    flag: "🇨🇦",
    rateAgainstUSD: 1.36,
    decimals: 2,
  },
  AUD: {
    code: "AUD",
    symbol: "AU$",
    name: "Australian Dollar",
    flag: "🇦🇺",
    rateAgainstUSD: 1.51,
    decimals: 2,
  },
};

export const DEFAULT_CURRENCY = "USD";

/**
 * Convert an amount from one currency to another using the centralized rate table.
 */
export function convertCurrency(
  amount: number,
  fromCode: string = DEFAULT_CURRENCY,
  toCode: string = DEFAULT_CURRENCY
): number {
  if (isNaN(amount) || amount === 0) return 0;
  if (fromCode === toCode) return amount;

  const fromInfo = SUPPORTED_CURRENCIES[fromCode] || SUPPORTED_CURRENCIES.USD;
  const toInfo = SUPPORTED_CURRENCIES[toCode] || SUPPORTED_CURRENCIES.USD;

  // Convert from origin to USD first, then to target currency
  const inUSD = amount / fromInfo.rateAgainstUSD;
  const inTarget = inUSD * toInfo.rateAgainstUSD;

  return inTarget;
}

/**
 * Formats a currency value with locale formatting and standard symbols.
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY,
  locale: string = "en-US"
): string {
  const info = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
  const safeAmount = isNaN(amount) ? 0 : amount;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: info.code,
      minimumFractionDigits: info.decimals,
      maximumFractionDigits: info.decimals,
    }).format(safeAmount);
  } catch {
    // Fallback if locale or currency code fails in non-standard runtime
    return `${info.symbol}${safeAmount.toFixed(info.decimals)}`;
  }
}
